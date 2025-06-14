import type { Types } from '$lib';
import type { ProvidersResponse, TypedPocketBase } from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Providers } from '$lib/components/forms';
import { Server } from '..';
import type { Single } from '$lib/types/server';
import { GetPocketBaseFile } from '../utils';

export async function GetAllProviders(pb: TypedPocketBase): Promise<Single<ProvidersResponse[]>> {
	let error: any | null = null;
	let notify: string = '';
	let providers: ProvidersResponse[] = [];

	try {
		const getProviders = await pb.collection('providers').getFullList();
		const providersWithFiles = GetPocketBaseFile(pb, getProviders, ['logo']);
		if (providersWithFiles.error) {
			error = providersWithFiles.error;
			notify = 'Unable to load files from the server';
			return { data: providers, error, notify };
		}
		providers = providersWithFiles.data;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Something went wrong with the providers';
		return { data: providers, error, notify };
	}

	return { data: providers, error, notify };
}

export async function GetProvidersByUser(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Types.Server.Single<Types.Generic.UserProviderWithProvider[]>> {
	let error: any | null = null;
	let notify: string = '';
	let modelsResponse: Types.Generic.UserProviderWithProvider[] = [];

	try {
		const filter = `user="${user?.id}" `;

		const getModel = await pb.collection('userProviders').getFullList({
			sort: '-created',
			expand: 'providers',
			...(filter && { filter })
		});

		if (getModel.length === 0) {
			notify = 'No models found for this user';
			return { data: modelsResponse, error, notify };
		}
		// fugg it
		//@ts-ignore
		const flattened = MovePocketBaseExpandsInline(getModel);
		modelsResponse = flattened as Types.Generic.UserProviderWithProvider[];
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch user models';
		return { data: modelsResponse, error, notify };
	}

	return { data: modelsResponse, error, notify };
}

export async function GetProviderByID(
	pb: TypedPocketBase,
	providerID: string
): Promise<Single<ProvidersResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let provider: ProvidersResponse = {} as ProvidersResponse;

	try {
		provider = await pb.collection('providers').getOne(providerID);
		if (!provider.id) {
			error = 'Oopsie, something went wrong';
			notify = "Couldn't fetch provider";
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch provider';
	}
	return { data: provider, error, notify };
}

export async function CreateKeyForProvider(
	pb: TypedPocketBase,
	user: AuthRecord,
	data: Providers.Schemas.AddKeyFormData
) {
	let error: any | null = null;
	let notify: string = '';
	let addKeyResponse;

	try {
		// create userProvider link
		const createUserProviderBody = {
			user: user?.id,
			provider: data.provider,
			apiKey: data.apiKey
		};

		let createUserProvider, getDefaultKey;
		[createUserProvider, getDefaultKey] = await Promise.all([
			pb.collection('userProviders').create(createUserProviderBody),
			Server.Users.GetSettingsByUser(pb, user)
		]);
		if (!createUserProvider.id) {
			error = 'Something went wrong in userProviders';
			notify = "Couldn't create key";
			return { data: addKeyResponse, error, notify };
		}

		addKeyResponse = createUserProvider;

		if (!getDefaultKey?.data?.id) {
			error = 'Something went wrong fetching settings';
			notify = "Couldn't find the user settings";
		}

		if (!getDefaultKey?.data?.defaultProvider) {
			const setDefaultKey = await Server.Users.UpdateUserSettings(pb, user, {
				key: 'defaultProvider',
				value: createUserProvider.id
			});
			if (setDefaultKey.error) {
				error = setDefaultKey.error;
				notify = setDefaultKey.notify;
			}
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch providers for user';
		return { data: addKeyResponse, error, notify };
	}
	return { data: addKeyResponse, error, notify };
}

export async function DeleteAllKeysForUser(pb: TypedPocketBase, user: AuthRecord) {
	let error: any | null = null;
	let notify: string = '';
	let deleteAllKeysResponse;

	const batch = pb.createBatch();
	try {
		const userProviders = await pb.collection('userProviders').getFullList({
			filter: `user = "${user?.id}"`
		});
		if (userProviders.length === 0) {
			error = 'None found';
			notify = 'No keys for user';
		}
		userProviders.forEach((record) => {
			batch.collection('userProviders').delete(record.id);
		});
		const batchResponse = await batch.send();
		if (batchResponse !== null) {
			error = batchResponse;
			notify = `Failed to delete ${batchResponse.length} keys`;
		}
		deleteAllKeysResponse = batchResponse;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch providers for user';
		return { data: deleteAllKeysResponse, error, notify };
	}

	return { data: deleteAllKeysResponse, error, notify };
}
