import type { Types } from '$lib';
import type {
	TypedPocketBase,
	UserProvidersRecord,
	UserSettingsResponse
} from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Users } from '$lib/components/forms';
import type { Single } from '$lib/types/server';

export type UserSettingsWithProvider = Omit<UserSettingsResponse, 'expand'> & {
	providers: UserProvidersRecord;
};

export async function Create(
	pb: TypedPocketBase,
	userID: string
): Promise<Single<UserSettingsResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let settingsResponse: UserSettingsResponse = {} as UserSettingsResponse;

	try {
		const createUserSettings = {
			user: userID
		};
		settingsResponse = await pb.collection('userSettings').create(createUserSettings);
		if (!settingsResponse.id) {
			error = '';
			notify = '';
			return { data: settingsResponse, error, notify };
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to create user settings';
		return { data: settingsResponse, error, notify };
	}

	return { data: settingsResponse, error, notify };
}

export async function GetByUser(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Types.Server.Single<UserSettingsWithProvider>> {
	let error: any | null = null;
	let notify: string = '';
	let settingsResponse: UserSettingsWithProvider = {} as UserSettingsWithProvider;

	try {
		let filter = `user="${user?.id}" `;
		// TODO: using getone would be faster for these ops, if im pedantic
		let getSettings = await pb.collection('userSettings').getFirstListItem(filter, {
			expand: 'userProviders'
		});

		if (!getSettings.id) {
			notify = 'No settings found for this user';
			return { data: settingsResponse, error, notify };
		}

		const flattened = MovePocketBaseExpandsInline(getSettings as UserSettingsWithProvider);
		settingsResponse = flattened as UserSettingsWithProvider;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch user models';
		return { data: settingsResponse, error, notify };
	}

	return { data: settingsResponse, error, notify };
}

export async function Update(
	pb: TypedPocketBase,
	user: AuthRecord,
	data: Users.Schemas.UpdateSettingsFormData
) {
	let error: any | null = null;
	let notify: string = '';
	let updateSettingsResponse;

	try {
		let filter = `user="${user?.id}"`;
		let getSetting = await pb.collection('userSettings').getFirstListItem(filter, {});
		if (!getSetting.id) {
			error = 'Something went wrong fetching userSettings';
			notify = 'No models found for these settings';
			return { data: updateSettingsResponse, error, notify };
		}
		let updateUserData = {
			[data.key]: data.value
		};
		let updateSetting = await pb.collection('userSettings').update(getSetting.id, updateUserData);
		if (!updateSetting.id) {
			error = 'Something went wrong in userSettings';
			notify = 'No settings found for this user';
			return { data: updateSettingsResponse, error, notify };
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch providers for user';
		return { data: updateSettingsResponse, error, notify };
	}
	return { data: updateSettingsResponse, error, notify };
}
