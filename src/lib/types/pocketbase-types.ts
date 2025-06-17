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
	Chats = "chats",
	Contexts = "contexts",
	Messages = "messages",
	ModelFeatures = "modelFeatures",
	Models = "models",
	Presets = "presets",
	ProviderModelFeaturesJunction = "providerModelFeaturesJunction",
	Providers = "providers",
	Shares = "shares",
	UserContextJunction = "userContextJunction",
	UserProviders = "userProviders",
	UserSalts = "userSalts",
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
	context?: RecordIdString
	created?: IsoDateString
	icon?: string
	id: string
	name?: string
	order?: number
	updated?: IsoDateString
	user?: RecordIdString
}

export type ChatsRecord = {
	context?: RecordIdString
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type ContextsRecord = {
	created?: IsoDateString
	id: string
	logo?: string
	name?: string
	updated?: IsoDateString
}

export enum MessagesStatusOptions {
	"Success" = "Success",
	"Error" = "Error",
}

export enum MessagesRoleOptions {
	"User" = "User",
	"Assistant" = "Assistant",
	"System" = "System",
}
export type MessagesRecord<TparamsFromModel = unknown> = {
	attachments?: string[]
	chat?: RecordIdString
	created?: IsoDateString
	error?: string
	id: string
	message?: string
	model?: RecordIdString
	paramsFromModel?: null | TparamsFromModel
	role?: MessagesRoleOptions
	status?: MessagesStatusOptions
	timeSent?: IsoDateString
	tokenCost?: number
	updated?: IsoDateString
}

export type ModelFeaturesRecord<Tconfig = unknown> = {
	config?: null | Tconfig
	created?: IsoDateString
	id: string
	key?: string
	name?: string
	updated?: IsoDateString
}

export type ModelsRecord = {
	created?: IsoDateString
	description?: string
	id: string
	key?: string
	maxOutputTokens?: number
	name?: string
	order?: number
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

export type ProviderModelFeaturesJunctionRecord = {
	created?: IsoDateString
	feature?: RecordIdString
	id: string
	inputCostPer1k?: number
	isActive?: boolean
	model?: RecordIdString
	outputCostPer1k?: number
	provider?: RecordIdString
	supportsImages?: boolean
	supportsStreaming?: boolean
	supportsVision?: boolean
	updated?: IsoDateString
}

export type ProvidersRecord = {
	created?: IsoDateString
	homePage?: string
	howToGetAPIKey?: string
	id: string
	logo?: string
	name?: string
	providerKey?: string
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

export type UserContextJunctionRecord = {
	context?: RecordIdString
	created?: IsoDateString
	defaultModel?: RecordIdString
	defaultProvider?: RecordIdString
	id: string
	isActive?: boolean
	order?: number
	updated?: IsoDateString
	user?: RecordIdString
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
export type ChatsResponse<Texpand = unknown> = Required<ChatsRecord> & BaseSystemFields<Texpand>
export type ContextsResponse<Texpand = unknown> = Required<ContextsRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<TparamsFromModel = unknown, Texpand = unknown> = Required<MessagesRecord<TparamsFromModel>> & BaseSystemFields<Texpand>
export type ModelFeaturesResponse<Tconfig = unknown, Texpand = unknown> = Required<ModelFeaturesRecord<Tconfig>> & BaseSystemFields<Texpand>
export type ModelsResponse<Texpand = unknown> = Required<ModelsRecord> & BaseSystemFields<Texpand>
export type PresetsResponse<Texpand = unknown> = Required<PresetsRecord> & BaseSystemFields<Texpand>
export type ProviderModelFeaturesJunctionResponse<Texpand = unknown> = Required<ProviderModelFeaturesJunctionRecord> & BaseSystemFields<Texpand>
export type ProvidersResponse<Texpand = unknown> = Required<ProvidersRecord> & BaseSystemFields<Texpand>
export type SharesResponse<Tmeta = unknown, Texpand = unknown> = Required<SharesRecord<Tmeta>> & BaseSystemFields<Texpand>
export type UserContextJunctionResponse<Texpand = unknown> = Required<UserContextJunctionRecord> & BaseSystemFields<Texpand>
export type UserProvidersResponse<Tconfig = unknown, Texpand = unknown> = Required<UserProvidersRecord<Tconfig>> & BaseSystemFields<Texpand>
export type UserSaltsResponse<Texpand = unknown> = Required<UserSaltsRecord> & BaseSystemFields<Texpand>
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
	chats: ChatsRecord
	contexts: ContextsRecord
	messages: MessagesRecord
	modelFeatures: ModelFeaturesRecord
	models: ModelsRecord
	presets: PresetsRecord
	providerModelFeaturesJunction: ProviderModelFeaturesJunctionRecord
	providers: ProvidersRecord
	shares: SharesRecord
	userContextJunction: UserContextJunctionRecord
	userProviders: UserProvidersRecord
	userSalts: UserSaltsRecord
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
	chats: ChatsResponse
	contexts: ContextsResponse
	messages: MessagesResponse
	modelFeatures: ModelFeaturesResponse
	models: ModelsResponse
	presets: PresetsResponse
	providerModelFeaturesJunction: ProviderModelFeaturesJunctionResponse
	providers: ProvidersResponse
	shares: SharesResponse
	userContextJunction: UserContextJunctionResponse
	userProviders: UserProvidersResponse
	userSalts: UserSaltsResponse
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
	collection(idOrName: 'chats'): RecordService<ChatsResponse>
	collection(idOrName: 'contexts'): RecordService<ContextsResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'modelFeatures'): RecordService<ModelFeaturesResponse>
	collection(idOrName: 'models'): RecordService<ModelsResponse>
	collection(idOrName: 'presets'): RecordService<PresetsResponse>
	collection(idOrName: 'providerModelFeaturesJunction'): RecordService<ProviderModelFeaturesJunctionResponse>
	collection(idOrName: 'providers'): RecordService<ProvidersResponse>
	collection(idOrName: 'shares'): RecordService<SharesResponse>
	collection(idOrName: 'userContextJunction'): RecordService<UserContextJunctionResponse>
	collection(idOrName: 'userProviders'): RecordService<UserProvidersResponse>
	collection(idOrName: 'userSalts'): RecordService<UserSaltsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
