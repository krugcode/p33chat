import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Auth } from '$lib/components/forms';

export const load = (async () => {
	return { superform: await superValidate(zod(Auth.Schemas.RegisterFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Auth.Schemas.RegisterFormSchema));
		const { data } = form;

		try {
			const response = await Server.Auth.Register(data);

			if (!response?.data?.id) {
				form.valid = false;
				form.message = response.notify;
				return { form };
			}

			const authenticateResponse = await Server.Auth.Login({
				email: data.email,
				password: data.password
			});

			if (authenticateResponse.data.token) {
				redirect(302, '/');
			} else {
				form.valid = false;
				form.message = response.notify;
				return { form };
			}
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			const errorObj = error as ClientResponseError;
			console.log('Error Registering:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
