import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as Server from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Auth } from '$lib/components/forms';

export const load = (async () => {
	return { superform: await superValidate(zod(Auth.Schemas.LoginFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Auth.Schemas.LoginFormSchema));
		const { data } = form;
		try {
			const response = await Server.Auth.Login(locals.pb, data);

			if (response.data.token) {
				form.valid = true;
				form.message = response.message;
				return { form };
			} else {
				form.valid = false;
				form.message = response.message;
				return { form };
			}
		} catch (error) {
			const errorObj = error as ClientResponseError;
			console.log('Error Logging in:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
