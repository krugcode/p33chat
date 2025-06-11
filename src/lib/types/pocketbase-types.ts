/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Bookmarks = "bookmarks",
	ChatGroupJunction = "chatGroupJunction",
	ChatGroups = "chatGroups",
	Chats = "chats",
	Messages = "messages",
	Model = "model",
	UserSettings = "userSettings",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type BookmarksRecord = {
	chat?: RecordIdString
	created?: IsoDateString
	id: string
	order?: number
	updated?: IsoDateString
}

export type ChatGroupJunctionRecord = {
	chat?: RecordIdString
	chatGroup?: RecordIdString
	created?: IsoDateString
	id: string
	reasonAdded?: string
	updated?: IsoDateString
}

export type ChatGroupsRecord = {
	created?: IsoDateString
	icon?: string
	id: string
	name?: string
	order?: number
	updated?: IsoDateString
	user?: RecordIdString
}

export type ChatsRecord = {
	chatGroups?: RecordIdString[]
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export type MessagesRecord = {
	attachments?: string[]
	chat?: RecordIdString
	created?: IsoDateString
	id: string
	message?: string
	model?: RecordIdString
	tokenCost?: number
	updated?: IsoDateString
}

export type ModelRecord = {
	apiKey?: string
	created?: IsoDateString
	id: string
	isActive?: boolean
	logo?: string
	modelKey?: string
	name?: string
	updated?: IsoDateString
}

export type UserSettingsRecord = {
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	firstName?: string
	id: string
	lastName?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BookmarksResponse<Texpand = unknown> = Required<BookmarksRecord> & BaseSystemFields<Texpand>
export type ChatGroupJunctionResponse<Texpand = unknown> = Required<ChatGroupJunctionRecord> & BaseSystemFields<Texpand>
export type ChatGroupsResponse<Texpand = unknown> = Required<ChatGroupsRecord> & BaseSystemFields<Texpand>
export type ChatsResponse<Texpand = unknown> = Required<ChatsRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type ModelResponse<Texpand = unknown> = Required<ModelRecord> & BaseSystemFields<Texpand>
export type UserSettingsResponse<Texpand = unknown> = Required<UserSettingsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	bookmarks: BookmarksRecord
	chatGroupJunction: ChatGroupJunctionRecord
	chatGroups: ChatGroupsRecord
	chats: ChatsRecord
	messages: MessagesRecord
	model: ModelRecord
	userSettings: UserSettingsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	bookmarks: BookmarksResponse
	chatGroupJunction: ChatGroupJunctionResponse
	chatGroups: ChatGroupsResponse
	chats: ChatsResponse
	messages: MessagesResponse
	model: ModelResponse
	userSettings: UserSettingsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'bookmarks'): RecordService<BookmarksResponse>
	collection(idOrName: 'chatGroupJunction'): RecordService<ChatGroupJunctionResponse>
	collection(idOrName: 'chatGroups'): RecordService<ChatGroupsResponse>
	collection(idOrName: 'chats'): RecordService<ChatsResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'model'): RecordService<ModelResponse>
	collection(idOrName: 'userSettings'): RecordService<UserSettingsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
