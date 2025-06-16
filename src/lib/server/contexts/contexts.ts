import type { Types } from '$lib';
import type { ContextsResponse, TypedPocketBase } from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import type { Single } from '$lib/types/server';
import { GetPocketBaseFile } from '../utils';
import { MovePocketBaseExpandsInline } from '$lib/utils';

export async function Create(
	pb: TypedPocketBase,
	user: AuthRecord,
	data: any
): Promise<Single<ContextsResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let contextResponse: ContextsResponse = {} as ContextsResponse;

	try {
		const createContextBody = {
			user: user?.id,
			name: data.name,
			order: data.order,
			isActive: data.isActive,
			logo: null
		};
		if (data?.logo && data.logo instanceof File && data.logo.size > 0) {
			createContextBody.logo = data.logo;
		}
		contextResponse = await pb.collection('contexts').create(createContextBody);
		if (!contextResponse.id) {
			error = 'Error creating the context, please check the pocketbase logs';
			notify = "Couldn't create a ";
		}
	} catch (e: any) {
		error = e;
		notify = e?.message || 'A problem occurred while creating the context';
		return { data: contextResponse, error, notify };
	}
	return { data: contextResponse, error, notify };
}

export async function GetByUser(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Types.Server.Single<Record<string, any>[]>> {
	let error: any | null = null;
	let notify: string = '';
	let contextResponse: Record<string, any>[] = [];

	try {
		const filter = `user="${user?.id}" `;

		const getContexts = await pb.collection('userContextJunction').getFullList({
			sort: '-order',
			expand: 'context',
			...(filter && { filter })
		});

		if (getContexts.length === 0) {
			notify = 'No contexts found for this user';
			return { data: contextResponse, error, notify };
		}

		const flattened = MovePocketBaseExpandsInline(getContexts);

		const withFiles = GetPocketBaseFile(pb, flattened, ['context.logo']);

		if (withFiles.error) {
			error = withFiles.error;
			notify = 'Unable to load files from the server';
			return { data: getContexts, error, notify };
		}

		contextResponse = withFiles.data;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch user models';
		return { data: contextResponse, error, notify };
	}

	return { data: contextResponse, error, notify };
}

export async function SetActive(
	pb: TypedPocketBase,
	user: AuthRecord,
	contextID: string
): Promise<Single<ContextsResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let contextResponse: ContextsResponse = {} as ContextsResponse;

	try {
		const filter = `user="${user?.id}" && isActive=true`;
		let activeContexts = await pb.collection('userContextJunction').getFullList({
			filter
		});

		// only create batch if there are contexts to deactivate
		if (activeContexts.length > 0) {
			const batch = pb.createBatch();
			activeContexts.forEach((record) => {
				batch.collection('userContextJunction').update(record.id, { isActive: false });
			});

			try {
				await batch.send();
			} catch (batchError) {
				error = batchError;
				notify = `Failed to deactivate existing contexts`;
				return { data: contextResponse, error, notify };
			}
		}

		// Now set the target context as active
		contextResponse = await pb.collection('userContextJunction').update(contextID, {
			isActive: true
		});

		if (!contextResponse.id) {
			error = 'Unable to set context to active';
			notify = 'Unable to set context to active';
		}
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to set context active';
	}

	return { data: contextResponse, error, notify };
}

export async function GetActive(
	pb: TypedPocketBase,
	user: AuthRecord
): Promise<Single<Record<string, any>>> {
	let error: any | null = null;
	let notify: string = '';
	let contextResponse: Record<string, any> = {} as Record<string, any>;

	try {
		const filter = `user="${user?.id}" && isActive=true`;
		let activeContext = await pb.collection('userContextJunction').getFirstListItem(filter, {
			expand: 'defaultModel, defaultProvider.provider'
		});

		if (!activeContext.id) {
			error = 'Unable to get active context';
			notify = 'Unable to get active context';
		}
		const flattened = MovePocketBaseExpandsInline(activeContext);

		contextResponse = flattened;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to get active context';
	}

	return { data: contextResponse, error, notify };
}
