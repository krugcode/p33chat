import type { Chats } from '$lib/components/forms';
import { Types } from '$lib';
import type {
	ChatsRecord,
	MessagesResponse,
	TypedPocketBase,
	UsersRecord
} from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';
import { MovePocketBaseExpandsInline } from '$lib/utils';
import type { Single } from '$lib/types/server';

export async function CreateMessage(
	pb: TypedPocketBase,
	chat: Types.DB.ChatsResponse,
	user: AuthRecord,
	data: Chats.Schemas.ChatFormData
): Promise<Single<Types.Generic.ChatResponse>> {
	let error: any | null;
	let notify: string = '';
	let responseData: Types.Generic.ChatResponse = {} as Types.Generic.ChatResponse;

	try {
		let createMessageBody = {
			model: data.model,
			message: data.message
		};
		let createMessage = await pb.collection('messages').create(createMessageBody);
		if (!createMessage.id) {
			error = "Oopsie, couldn't make a chat for some reason. Check the PB logs for more info";
			return { data: responseData, error, notify };
		}
		let linkMessageToChatBody = {
			chat: chat.id,
			message: createMessage.id,
			user: user?.id,
			model: data.model,
			timeSent: data.timeSent
		};
		let linkMessageToChat = await pb
			.collection('chatMessagesJunction')
			.create(linkMessageToChatBody);
		if (!linkMessageToChat.id) {
			error = 'Oopsie, something is broken when linking messages to chats. Check PB logs';
			notify = "Couldn't connect message to chat. Please check server";
			return { data: responseData, error, notify };
		}
		responseData = {
			messages: [
				{
					id: createMessage.id,
					authorId: user!.id,
					authorName: user?.firstName || user!.email || 'Unknown',
					chatId: chat.id,
					modelName: data.model,
					content: data.message,
					attachments: createMessage.attachments || [],

					timeSent: data.timeSent,
					createdAt: createMessage.created
				}
			],
			chat: chat.id
		};
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
): Promise<Single<Types.Generic.ChatResponse>> {
	let error: any | null;
	let notify: string = '';

	let chatResponse: Types.Generic.ChatResponse = {} as Types.Generic.ChatResponse;

	try {
		//create chat
		let createChatBody: { chatGroups?: string[] } = {};
		if (data.chatGroups) {
			createChatBody.chatGroups = data.chatGroups;
		}
		let createChat = await pb.collection('chats').create(createChatBody);
		if (!createChat.id) {
			error = "Oopsie, couldn't make a chat for some reason. Check the PB logs for more info";
			return { data: chatResponse, error, notify };
		}
		//create message
		let createMessage = await CreateMessage(pb, createChat, user, data);
		if (!!createMessage.error || createMessage.data.messages.length === 0) {
			error = createMessage.error ?? '[CreateInitialChat] Something went wrong';
			notify = 'Something went wrong in CreateInitialChat';
			return { data: chatResponse, error, notify };
		}
		chatResponse = createMessage.data;
	} catch (error) { }
	return { data: chatResponse, error, notify };
}

export async function FetchChatMessagesByUser(
	pb: TypedPocketBase,
	chat: ChatsRecord,
	user: UsersRecord
) {
	let error: any | null = null;
	let notify: string = '';
	let messageLog: Types.Generic.Message[] = [];

	let filter = `chat="${chat.id}" && user="${user.id}"`;

	try {
		let dbResponse = await pb.collection('chatMessagesJunction').getFullList({
			filter,
			sort: 'timeSent',
			expand: 'message,user,model'
		});

		const flattenedJunctions = MovePocketBaseExpandsInline(dbResponse);

		messageLog = flattenedJunctions.map((junction) => ({
			id: junction.message.id,
			content: junction.message.message,
			authorId: junction.user.id,
			authorName: junction.user.firstName || junction.user.email,
			chatId: junction.chat,
			modelName: junction.model?.name,
			attachments: junction.message.attachments || [],
			tokenCost: junction.message.tokenCost || 0,
			timeSent: junction.timeSent,
			createdAt: junction.created
		}));
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to fetch messages';
	}

	return { error, notify, data: messageLog };
}
