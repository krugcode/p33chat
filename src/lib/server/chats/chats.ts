import type { Chats } from '$lib/components/forms';
import { Types } from '$lib';
import type { MessagesResponse, TypedPocketBase } from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Single } from '$lib/types/server';
import { Server } from '..';
import { GetPocketBase, GetPocketBaseFile } from '../utils';

export async function CreateMessage(
	pb: TypedPocketBase,
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
		responseData = await pb.collection('messages').create(createMessageBody);
		if (!responseData.id) {
			error = "Oopsie, couldn't make a chat for some reason. Check the PB logs for more info";
			return { data: responseData, error, notify };
		}
	} catch (e) {
		error = e;

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
		let createMessage = await CreateMessage(pb, 'User', data);
		if (!!createMessage.error || !createMessage?.data?.id) {
			error = createMessage.error ?? '[CreateInitialChat] Something went wrong';
			notify = 'Something went wrong in CreateInitialChat';
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
	let messageLog: Types.Generic.Message[] = [];

	let filter = `chat="${chatID}"`;

	try {
		let dbResponse = await pb.collection('messages').getFullList({
			filter,
			sort: 'created',
			expand: 'model,model.providerModelFeaturesJunction_via_model.provider,chat, chat.user'
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
