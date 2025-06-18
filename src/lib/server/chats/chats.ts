import type { Chats } from '$lib/components/forms';
import { Types } from '$lib';
import type { MessagesResponse, TypedPocketBase } from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Single } from '$lib/types/server';
import { Server } from '..';
import { GetPocketBaseFile } from '../utils';
import { GetActive } from '../contexts';
import { GetModelFeatures } from '../providers';

export async function CreateMessage(
	pb: TypedPocketBase,
	user: AuthRecord,
	role: string,
	data: Chats.Schemas.ChatFormData
): Promise<Single<MessagesResponse>> {
	let error: any | null;
	let notify: string = '';
	let responseData: MessagesResponse = {} as MessagesResponse;

	try {
		let createMessageBody = {
			role: role,
			...data
		};
		let activeContext, userProvider, modelFeatures;
		console.log(data);
		const userProvidersFilter = `user="${user?.id}" && provider="${data.provider}"`;

		responseData = await pb.collection('messages').create(createMessageBody);
		[activeContext, userProvider, modelFeatures] = await Promise.all([
			GetActive(pb, user),
			pb.collection('userProviders').getFullList({
				filter: userProvidersFilter
			}),
			GetModelFeatures(pb, data.model, data.provider)
		]);

		if (!userProvider?.[0]?.id) {
			error = "Couldn't fetch the userprovider";
			return { data: responseData, error, notify };
		}

		if (!responseData.id) {
			error = "Oopsie, couldn't make a chat for some reason. Check the PB logs for more info";
			return { data: responseData, error, notify };
		}
		if (!activeContext?.data?.id) {
			error = "Couldn't get the active context for the user";
			return { data: responseData, error, notify };
		}
		// set the new default for the users current context
		let updateResponse;
		updateResponse = await Server.Contexts.SetDefaults(pb, activeContext.data.id, {
			defaultModel: data.model,
			defaultProvider: userProvider[0].id
		});
		// get messages
		const messagesResponse = await Server.Chats.FetchChatMessages(pb, responseData.chat);
		if (!messagesResponse.data) {
			error = "Can't fetch message data";
			notify = "Can't fetch message data";
			return { data: responseData, error, notify };
		}
		const messages = messagesResponse.data.map((msg) => ({
			role: msg.role.toLowerCase(),
			content: msg.message,
			timestamp: msg.created
		}));

		//request ai response (might be a stream)
		const routeRequestData = MovePocketBaseExpandsInline(modelFeatures.data);

		const aiResponse = Server.AI.Router.RouteAIRequest(pb, user, routeRequestData, messages);
		if (!updateResponse?.data?.id) {
			error = "Couldn't update defaults for active context";
			return { data: responseData, error, notify };
		}
	} catch (e) {
		error = e;
		notify = 'Something went wrong in CreateMessage';
		return { data: responseData, error, notify };
	}
	return { data: responseData, error, notify };
}

export async function CreateInitialChat(
	pb: TypedPocketBase,
	user: AuthRecord,
	data: Chats.Schemas.ChatFormData
): Promise<Single<MessagesResponse>> {
	let error: any | null;
	let notify: string = '';

	let chatResponse: MessagesResponse = {} as MessagesResponse;

	try {
		// get active context
		const activeContext = await Server.Contexts.GetActive(pb, user);
		if (!activeContext.data?.context?.id) {
			error = "Can't find active context";
			return { data: chatResponse, error, notify };
		}
		//create chat
		let createChatBody = { user: user?.id, context: activeContext.data.context.id };

		let createChat = await pb.collection('chats').create(createChatBody);

		if (!createChat.id) {
			error = "Oopsie, couldn't make a chat for some reason. Check the PB logs for more info";
			return { data: chatResponse, error, notify };
		}
		data.chat = createChat.id;
		//create message
		let createMessage = await CreateMessage(pb, user, 'User', data);
		if (!!createMessage.error || !createMessage?.data?.id) {
			error = createMessage.error ?? '[CreateInitialChat] Something went wrong';
			notify = createMessage.notify;
			return { data: chatResponse, error, notify };
		}
		chatResponse = createMessage.data;
	} catch (error) { }
	return { data: chatResponse, error, notify };
}

export async function GetByActiveContext(pb: TypedPocketBase, user: AuthRecord) {
	let error: any | null = null;
	let notify: string = '';
	let chats: Types.Generic.Message[] = [];

	try {
		// get active context
		let activeContext = await Server.Contexts.GetActive(pb, user);
		if (!activeContext.data?.context?.id) {
			error = activeContext.error;
			notify = 'No active context.';
			return { data: chats, error, notify };
		}

		const filter = `user="${user?.id}" && context="${activeContext.data.context.id}"`;
		let dbResponse = await pb.collection('chats').getFullList({
			filter,
			sort: 'created',
			expand: 'group'
		});

		const flattened = MovePocketBaseExpandsInline(dbResponse);

		chats = flattened as any;
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch messages';
	}

	return { error, notify, data: chats };
}

export async function FetchChatMessages(pb: TypedPocketBase, chatID: string) {
	let error: any | null = null;
	let notify: string = '';
	let messageLog: Record<string, any>[] = [];

	let filter = `chat="${chatID}"`;

	try {
		let dbResponse = await pb.collection('messages').getFullList({
			filter,
			sort: 'created',
			expand: 'model,model.providerModelFeaturesJunction_via_model.provider,chat'
		});

		const flattened = MovePocketBaseExpandsInline(dbResponse);

		const withFiles = GetPocketBaseFile(pb, flattened, [
			'model.providerModelFeaturesJunction_via_model.provider.logo'
		]);

		messageLog = withFiles.data as any;
	} catch (e: any) {
		error = e;

		notify = e.message || 'Failed to fetch messages';
	}

	return { error, notify, data: messageLog };
}
