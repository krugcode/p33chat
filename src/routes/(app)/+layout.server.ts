import { Auth } from '$lib/components/forms';
import type { UsersResponse } from '$lib/types/pocketbase-types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	const user = locals.pb.authStore.record as UsersResponse | null;

	return {
		user,
		logoutForm: await superValidate({ id: user?.id }, zod(Auth.Schemas.LogoutSchema))
	};
};
