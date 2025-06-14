import { Auth, Contexts } from '$lib/components/forms';
import { Server } from '$lib/server';
import { redirect } from '@sveltejs/kit';
import type { AuthRecord } from 'pocketbase';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.pb.authStore.record as AuthRecord | null;
	let userProviders, settings, contexts, currentContext;

	if (!user) {
		redirect(302, '/login');
	}
	[userProviders, settings, contexts] = await Promise.all([
		Server.Providers.GetByUser(locals.pb, user),
		Server.Users.GetByUser(locals.pb, user),
		Server.Contexts.GetByUser(locals.pb, user)
	]);

	if (userProviders.data.length === 0 && url.pathname != '/welcome') {
		redirect(302, '/welcome');
	}
	if (contexts.data?.length > 0) {
		currentContext = contexts.data.find((context) => context.isActive);
	}
	console.log('current', currentContext);
	return {
		user,
		settings: settings.data,
		contexts: contexts.data,
		logoutForm: await superValidate({ id: user?.id }, zod(Auth.Schemas.LogoutSchema)),
		changeContextForm: await superValidate(
			{ active: currentContext?.id, original: currentContext?.id },
			zod(Contexts.Schemas.SetContextFormSchema)
		),
		createContextForm: await superValidate({}, zod(Contexts.Schemas.CreateContextFormSchema)),
		notifications: [settings.notify, userProviders.notify, contexts.notify]
	};
};
