import type { Types } from '$lib';
import type {
	ProvidersResponse,
	TypedPocketBase,
	UserContextJunctionResponse
} from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Providers } from '$lib/components/forms';
import { Server } from '..';
import type { Single } from '$lib/types/server';
import { GetPocketBaseFile } from '../utils';

export async function GetAll(pb: TypedPocketBase): Promise<Single<ProvidersResponse[]>> {
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

export async function GetByUser(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Types.Server.Single<Record<string, any>[]>> {
	let error: any | null = null;
	let notify: string = '';
	let providersResponse: Record<string, any>[] = [];

	try {
		const filter = `user="${user?.id}"`;
		const getUserProviders = await pb.collection('userProviders').getFullList({
			expand:
				'provider,provider.providerModelFeaturesJunction_via_provider.model,provider.providerModelFeaturesJunction_via_provider.feature',
			...(filter && { filter })
		});

		if (getUserProviders.length === 0) {
			notify = 'No models found for this user';
			return { data: providersResponse, error, notify };
		}

		// fugg it
		//@ts-ignore
		const flattened = MovePocketBaseExpandsInline(getUserProviders);

		const flattenedWithFiles = GetPocketBaseFile(pb, flattened, ['provider.logo']);

		if (flattenedWithFiles.error) {
			error = flattenedWithFiles.error;
			notify = 'Failed to process files';
			return { data: providersResponse, error, notify };
		}

		providersResponse = flattenedWithFiles.data;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch user models';
		return { data: providersResponse, error, notify };
	}

	return { data: providersResponse, error, notify };
}

export async function GetByID(
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
		const filter = `user="${user?.id}" && provider="${data.provider}"`;

		let checkForDuplicate, getModelForProvider;

		[checkForDuplicate, getModelForProvider] = await Promise.all([
			pb.collection('userProviders').getFullList({ filter, limit: 1 }),
			pb.collection('providerModelFeaturesJunction').getFullList({
				filter: `provider="${data.provider}"`,
				limit: 1
			})
		]);

		const existingUserProvider = checkForDuplicate[0] || null;
		const modelForProvider = getModelForProvider[0] || null;

		console.log('checkForDuplicate status', existingUserProvider);
		console.log('getModelForProvider status', modelForProvider);

		let updateExisting, createUserProvider;

		if (existingUserProvider?.id) {
			// Update existing
			updateExisting = await pb.collection('userProviders').update(existingUserProvider.id, {
				apiKey: data.apiKey
			});

			if (!updateExisting.id) {
				error = "Couldn't update key";
				notify = "Couldn't update key";
				return { data: addKeyResponse, error, notify };
			}

			addKeyResponse = updateExisting;
		} else {
			// Create new userProvider link
			const createUserProviderBody = {
				user: user?.id,
				provider: data.provider,
				apiKey: data.apiKey
			};

			createUserProvider = await pb.collection('userProviders').create(createUserProviderBody);

			if (!createUserProvider.id) {
				error = 'Something went wrong in userProviders';
				notify = "Couldn't create key";
				return { data: addKeyResponse, error, notify };
			}

			addKeyResponse = createUserProvider;
		}

		if (!modelForProvider?.id) {
			error = "Can't find a model for this provider";
			notify = "Can't find a model for this provider";
			return { data: addKeyResponse, error, notify };
		}

		const setDefaultForContext = await SetDefaultForContext(pb, user, {
			model: modelForProvider.model,
			provider: data?.provider
		});

		if (!setDefaultForContext?.data?.id) {
			error = 'Something went wrong fetching settings';
			notify = "Couldn't find the user settings";
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

export async function UpdateKeyForProvider(
	pb: TypedPocketBase,
	user: AuthRecord,
	userProviderID: string,
	data: Providers.Schemas.AddKeyFormData
) {
	let error: any | null = null;
	let notify: string = '';
	let updateKeyResponse;

	try {
		// update userProvider link
		const updateUserProviderBody = {
			user: user?.id,
			provider: data.provider,
			apiKey: data.apiKey
		};

		const updateKeyResponse = await pb
			.collection('userProviders')
			.update(userProviderID, updateUserProviderBody);
		if (!updateKeyResponse.id) {
			error = 'Something went wrong in userProviders';
			notify = "Couldn't update key";
			return { data: updateKeyResponse, error, notify };
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to update providers for user';
		return { data: updateKeyResponse, error, notify };
	}
	return { data: updateKeyResponse, error, notify };
}

export async function SetDefaultForContext(
	pb: TypedPocketBase,
	user: AuthRecord,
	data: {
		model: string;
		provider: string;
	}
): Promise<Single<UserContextJunctionResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let defaultKeysResponse: UserContextJunctionResponse = {} as UserContextJunctionResponse;

	try {
		const filter = `user="${user?.id}" && isActive=true`;
		let activeContexts = await pb.collection('userContextJunction').getFullList({
			filter
		});

		if (activeContexts.length > 0) {
			// Need to get the userProvider ID for this user/provider combo
			const userProviderFilter = `user="${user?.id}" && provider="${data.provider}"`;
			const userProviders = await pb.collection('userProviders').getFullList({
				filter: userProviderFilter,
				limit: 1
			});

			const userProvider = userProviders[0];
			if (!userProvider) {
				error = 'No userProvider found for this user/provider combination';
				notify = 'Provider not configured for this user';
				return { data: defaultKeysResponse, error, notify };
			}

			const batch = pb.createBatch();
			activeContexts.forEach((record) => {
				batch.collection('userContextJunction').update(record.id, {
					defaultModel: data.model,
					defaultProvider: userProvider.id
				});
			});

			try {
				const batchResponse = await batch.send();
				defaultKeysResponse = batchResponse[0].body;
			} catch (batchError) {
				error = batchError;
				notify = `Failed to update context defaults`;
				return { data: defaultKeysResponse, error, notify };
			}
		} else {
			error = 'No active contexts found';
			notify = 'No active contexts found for this user';
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to set context defaults';
	}

	return { data: defaultKeysResponse, error, notify };
}
