import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Chats, Providers } from '$lib/components/forms';

export const load = (async ({ locals, params }) => {
	const chatID = params.id;
	const user = locals.pb.authStore.record;
	let providers, currentContext, salt, messages;
	[providers, currentContext, salt, messages] = await Promise.all([
		Server.Providers.GetAll(locals.pb),
		Server.Contexts.GetActive(locals.pb, user),
		Server.Auth.GetOrCreateUserSalt(locals.pb, user),
		Server.Chats.FetchChatMessages(locals.pb, chatID)
	]);

	// TODO: redirects on chat context != currentContext

	return {
		currentContext: currentContext.data,
		messages: messages.data,
		superform: await superValidate(
			{
				chat: chatID,
				model: currentContext?.data?.defaultModel?.id,
				provider: currentContext?.data?.defaultProvider?.provider?.id
			},
			zod(Chats.Schemas.ChatFormSchema)
		),
		providers: providers.data,
		salt: salt.data,
		addKeySuperform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)),
		notifications: [providers.notify, messages.notify]
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	sendMessage: async ({ locals, request, params }) => {
		const chatID = params.id;
		const form = await superValidate(request, zod(Chats.Schemas.ChatFormSchema));
		const user = locals.pb.authStore.record;

		if (!user) {
			redirect(302, '/login');
		}

		if (!chatID) {
			redirect(302, '/chat');
		}

		const { data } = form;

		try {
			// 1. Create user message
			const userMessageResponse = await Server.Chats.CreateMessage(locals.pb, user, 'User', data);

			if (!userMessageResponse?.data?.id) {
				form.valid = false;
				form.message = userMessageResponse.notify;
				return { form };
			}

			// 2. Get conversation history for AI context
			const messagesResponse = await Server.Chats.FetchChatMessages(locals.pb, chatID);

			if (!messagesResponse.data) {
				form.valid = true;
				form.message = 'User message sent, but failed to fetch conversation history';
				return { form };
			}

			// 3. Convert to AI format
			const messages = messagesResponse.data.map((msg) => ({
				role: msg.role.toLowerCase(),
				content: msg.message,
				timestamp: msg.created
			}));
			console.log(messages[0]);

			// 4. Get provider and model from form data or context
			const provider = data.provider; // or get from context
			const model = data.model; // or get from context

			// 5. Generate AI response based on provider
			let aiResponse;

			if (provider === 'openai') {
				// Import the message module directly since exports might not be set up yet
				const { chatSimple } = await import('$lib/server/ai/chatgpt/message');
				aiResponse = await chatSimple(messages, {
					model: model || 'gpt-4',
					temperature: 0.7,
					maxTokens: 2000
				});
			} else if (provider === 'anthropic') {
				// You'll need to create claude/message.ts with similar chatSimple function
				try {
					const { chatSimple } = await import('$lib/server/ai/claude/message');
					aiResponse = await chatSimple(messages, {
						model: model || 'claude-3-5-sonnet-20241022',
						temperature: 0.7,
						maxTokens: 2000
					});
				} catch {
					aiResponse = {
						success: false,
						error: 'Claude integration not yet implemented'
					};
				}
			} else {
				// Default or handle other providers
				aiResponse = {
					success: false,
					error: `Provider ${provider} not supported`
				};
			}

			// 6. Save AI response if successful
			if (aiResponse.success && aiResponse.fullResponse) {
				const assistantMessageData = {
					chat: chatID,
					model: data.model,
					provider: data.provider,
					message: aiResponse.fullResponse, // This is the main content field
					content: aiResponse.fullResponse // Keep both for compatibility
				};

				await Server.Chats.CreateMessage(locals.pb, 'Assistant', assistantMessageData);
			}

			form.valid = true;
			form.message = aiResponse.success
				? 'Message sent and AI responded'
				: `Message sent, but AI error: ${aiResponse.error}`;

			return { form };
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			const errorObj = error as ClientResponseError;
			console.log('Error in sendMessage:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
