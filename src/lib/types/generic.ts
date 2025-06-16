// this is where we dump types when brain dont think too good
// a mess for another day :)
import type { ProvidersRecord, UserProvidersResponse } from './pocketbase-types';
import type { RecordModel } from 'pocketbase';

export type FormError = {
  summary: string;
  debug: string;
};

export type LLMResponse = {
  message: string;
  date: any;
  tokenCost: number;
};

export type Message = {
  id: string;
  authorId: string;
  authorName: string;
  chatId: string;
  modelName?: string; // Add model info
  responseTo?: string;
  content: string;
  attachments: any[];
  tokenCost?: number;
  timeSent: string | Date;
  createdAt: string | Date;
};

export type PocketBaseExpandableRecord = RecordModel & {
  expand?: Record<string, any>;
};

export type ChatResponse = {
  messages: Message[];
  chat: string;
};

export type UserProviderWithProvider = Omit<UserProvidersResponse, 'expand'> & {
  providers: ProvidersRecord;
};

export type UserModelWithProvider = Omit<UserProvidersResponse, 'expand'> & {
  providers: ProvidersRecord;
};

export type SelectionInput = {
  value: string;
  label: string;
  image?: string;
};
