import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { ChatMessage, ChatOptions } from '$lib/types/ai';
import { Server } from '..';

export async function RouteAIStreamRequest(
	pb: TypedPocketBase,
	user: any,
	apiKey: string,
	modelInfo: Record<string, any>,
	messages: Record<string, any>[],
	controller: ReadableStreamDefaultController,
	options: ChatOptions = {}
): Promise<void> {
	try {
		const normalizedMessages = normalizeMessagesForProvider(
			messages,
			modelInfo.provider.providerKey
		);
		switch (modelInfo.provider.providerKey) {
			case 'google':
				const googleOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 8192,
					temperature: options.temperature || 0.7
				};

				await Server.AI.Google.StreamWithChatID(
					pb,
					user,
					apiKey,
					options.chatId,
					modelInfo.model.id,
					normalizedMessages,
					controller,
					googleOptions
				);
				break;

			case 'openai':
				console.log('🔄 Routing to OpenAI streaming...');
				const openaiOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};

				await Server.AI.OpenAI.Stream(
					pb,
					user,
					apiKey,
					options.chatId,
					modelInfo.model.id,
					normalizedMessages,
					controller,
					openaiOptions
				);
				break;

			case 'anthropic':
				console.log('🔄 Routing to Anthropic streaming...');
				const anthropicOptions = {
					...options,
					model: modelInfo.model.key, // Fixed: was modelInfo.key
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};

				await Server.AI.Anthropic.Stream(
					pb,
					user,
					apiKey,
					options.chatId,
					modelInfo.model.id,
					normalizedMessages,
					controller,
					anthropicOptions
				);
				break;

			case 'openrouter':
				console.log('🔄 Routing to OpenRouter streaming...');
				const openrouterOptions = {
					...options,
					model: modelInfo.model.key,
					maxTokens: options.maxTokens || modelInfo.maxOutputTokens || 4096,
					temperature: options.temperature || 0.7
				};

				await Server.AI.OpenRouter.Stream(
					pb,
					user,
					apiKey,
					options.chatId,
					modelInfo.model.id,
					normalizedMessages,
					controller,
					openrouterOptions
				);
				break;

			default:
				console.log('❌ Provider does not support streaming:', modelInfo.provider.providerKey);
				controller.enqueue(
					`data: ${JSON.stringify({
						type: 'error',
						message: `Provider ${modelInfo.provider.providerKey} does not support streaming`
					})}\n\n`
				);
				break;
		}
	} catch (error: any) {
		console.error('💥 RouteAIStreamRequest error:', error);
		controller.enqueue(
			`data: ${JSON.stringify({
				type: 'error',
				message: error.message || 'AI streaming failed'
			})}\n\n`
		);
	}
}

// Reuse the existing message normalization function
function normalizeMessagesForProvider(messages: any[], providerKey: string) {
	return messages.map((msg) => {
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
				console.error('❌ Error formatting attachments:', error);
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

// Copy the attachment formatting function from your existing router
function formatMessageWithAttachments(
	textContent: string,
	attachments: any[],
	providerKey: string
) {
	// For Google Gemini - use simple text concatenation
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

	// Fallback
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
