import type { Chats } from '$lib/components/forms';
import { Types } from '$lib';
import type {
	MessagesResponse,
	TypedPocketBase,
	UserProvidersResponse
} from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { DateTimeFormat, MovePocketBaseExpandsInline } from '$lib/utils';
import type { Single } from '$lib/types/server';
import { Server } from '..';
import { GetPocketBaseFile } from '../utils';
import { GetActive } from '../contexts';
import { GetModelFeatures } from '../providers';
import { ClientEncryption } from '$lib/crypto';

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

		if (!updateResponse?.data?.id) {
			error = "Couldn't update defaults for active context";
			return { data: responseData, error, notify };
		}
		console.log('THE FUCKING CHAT', responseData);
		// get messages
		let messagesResponse, apiKey;
		[messagesResponse, apiKey] = await Promise.all([
			Server.Chats.FetchChatMessages(pb, responseData.chat),
			getAPIKeyFromProvider(pb, user, userProvider[0])
		]);
		if (!messagesResponse.data) {
			error = "Can't fetch message data";
			notify = "Can't fetch message data";
			return { data: responseData, error, notify };
		}
		console.log('MAPPING THE MESSAGES', messagesResponse.data);
		const messages = messagesResponse.data.map((msg) => ({
			role: msg.role.toLowerCase(),
			content: msg.message,
			timestamp: msg.created
		}));

		//request ai response (might be a stream)
		const routeRequestData = MovePocketBaseExpandsInline(modelFeatures.data);

		const aiResponse = await Server.AI.Router.RouteAIRequest(
			pb,
			user,
			apiKey.data,
			routeRequestData,
			messages
		);
		console.log('AI RESPONSE', aiResponse);
		if (!aiResponse.success) {
			error = aiResponse.error;
			notify = aiResponse.error ?? 'Problems contacting the user';
			return { data: responseData, error, notify };
		}
		let createAIMessageBody = {
			role: 'Assistant',
			chat: data.chat,
			message: aiResponse.response,
			model: data.model,
			status: 'Success',
			timeSent: DateTimeFormat()
		};
		responseData = await pb.collection('messages').create(createAIMessageBody);
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
	} catch (error) {}
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
			sort: 'timeSent',
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

async function getAPIKeyFromProvider(
	pb: TypedPocketBase,
	user: AuthRecord,
	provider: UserProvidersResponse
) {
	let error: any | null = null;
	let notify: string = '';
	let apiKey: string | null = null;
	try {
		const getSalt = await Server.Auth.GetOrCreateUserSalt(pb, user);

		if (!getSalt.data || getSalt.data?.length === 0) {
			error = "Can't fetch salt";
			notify = "Can't authenticate API key";
			return { data: apiKey, error, notify };
		}

		const decrypted = await ClientEncryption.decrypt(provider.apiKey, user);
		if (decrypted.length === 0) {
			error = 'Unable to decrypt api key';
			notify = error;
			return { data: apiKey, error, notify };
		}
		apiKey = decrypted;
	} catch (e) {
		error = e;
		notify = "Can't fetch API key";
		return { data: apiKey, error, notify };
	}
	return { data: apiKey, error, notify };
}
