import { sequence } from '@sveltejs/kit/hooks';
import PocketBase from 'pocketbase';

import { redirect, type Handle } from '@sveltejs/kit';
import { handlePermissions } from '$lib/server/auth/handle-permissions';
import { GetPocketBase } from '$lib/server/utils';

export const authentication: Handle = async ({ event, resolve }) => {
	event.locals.pb = GetPocketBase();

	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		event.locals.pb.authStore.isValid && (await event.locals.pb.collection('users').authRefresh());
	} catch (_) {
		event.locals.pb.authStore.clear();
	}

	const response = await resolve(event);

	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({
			secure: false,
			sameSite: 'Lax',
			httpOnly: true,
			path: '/'
		})
	);

	return response;
};

export const authorization: Handle = async ({ event, resolve }) => {
	if (!handlePermissions(event).permitted) {
		const redirectUrl = handlePermissions(event).redirect;
		return redirect(302, redirectUrl);
	}
	return resolve(event);
};

export const handle = sequence(authentication, authorization);
