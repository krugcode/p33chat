import { fail, type Actions, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { Auth } from '$lib/components/forms';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(Auth.Schemas.LogoutSchema));
		console.log('Logging Out');
		if (!form.valid) {
			return fail(400, { form });
		}
		locals.pb.authStore.clear();
		return redirect(302, '/login');
	}
};
