import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { ChatMessage, ChatOptions } from '$lib/types/ai';
import { Server } from '..';

export async function RouteAIRequest(
	pb: TypedPocketBase,
	user: any,
	apiKey: string,
	modelInfo: Record<string, any>,
	messages: Record<string, any>[],
	options: ChatOptions = {}
): Promise<{
	success: boolean;
	response?: string;
	error?: string;
	shouldStream: boolean;
}> {
	const shouldStream = modelInfo.supportsStreaming && options.stream !== false;
	console.log('Model INFO', modelInfo);
	console.log('SHOULD THIS BE STREAMED?', shouldStream);

	try {
		switch (modelInfo.provider.providerKey) {
			case 'google':
				const geminiOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 8192,
					temperature: options.temperature || 0.7
				};

				const result = await Server.AI.Google.Generate(apiKey, messages, geminiOptions);

				return {
					success: result.success,
					response: result.fullResponse,
					error: result.error,
					shouldStream
				};

			case 'openai':
				// Transform messages for OpenAI format
				const openaiMessages: ChatMessage[] = messages.map((msg) => ({
					role: msg.role === 'model' ? 'assistant' : msg.role || 'user',
					content: msg.message || '',
					timestamp: msg.timestamp || msg.created || new Date().toISOString()
				}));

				const openaiOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};

				const openaiResult = await Server.AI.OpenAI.Generate(
					pb,
					user,
					openaiMessages,
					openaiOptions
				);

				return {
					success: openaiResult.success,
					response: openaiResult.fullResponse,
					error: openaiResult.error,
					shouldStream
				};

			case 'anthropic':
				// Transform messages for Claude format
				const claudeMessages: ChatMessage[] = messages.map((msg) => ({
					role: msg.role === 'model' ? 'assistant' : msg.role || 'user',
					content: msg.content || msg.message || '',
					timestamp: msg.timestamp || msg.created || new Date().toISOString()
				}));

				const claudeOptions: ChatOptions = {
					...options,
					model: modelInfo.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};

				const claudeResult = await Server.AI.Anthropic.Generate(
					pb,
					user,
					claudeMessages,
					claudeOptions
				);

				return {
					success: claudeResult.success,
					response: claudeResult.fullResponse,
					error: claudeResult.error,
					shouldStream
				};

			default:
				return {
					success: false,
					error: `Provider ${modelInfo.provider.providerKey} not supported`,
					shouldStream: false
				};
		}
	} catch (error: any) {
		console.error('RouteAIRequest error:', error);
		return {
			success: false,
			error: error.message || 'AI request failed',
			shouldStream: false
		};
	}
}
