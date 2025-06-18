import { Auth, Contexts } from '$lib/components/forms';
import { Server } from '$lib/server';
import { redirect } from '@sveltejs/kit';
import type { AuthRecord } from 'pocketbase';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.pb.authStore.record as AuthRecord | null;
	let userProviders, userContexts, currentContext;

	if (!user) {
		redirect(302, '/login');
	}

	[userProviders, userContexts, currentContext] = await Promise.all([
		Server.Providers.GetByUser(locals.pb, user),

		Server.Contexts.GetByUser(locals.pb, user),
		Server.Contexts.GetActive(locals.pb, user)
	]);

	if (userProviders?.data?.length === 0 && url.pathname != '/welcome') {
		redirect(302, '/welcome');
	}

	if (url.pathname === '/welcome' && userProviders?.data?.length > 0) {
		redirect(302, '/chat');
	}
	if (url.pathname === '/' && userProviders?.data?.length > 0) {
		redirect(302, '/chat');
	}

	return {
		user,
		currentContext: currentContext.data,
		contexts: userContexts.data,
		logoutForm: await superValidate({ id: user?.id }, zod(Auth.Schemas.LogoutSchema)),

		changeContextForm: await superValidate(
			{ active: currentContext?.data?.id, original: currentContext?.data?.id },
			zod(Contexts.Schemas.SetContextFormSchema)
		),
		//ideally we don;t send this fuckoff big json every time
		userProviders: userProviders.data,
		createContextForm: await superValidate({}, zod(Contexts.Schemas.CreateContextFormSchema)),
		notifications: [userProviders.notify, userContexts.notify]
	};
};
