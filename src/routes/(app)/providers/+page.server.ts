import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Providers } from '$lib/components/forms';

export const load = (async () => {
	return { superform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	addKey: async ({ locals, request }) => {
		const user = locals.pb.authStore.record;
		const form = await superValidate(request, zod(Providers.Schemas.AddKeyFormSchema));
		const { data } = form;

		try {
			const response = await Server.Providers.CreateKeyForProvider(locals.pb, user, data);

			if (response.data) {
				form.valid = true;
				form.message = 'Key Added!';
				return { form };
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
			console.log('Error Logging in:', errorObj);
			form.valid = false;
			form.message = errorObj.message;
			return fail(500, { form });
		}
	}
};
