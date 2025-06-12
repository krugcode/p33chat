import type { ZonedDateTime } from '@internationalized/date';
import type { UsersRecord } from './pocketbase-types';

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
  author: UsersRecord;
  responseTo: string; //message id of parent
  content: string;
  attachments: any;
  sentAt: ZonedDateTime;
  createdAt: ZonedDateTime;
};
