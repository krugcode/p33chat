import type { Types } from '$lib';
import type {
	ContextsResponse,
	TypedPocketBase,
	UserContextJunctionResponse
} from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import type { Single } from '$lib/types/server';
import { GetPocketBase, GetPocketBaseFile } from '../utils';
import { MovePocketBaseExpandsInline } from '$lib/utils';

export async function Create(
	user: AuthRecord,
	data: any
): Promise<Single<UserContextJunctionResponse>> {
	let error: any | null = null;
	let notify: string = '';
	let contextResponse: UserContextJunctionResponse = {} as UserContextJunctionResponse;
	const pb = GetPocketBase();
	try {
		const createContextBody = {
			user: user?.id,
			name: data.name,
			order: data.order,
			logo: null
		};
		if (data?.logo && data.logo instanceof File && data.logo.size > 0) {
			createContextBody.logo = data.logo;
		}
		const createResponse = await pb.collection('contexts').create(createContextBody);
		if (!createResponse.id) {
			error = 'Error creating the context, please check the pocketbase logs';
			notify = "Couldn't create a ";
		}
		const userContextBody = {
			user: user?.id,
			context: createResponse.id
		};
		contextResponse = await pb.collection('userContextJunction').create(userContextBody);
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

		contextResponse = await pb.collection('userContextJunction').update(contextID, {
			isActive: true
		});

		if (!contextResponse.id) {
			error = 'Unable to set context to active';
			notify = 'Unable to set context to active';
		}
	} catch (e: any) {
		error = e;
		console.log('why is the context failing', e);
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
			expand:
				'context,defaultModel,defaultProvider,defaultProvider.provider,chats_via_userContext,chats_via_userContext.group'
		});

		const flattened = MovePocketBaseExpandsInline(activeContext);
		contextResponse = flattened;
	} catch (e: any) {
		if (e.status === 404) {
			error = 'No active context found for user';
			notify = 'No active context set. Please select a context.';
		} else {
			error = e;
			notify = e.message || 'Failed to get active context';
		}
	}

	return { data: contextResponse, error, notify };
}

export async function SetDefaults(
	pb: TypedPocketBase,
	userContextID: string,
	data: {
		defaultModel: string;
		defaultProvider: string;
	}
) {
	let error: any | null = null;
	let notify: string = '';
	let defaultsResponse: Record<string, any> = {} as Record<string, any>;

	try {
		defaultsResponse = await pb.collection('userContextJunction').update(userContextID, data);
		if (!defaultsResponse.id) {
			error = 'Unable to update the usercontext';
			return { data: defaultsResponse, error, notify };
		}
	} catch (e) {
		error = e;
		notify = 'Unable to update user context';
		return { data: defaultsResponse, error, notify };
	}
	return { data: defaultsResponse, error, notify };
}
