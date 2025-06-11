import type { TypedPocketBase, UsersRecord } from '$lib/types/pocketbase-types';

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

export async function Register(
	pb: TypedPocketBase,
	data: Auth.Schemas.RegisterFormData
): Promise<Single<UsersRecord>> {
	let error: any = null;
	let message: string = '';
	let user: UsersRecord = {} as UsersRecord;

	try {
		user = await pb.collection('users').create(data);
	} catch (e: any) {
		error = e;
		message = e.message;
		if (error.response.data.email.code === 'validation_not_unique') {
			message = 'User already exists';
		}

		return { data: user, error, message };
	}
	return { data: user, error, message };
}

export async function ForgotPassword(
	pb: TypedPocketBase,
	data: Auth.Schemas.ForgotPasswordFormData
): Promise<Single<boolean>> {
	let error: any = null;
	let message: string = '';
	let success: boolean = false;

	const { email } = data;

	try {
		success = await pb.collection('users').requestPasswordReset(email);
	} catch (e: any) {
		error = e;
		message = e.message;

		return { data: success, error, message };
	}
	return { data: success, error, message };
}
