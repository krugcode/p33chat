import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Chats, Providers } from '$lib/components/forms';

export const load = (async ({ locals }) => {
	const user = locals.pb.authStore.record;
	let providers, currentContext, salt;
	[providers, currentContext, salt] = await Promise.all([
		Server.Providers.GetAll(locals.pb),
		Server.Contexts.GetActive(locals.pb, user),
		Server.Auth.GetOrCreateUserSalt(locals.pb, user)
	]);

	return {
		currentContext: currentContext.data,
		superform: await superValidate(
			{
				model: currentContext?.data?.defaultModel?.id,
				provider: currentContext?.data?.defaultProvider?.provider?.id
			},
			zod(Chats.Schemas.ChatFormSchema)
		),
		providers: providers.data,
		salt: salt.data,
		addKeySuperform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)),
		notifications: [providers.notify]
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	chatInit: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Chats.Schemas.ChatFormSchema));
		const user = locals.pb.authStore.record;
		if (!user) {
			redirect(302, '/login');
		}
		const { data } = form;
		try {
			const response = await Server.Chats.CreateInitialChat(locals.pb, user, data);

			if (!response?.data?.id) {
				form.valid = false;
				form.message = response.notify;
				return { form };
			}

			if (response.data.shouldStream) {
				form.valid = true;
				form.data = {
					...response.data,
					chat: response.data.chat
				};
				form.message = response.notify;
				return { form };
			} else {
				//no streaming, redirect
				redirect(302, `/chat/${response.data.chat}`);
			}
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			const errorObj = error as ClientResponseError;
			console.log('Error creating chat:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
