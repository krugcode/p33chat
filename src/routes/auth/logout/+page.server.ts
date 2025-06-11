import { z } from 'zod';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const LogoutSchema = z.object({
  id: z.string()
});

export const actions: Actions = {
  logout: async ({ request, locals }) => {
    const form = await superValidate(request, zod(LogoutSchema));
    console.log('Logging Out');
    if (!form.valid) {
      return fail(400, { form });
    }
    locals.pb.authStore.clear();
    return redirect(302, '/auth/login');
  }
};
