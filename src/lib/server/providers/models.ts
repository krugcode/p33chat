import type { Types } from '$lib';
import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { AuthRecord } from 'pocketbase';

// export async function GetModelsByUser(
// 	pb: TypedPocketBase,
// 	user: AuthRecord
// ): Promise<Types.Server.Single<Types.Generic.UserModelWithProvider[]>> {
// 	let error: any | null = null;
// 	let notify: string = '';
// 	let modelsResponse: Types.Generic.UserModelWithProvider[] = [];
//
// 	try {
// 		const filter = `user="${user?.id}" `;
// 		// need the models of a userProvider
// 		const getProviders = await pb.collection('userProviders').getFullList({
// 			sort: '-created',
// 			...(filter && { filter })
// 		});
//
// 		if (getProviders.length === 0) {
// 			notify = 'No providers found for this user';
// 			return { data: modelsResponse, error, notify };
// 		}
//
// 		let getModelsFilter = ``;
// 		for (let index = 0; index < getProviders.length; index++) {
// 			if (index === getProviders.length - 1) {
// 				getModelsFilter = `${getModelsFilter} provider="${getProviders[index].id}"`;
// 				continue;
// 			} else {
// 				getModelsFilter = `${getModelsFilter} provider="${getProviders[index].id}" ||`;
// 			}
// 		}
//
// 		const getModels = await pb.collection('models').getFullList({
// 			sort: '-created',
// 			...(getModelsFilter && { filter: getModelsFilter })
// 		});
//
// 		if (getModels.length === 0) {
// 			notify = 'No models found for this user/provider';
// 			return { data: modelsResponse, error, notify };
// 		}
//
// 		const flattened = MovePocketBaseExpandsInline(getModels);
// 		modelsResponse = flattened as Types.Generic.UserModelWithProvider[];
// 	} catch (e: any) {
// 		error = e;
// 		notify = e.message || 'Failed to fetch user models';
// 		return { data: modelsResponse, error, notify };
// 	}
//
// 	return { data: modelsResponse, error, notify };
// }
