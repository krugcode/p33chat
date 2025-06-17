import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Server } from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Contexts, Providers } from '$lib/components/forms';

export const load = (async () => {
	return { superform: await superValidate(zod(Providers.Schemas.AddKeyFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	setActive: async ({ locals, request, params }) => {
		const { id } = params;
		const user = locals.pb.authStore.record;
		const form = await superValidate(request, zod(Contexts.Schemas.SetContextFormSchema));
		const { data } = form;

		if (!id) {
			form.valid = false;
			form.message = 'No ID provided for context';

			return { form };
		}
		try {
			const setActive = await Server.Contexts.SetActive(locals.pb, user, id);
			if (!setActive.data.id) {
				form.valid = false;
				form.message = setActive.notify;

				return { form };
			}
			form.data.active = setActive.data.id;
			form.data.original = setActive.data.id;
			form.valid = true;
			form.message = 'Context changed!';

			redirect(302, '/chat');
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
