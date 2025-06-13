import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as Server from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Auth } from '$lib/components/forms';
import { SMTP_PASSWORD, FORGOT_PASSWORD_DISABLED } from '$env/static/private';

export const load = (async () => {
	return {
		superform: await superValidate(zod(Auth.Schemas.ForgotPasswordFormSchema)),
		emailEnabled: !!SMTP_PASSWORD
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod(Auth.Schemas.ForgotPasswordFormSchema));
		const { data } = form;

		try {
			if (!SMTP_PASSWORD) {
				form.valid = false;
				form.message = 'Password reset is currently unavailable.';
				return { form };
			}

			if (FORGOT_PASSWORD_DISABLED) {
				form.valid = false;
				form.message = 'Password Reset is currently disabled. Sowwy.';
				return { form };
			}

			const response = await Server.Auth.ForgotPassword(locals.pb, data);

			form.valid = response.data;
			form.message = response.notify;
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
