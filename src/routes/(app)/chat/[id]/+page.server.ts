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

			form.valid = true;
			form.data = userMessageResponse.data;
			form.message = userMessageResponse.notify;

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
