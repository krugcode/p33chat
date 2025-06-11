import type { TypedPocketBase } from '$lib/types/pocketbase-types';

import type { RecordAuthResponse } from 'pocketbase';
import type { Single } from '$lib/types/server';
import type { Auth } from '$lib/components/forms';

export async function Login(
	pb: TypedPocketBase,
	data: Auth.Schemas.LoginFormData
): Promise<Single<RecordAuthResponse>> {
	let error: any = null;
	let message: string = '';
	let user: RecordAuthResponse = {} as RecordAuthResponse;

	const { email, password } = data;
	try {
		user = await pb.collection('users').authWithPassword(email, password);
	} catch (e: any) {
		error = e;
		message = e.message;

		return { data: user, error, message };
	}
	return { data: user, error, message };
}
