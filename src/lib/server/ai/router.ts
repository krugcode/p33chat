import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { ChatMessage, ChatOptions } from '$lib/types/ai';
import { Server } from '..';

export async function RouteAIRequest(
	pb: TypedPocketBase,
	user: any,
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
	console.log('MODELINFO', modelInfo, modelInfo);
	console.log('SHOULD THIS BE STREAMED?', shouldStream);
	try {
		switch (modelInfo.provider.providerKey) {
			case 'google':
				const result = await Server.AI.Google.Generate(pb, user, messages, {
					...options,
					model: modelInfo.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens
				});
				return {
					success: result.success,
					response: result.fullResponse,
					error: result.error,
					shouldStream
				};

			case 'openai':
				// TODO: Implement OpenAI routing
				return {
					success: false,
					error: 'OpenAI routing not implemented yet',
					shouldStream
				};

			case 'anthropic':
				// TODO: Implement Claude routing
				return {
					success: false,
					error: 'Claude routing not implemented yet',
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
		return {
			success: false,
			error: error.message || 'AI request failed',
			shouldStream: false
		};
	}
}
