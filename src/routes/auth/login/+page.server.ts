import { fail, type Actions } from '@sveltejs/kit';
import type { ClientResponseError } from 'pocketbase';
import type { PageServerLoad } from './$types';

import { superValidate } from 'sveltekit-superforms';
import { LoginFormSchema } from '$lib/forms/account/auth/login-form/login-form.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { account } from '$lib/pb';

export const load = (async () => {
  return { superform: await superValidate(zod(LoginFormSchema)) };
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async ({ locals, request }) => {
    const form = await superValidate(request, zod(LoginFormSchema));
    const { data } = form;
    try {
      const response = await account.login(locals.pb, data);

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
