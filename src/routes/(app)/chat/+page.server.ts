import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as Server from '$lib/server';
import type { ClientResponseError } from 'pocketbase';
import { Auth, Chats } from '$lib/components/forms';

export const load = (async () => {
  return { superform: await superValidate(zod(Chats.Schemas.ChatFormSchema)), messages: [] };
}) satisfies PageServerLoad;

export const actions: Actions = {
  // oi m8 u lookin fer a cheeky chat, innit?
  chatInit: async ({ locals, request }) => {
    const form = await superValidate(request, zod(Chats.Schemas.ChatFormSchema));
    const user = locals.pb.authStore.record;
    if (!user) {
      redirect(302, '/login');
    }
    const { data } = form;

    try {
      const response = await Server.Chats.CreateInitialChat(locals.pb, user, data);

      if (response.data.messages.length > 0) {
        redirect(302, `/chat/${response.data.chat}`);
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
