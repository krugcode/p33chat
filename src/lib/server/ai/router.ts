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

	try {
		const normalizedMessages = normalizeMessagesForProvider(
			messages,
			modelInfo.provider.providerKey
		);

		switch (modelInfo.provider.providerKey) {
			case 'google':
				const geminiOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 8192,
					temperature: options.temperature || 0.7
				};

				const result = await Server.AI.Google.Generate(apiKey, normalizedMessages, geminiOptions);

				return {
					success: result.success,
					response: result.fullResponse,
					error: result.error,
					shouldStream
				};

			case 'openai':
				const openaiOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};
				const openaiResult = await Server.AI.OpenAI.Generate(
					apiKey,
					normalizedMessages,
					openaiOptions
				);

				return {
					success: openaiResult.success,
					response: openaiResult.fullResponse,
					error: openaiResult.error,
					shouldStream
				};

			case 'anthropic':
				const claudeOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};
				const claudeResult = await Server.AI.Anthropic.Generate(
					apiKey,
					normalizedMessages,
					claudeOptions
				);

				return {
					success: claudeResult.success,
					response: claudeResult.fullResponse,
					error: claudeResult.error,
					shouldStream
				};

			case 'openrouter':
				const openrouterOptions: ChatOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};
				const openrouterResult = await Server.AI.OpenRouter.Generate(
					apiKey,
					normalizedMessages,
					openrouterOptions
				);

				return {
					success: openrouterResult.success,
					response: openrouterResult.fullResponse,
					error: openrouterResult.error,
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

function normalizeMessagesForProvider(messages: any[], providerKey: string) {
	return messages.map((msg, index) => {
		let role = msg.role.toLowerCase();

		if (role === 'user' || role === 'assistant') {
			if (providerKey === 'google' && role === 'assistant') {
				role = 'model';
			}
		} else {
			role = 'user';
		}

		let content = msg.content || msg.message || '';

		if (msg.attachments && msg.attachments.length > 0) {
			try {
				content = formatMessageWithAttachments(content, msg.attachments, providerKey);
			} catch (error) {
				content = msg.content || msg.message || '';
			}
		}

		return {
			role,
			content,
			timestamp: msg.timestamp || msg.created
		};
	});
}

function formatMessageWithAttachments(
	textContent: string,
	attachments: any[],
	providerKey: string
) {
	if (providerKey === 'google') {
		let fullContent = textContent || '';

		attachments.forEach((attachment) => {
			if (['text', 'code', 'json', 'html', 'url', 'image'].includes(attachment.type)) {
				if (attachment.type === 'image') {
					fullContent += `\n\n--- ${attachment.name} (Image) ---\nNote: Image content not displayed in text format\n--- End of ${attachment.name} ---\n`;
				} else {
					fullContent += `\n\n--- ${attachment.name} ---\n${attachment.content}\n--- End of ${attachment.name} ---\n`;
				}
			}
		});

		return fullContent || '[Message with attachments]';
	}

	// For OpenAI, Anthropic, and OpenRouter - multipart support
	if (['openai', 'anthropic', 'openrouter'].includes(providerKey)) {
		const contentParts = [];

		if (textContent.trim()) {
			contentParts.push({
				type: 'text',
				text: textContent
			});
		}

		attachments.forEach((attachment) => {
			if (attachment.type === 'image' && attachment.content) {
				contentParts.push({
					type: 'image_url',
					image_url: {
						url: attachment.content
					}
				});
			} else if (['text', 'code', 'json', 'html', 'url'].includes(attachment.type)) {
				contentParts.push({
					type: 'text',
					text: `\n\n--- ${attachment.name} ---\n${attachment.content}\n--- End of ${attachment.name} ---\n`
				});
			}
		});

		return contentParts.length > 1 ? contentParts : textContent;
	}

	let fullContent = textContent;
	attachments.forEach((attachment) => {
		if (['text', 'code', 'json', 'html', 'url'].includes(attachment.type)) {
			fullContent += `\n\n--- ${attachment.name} ---\n${attachment.content}\n--- End of ${attachment.name} ---\n`;
		} else if (attachment.type === 'image') {
			fullContent += `\n\n[Image: ${attachment.name}] - Note: This provider doesn't support image attachments\n`;
		}
	});

	return fullContent;
}
