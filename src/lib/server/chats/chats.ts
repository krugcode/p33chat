import type { Chats } from '$lib/components/forms';
import { Types } from '$lib';
import type {
	ChatsRecord,
	MessagesRecord,
	TypedPocketBase,
	UsersRecord
} from '$lib/types/pocketbase-types';
import type { ZonedDateTime } from '@internationalized/date';

export async function sendInitialChat(
	pb: TypedPocketBase,
	user: UsersRecord,
	data: Chats.Schemas.ChatFormData
) {
	let error: any | null;
	let message: string = '';
	let llmResponse: any;

	try {
	} catch (error) { }
	return { data: llmResponse, error, message };
}

export async function FetchMessagesByUser(
	pb: TypedPocketBase,
	chat: ChatsRecord,
	user: UsersRecord
) {
	let error: any | null;
	let message: string = '';
	let messageLog: Types.Generic.Message[] = [] as Types.Generic.Message[];
	let filter = `id=${chat.id} &&`
	try {
		// scroll based pagination down the line, just fetch em all for now
		let dbResponse = await pb.collection('chats').getFullList(
			filter:
		);
	} catch (error) { }
}
