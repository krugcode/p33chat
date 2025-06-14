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
	Branch = "branch",
	ChatGroupJunction = "chatGroupJunction",
	ChatGroups = "chatGroups",
	ChatMessageSharesJunction = "chatMessageSharesJunction",
	ChatMessagesJunction = "chatMessagesJunction",
	Chats = "chats",
	Contexts = "contexts",
	GroupContextJunction = "groupContextJunction",
	MessageReactionsJunction = "messageReactionsJunction",
	Messages = "messages",
	ModelFeatures = "modelFeatures",
	Models = "models",
	Presets = "presets",
	Providers = "providers",
	Reactions = "reactions",
	Shares = "shares",
	UserProviders = "userProviders",
	UserSalts = "userSalts",
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

export type BranchRecord = {
	created?: IsoDateString
	id: string
	name?: string
	parent?: RecordIdString
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

export type ChatMessageSharesJunctionRecord = {
	chatMessage?: RecordIdString
	created?: IsoDateString
	id: string
	share?: RecordIdString
	updated?: IsoDateString
}

export type ChatMessagesJunctionRecord = {
	branch?: RecordIdString
	chat?: RecordIdString
	created?: IsoDateString
	id: string
	message?: RecordIdString
	timeSent?: IsoDateString
	updated?: IsoDateString
	user?: RecordIdString
}

export type ChatsRecord = {
	chatGroups?: RecordIdString[]
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export type ContextsRecord = {
	created?: IsoDateString
	id: string
	isActive?: boolean
	logo?: string
	name?: string
	order?: number
	updated?: IsoDateString
	user?: RecordIdString
}

export type GroupContextJunctionRecord = {
	chatGroup?: RecordIdString
	context?: RecordIdString
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export type MessageReactionsJunctionRecord = {
	created?: IsoDateString
	id: string
	message?: RecordIdString
	reaction?: RecordIdString
	updated?: IsoDateString
}

export enum MessagesStatusOptions {
	"Success" = "Success",
	"Error" = "Error",
}
export type MessagesRecord<TparamsFromModel = unknown> = {
	attachments?: string[]
	created?: IsoDateString
	error?: string
	id: string
	message?: string
	model?: RecordIdString
	paramsFromModel?: null | TparamsFromModel
	status?: MessagesStatusOptions
	tokenCost?: number
	updated?: IsoDateString
}

export type ModelFeaturesRecord<Tconfig = unknown> = {
	config?: null | Tconfig
	created?: IsoDateString
	id: string
	name?: string
	updated?: IsoDateString
}

export type ModelsRecord = {
	created?: IsoDateString
	description?: string
	id: string
	inputCostPer1k?: number
	isActive?: boolean
	key?: string
	maxOutputTokens?: number
	modelFeatures?: RecordIdString[]
	name?: string
	order?: number
	outputCostPer1k?: number
	provider?: RecordIdString
	supportsImages?: boolean
	supportsStreaming?: boolean
	supportsVision?: boolean
	updated?: IsoDateString
}

export type PresetsRecord = {
	created?: IsoDateString
	id: string
	initialPrompt?: RecordIdString
	logo?: string
	name?: string
	updated?: IsoDateString
}

export enum ProvidersFeaturesOptions {
	"Basic" = "Basic",
	"Thinking" = "Thinking",
	"Image" = "Image",
	"Voice" = "Voice",
	"Web Search" = "Web Search",
}
export type ProvidersRecord = {
	created?: IsoDateString
	features?: ProvidersFeaturesOptions[]
	homePage?: string
	howToGetAPIKey?: string
	id: string
	logo?: string
	name?: string
	providerKey?: string
	updated?: IsoDateString
}

export type ReactionsRecord = {
	created?: IsoDateString
	iconKey?: string
	id: string
	name?: string
	updated?: IsoDateString
}

export enum SharesPrivacyOptions {
	"Public" = "Public",
	"Requires Link" = "Requires Link",
	"Users" = "Users",
}
export type SharesRecord<Tmeta = unknown> = {
	created?: IsoDateString
	id: string
	meta?: null | Tmeta
	privacy?: SharesPrivacyOptions
	shareLink?: string
	title?: string
	updated?: IsoDateString
	users?: RecordIdString[]
}

export type UserProvidersRecord<Tconfig = unknown> = {
	apiKey?: string
	config?: null | Tconfig
	created?: IsoDateString
	id: string
	provider?: RecordIdString
	updated?: IsoDateString
	user?: RecordIdString
}

export type UserSaltsRecord = {
	created?: IsoDateString
	id: string
	salt?: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type UserSettingsRecord = {
	created?: IsoDateString
	defaultProvider?: RecordIdString
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
export type BranchResponse<Texpand = unknown> = Required<BranchRecord> & BaseSystemFields<Texpand>
export type ChatGroupJunctionResponse<Texpand = unknown> = Required<ChatGroupJunctionRecord> & BaseSystemFields<Texpand>
export type ChatGroupsResponse<Texpand = unknown> = Required<ChatGroupsRecord> & BaseSystemFields<Texpand>
export type ChatMessageSharesJunctionResponse<Texpand = unknown> = Required<ChatMessageSharesJunctionRecord> & BaseSystemFields<Texpand>
export type ChatMessagesJunctionResponse<Texpand = unknown> = Required<ChatMessagesJunctionRecord> & BaseSystemFields<Texpand>
export type ChatsResponse<Texpand = unknown> = Required<ChatsRecord> & BaseSystemFields<Texpand>
export type ContextsResponse<Texpand = unknown> = Required<ContextsRecord> & BaseSystemFields<Texpand>
export type GroupContextJunctionResponse<Texpand = unknown> = Required<GroupContextJunctionRecord> & BaseSystemFields<Texpand>
export type MessageReactionsJunctionResponse<Texpand = unknown> = Required<MessageReactionsJunctionRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<TparamsFromModel = unknown, Texpand = unknown> = Required<MessagesRecord<TparamsFromModel>> & BaseSystemFields<Texpand>
export type ModelFeaturesResponse<Tconfig = unknown, Texpand = unknown> = Required<ModelFeaturesRecord<Tconfig>> & BaseSystemFields<Texpand>
export type ModelsResponse<Texpand = unknown> = Required<ModelsRecord> & BaseSystemFields<Texpand>
export type PresetsResponse<Texpand = unknown> = Required<PresetsRecord> & BaseSystemFields<Texpand>
export type ProvidersResponse<Texpand = unknown> = Required<ProvidersRecord> & BaseSystemFields<Texpand>
export type ReactionsResponse<Texpand = unknown> = Required<ReactionsRecord> & BaseSystemFields<Texpand>
export type SharesResponse<Tmeta = unknown, Texpand = unknown> = Required<SharesRecord<Tmeta>> & BaseSystemFields<Texpand>
export type UserProvidersResponse<Tconfig = unknown, Texpand = unknown> = Required<UserProvidersRecord<Tconfig>> & BaseSystemFields<Texpand>
export type UserSaltsResponse<Texpand = unknown> = Required<UserSaltsRecord> & BaseSystemFields<Texpand>
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
	branch: BranchRecord
	chatGroupJunction: ChatGroupJunctionRecord
	chatGroups: ChatGroupsRecord
	chatMessageSharesJunction: ChatMessageSharesJunctionRecord
	chatMessagesJunction: ChatMessagesJunctionRecord
	chats: ChatsRecord
	contexts: ContextsRecord
	groupContextJunction: GroupContextJunctionRecord
	messageReactionsJunction: MessageReactionsJunctionRecord
	messages: MessagesRecord
	modelFeatures: ModelFeaturesRecord
	models: ModelsRecord
	presets: PresetsRecord
	providers: ProvidersRecord
	reactions: ReactionsRecord
	shares: SharesRecord
	userProviders: UserProvidersRecord
	userSalts: UserSaltsRecord
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
	branch: BranchResponse
	chatGroupJunction: ChatGroupJunctionResponse
	chatGroups: ChatGroupsResponse
	chatMessageSharesJunction: ChatMessageSharesJunctionResponse
	chatMessagesJunction: ChatMessagesJunctionResponse
	chats: ChatsResponse
	contexts: ContextsResponse
	groupContextJunction: GroupContextJunctionResponse
	messageReactionsJunction: MessageReactionsJunctionResponse
	messages: MessagesResponse
	modelFeatures: ModelFeaturesResponse
	models: ModelsResponse
	presets: PresetsResponse
	providers: ProvidersResponse
	reactions: ReactionsResponse
	shares: SharesResponse
	userProviders: UserProvidersResponse
	userSalts: UserSaltsResponse
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
	collection(idOrName: 'branch'): RecordService<BranchResponse>
	collection(idOrName: 'chatGroupJunction'): RecordService<ChatGroupJunctionResponse>
	collection(idOrName: 'chatGroups'): RecordService<ChatGroupsResponse>
	collection(idOrName: 'chatMessageSharesJunction'): RecordService<ChatMessageSharesJunctionResponse>
	collection(idOrName: 'chatMessagesJunction'): RecordService<ChatMessagesJunctionResponse>
	collection(idOrName: 'chats'): RecordService<ChatsResponse>
	collection(idOrName: 'contexts'): RecordService<ContextsResponse>
	collection(idOrName: 'groupContextJunction'): RecordService<GroupContextJunctionResponse>
	collection(idOrName: 'messageReactionsJunction'): RecordService<MessageReactionsJunctionResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'modelFeatures'): RecordService<ModelFeaturesResponse>
	collection(idOrName: 'models'): RecordService<ModelsResponse>
	collection(idOrName: 'presets'): RecordService<PresetsResponse>
	collection(idOrName: 'providers'): RecordService<ProvidersResponse>
	collection(idOrName: 'reactions'): RecordService<ReactionsResponse>
	collection(idOrName: 'shares'): RecordService<SharesResponse>
	collection(idOrName: 'userProviders'): RecordService<UserProvidersResponse>
	collection(idOrName: 'userSalts'): RecordService<UserSaltsResponse>
	collection(idOrName: 'userSettings'): RecordService<UserSettingsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
