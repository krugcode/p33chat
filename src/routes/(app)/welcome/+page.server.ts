import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { AuthRecord, ClientResponseError } from 'pocketbase';
import { Providers } from '$lib/components/forms';

export const load = (async ({ locals }) => {
	const user = locals.pb.authStore.record as AuthRecord | null;
	let providers, salt;

	[providers, salt] = await Promise.all([
		Server.Providers.GetAll(locals.pb),
		Server.Auth.GetOrCreateUserSalt(locals.pb, user)
	]);

	return {
		superform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)),
		providers: providers.data,
		salt: salt.data,
		notifications: [providers.notify, salt.notify]
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Providers.Schemas.AddKeyFormSchema));
		const { data } = form;

		try {
			// const response = await Server.Auth.Login(locals.pb, data);
			//
			// if (response.data.token) {
			//   redirect(302, '/');
			// } else {
			//   form.valid = false;
			//   form.message = response.notify;
			//   return { form };
			// }
		} catch (error) {
			// we have to check if the throw is a redirect because life is a joke
			// i am a creature of HATE
			if (isRedirect(error)) {
				throw error;
			}
			const errorObj = error as ClientResponseError;
			console.log('Error Logging in:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
