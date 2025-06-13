import { Auth } from '$lib/components/forms';
import { Server } from '$lib/server';
import { redirect } from '@sveltejs/kit';
import type { AuthRecord } from 'pocketbase';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.pb.authStore.record as AuthRecord | null;
	let providers, settings;

	if (!user) {
		redirect(302, '/login');
	}
	[providers, settings] = await Promise.all([
		Server.Providers.GetProvidersByUser(locals.pb, user),
		Server.Users.GetSettingsByUser(locals.pb, user)
	]);

	if (providers.data.length === 0 && url.pathname != '/welcome') {
		redirect(302, '/welcome');
	}

	return {
		user,
		settings: settings.data,
		logoutForm: await superValidate({ id: user?.id }, zod(Auth.Schemas.LogoutSchema)),
		notifications: [settings.notify, providers.notify]
	};
};
