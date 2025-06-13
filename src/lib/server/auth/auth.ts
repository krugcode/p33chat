import type { TypedPocketBase, UsersRecord } from '$lib/types/pocketbase-types';

import type { RecordAuthResponse } from 'pocketbase';
import type { Single } from '$lib/types/server';
import type { Auth } from '$lib/components/forms';
import { Server } from '..';

export async function Login(
	pb: TypedPocketBase,
	data: Auth.Schemas.LoginFormData
): Promise<Single<RecordAuthResponse>> {
	let error: any = null;
	let notify: string = '';
	let user: RecordAuthResponse = {} as RecordAuthResponse;

	const { email, password } = data;
	try {
		user = await pb.collection('users').authWithPassword(email, password);
	} catch (e: any) {
		error = e;
		notify = e.notify;

		return { data: user, error, notify };
	}
	return { data: user, error, notify };
}

export async function Register(
	pb: TypedPocketBase,
	data: Auth.Schemas.RegisterFormData
): Promise<Single<UsersRecord>> {
	let error: any = null;
	let notify: string = '';
	let user: UsersRecord = {} as UsersRecord;

	try {
		user = await pb.collection('users').create(data);
		if (!user.id) {
			error = 'Oopsie something went wrong with registration';
			notify = 'Error during registration, please check the pocketbase logs';
		}
		//create settings.. add any defaults here
		const createSettings = await Server.Users.CreateUserSettings(pb, user.id);
		if (createSettings.error) {
			error = createSettings.error;
			notify = createSettings.notify ?? 'An error occurred while creating user settings';
			return { data: user, error, notify };
		}
	} catch (e: any) {
		error = e;
		notify = e.notify;
		if (error.response.data.email.code === 'validation_not_unique') {
			notify = 'User already exists';
		}
		return { data: user, error, notify };
	}
	return { data: user, error, notify };
}

export async function ForgotPassword(
	pb: TypedPocketBase,
	data: Auth.Schemas.ForgotPasswordFormData
): Promise<Single<boolean>> {
	let error: any = null;
	let notify: string = '';
	let success: boolean = false;

	const { email } = data;

	try {
		success = await pb.collection('users').requestPasswordReset(email);

		if (!success) {
			error = 'Oopsie something went wrong with forgot password';
			notify = 'Error during forgot password, please check the pocketbase logs';
		}
	} catch (e: any) {
		error = e;
		notify = e.notify;

		return { data: success, error, notify };
	}
	return { data: success, error, notify };
}
