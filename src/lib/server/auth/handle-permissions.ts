import type { UsersRecord } from '$lib/types/pocketbase-types';
import type { RequestEvent } from '@sveltejs/kit';

interface RouteConfig {
	unprotected: string[];
	auth: string[];
}

const routes: RouteConfig = {
	unprotected: ['/about', '/error', '/contact', '/changelog'],
	auth: [
		'/login',
		'/register',
		'/forgot-password',
		'/callback',
		'/confirm-verification',
		'/confirm-password-reset'
	]
};

function isAuthRoute(path: string): boolean {
	if (routes.auth.includes(path)) {
		return true;
	}

	const patternMatch = routes.auth.some((pattern) => path.startsWith(pattern));

	if (patternMatch) {
		return true;
	}

	if (path.startsWith('/_/')) {
		console.log(`Explicitly allowing /_/ route: ${path}`);
		return true;
	}

	return false;
}

function isProtectedRoute(path: string): boolean {
	return !routes.unprotected.includes(path) && !isAuthRoute(path);
}

export function handlePermissions(event: RequestEvent): { permitted: boolean; redirect: string } {
	const { url } = event;
	const user = event.locals.pb.authStore.record as UsersRecord | null;
	const path = url.pathname;

	let permitted: { permitted: boolean; redirect: string } = { permitted: true, redirect: path };

	if (isProtectedRoute(path)) {
		if (!user || user === null) {
			permitted = { permitted: false, redirect: '/login' };
		}
	}

	if (user?.id && isAuthRoute(path)) {
		permitted = { permitted: false, redirect: '/chat' };
	}

	return permitted;
}
