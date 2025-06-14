import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Contexts, Providers } from '$lib/components/forms';

export const load = (async () => {
	return { superform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = locals.pb.authStore.record;
		const form = await superValidate(request, zod(Contexts.Schemas.CreateContextFormSchema));

		const { data } = form;

		try {
			const response = await Server.Contexts.Create(locals.pb, user, data);

			if (!response.data?.id) {
				form.valid = false;
				form.message = response.notify;
				return { form };
			}
			const setActive = await Server.Contexts.SetActive(locals.pb, user, response.data.id);
			if (!setActive.data.id) {
				form.valid = false;
				form.message = response.notify;
				return { form };
			}
			form.valid = true;
			form.message = 'Context created!';
			return message(form, { notifications: ['Context created!'] });
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
