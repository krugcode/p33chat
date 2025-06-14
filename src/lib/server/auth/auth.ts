import type { TypedPocketBase, UsersRecord } from '$lib/types/pocketbase-types';

import type { AuthRecord, RecordAuthResponse } from 'pocketbase';
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

export async function GetOrCreateUserSalt(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Single<string>> {
	let error: any = null;
	let notify: string = '';
	let salt: string = '';

	try {
		if (!user?.id) {
			error = 'User not found';
			notify = 'User not found';
			return { data: salt, error, notify };
		}

		try {
			const existingSalt = await pb.collection('userSalts').getFirstListItem(`user="${user?.id}"`);
			salt = existingSalt.salt;
		} catch (notFoundError) {
			// salt doesn't exist, create a new one
			const newSaltBytes = new Uint8Array(32);
			crypto.getRandomValues(newSaltBytes);
			const newSalt = btoa(String.fromCharCode(...newSaltBytes));

			const created = await pb.collection('userSalts').create({
				user: user?.id,
				salt: newSalt
			});

			if (!created.salt) {
				error = 'Oopsie something went wrong with salt creation';
				notify = 'Error during salt creation, please check the pocketbase logs';
				return { data: salt, error, notify };
			}

			salt = created.salt;
			notify = 'New encryption salt created';
		}
	} catch (e: any) {
		error = e;
		notify = e.notify ?? 'Failed to get or create user salt';
		return { data: salt, error, notify };
	}

	return { data: salt, error, notify };
}
