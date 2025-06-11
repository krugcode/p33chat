import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as Server from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Auth } from '$lib/components/forms';
import { BREVO_API_KEY } from '$env/static/private';

export const load = (async () => {
	return {
		superform: await superValidate(zod(Auth.Schemas.ForgotPasswordFormSchema)),
		emailEnabled: !!BREVO_API_KEY
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Auth.Schemas.ForgotPasswordFormSchema));
		const { data } = form;

		try {
			if (!BREVO_API_KEY) {
				form.valid = false;
				form.message = 'Password reset is currently unavailable.';
				return { form };
			}
			const response = await Server.Auth.ForgotPassword(locals.pb, data);

			form.valid = response.data;
			form.message = response.message;
			return { form };
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			const errorObj = error as ClientResponseError;
			console.log('Error Requesting Password Reset:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
