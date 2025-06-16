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

	[userProviders, userContexts] = await Promise.all([
		Server.Providers.GetByUser(locals.pb, user),

		Server.Contexts.GetByUser(locals.pb, user)
	]);

	if (userProviders?.data?.length === 0 && url.pathname != '/welcome') {
		redirect(302, '/welcome');
	}

	if (userContexts.data?.length > 0) {
		currentContext = userContexts.data.find((userContext) => userContext.isActive);
	}

	return {
		user,

		contexts: userContexts.data,
		logoutForm: await superValidate({ id: user?.id }, zod(Auth.Schemas.LogoutSchema)),

		changeContextForm: await superValidate(
			{ active: currentContext?.context?.id, original: currentContext?.context.id },
			zod(Contexts.Schemas.SetContextFormSchema)
		),
		//ideally we don;t send this fuckoff big json every time
		userProviders: userProviders.data,
		createContextForm: await superValidate({}, zod(Contexts.Schemas.CreateContextFormSchema)),
		notifications: [userProviders.notify, userContexts.notify]
	};
};
