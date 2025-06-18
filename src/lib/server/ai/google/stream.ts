import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { ChatOptions } from '$lib/types/ai';
import { Server } from '../..';
import { DateTimeFormat } from '$lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function StreamWithChatID(
	pb: TypedPocketBase,
	user: any,
	apiKey: string,
	chatId: string,
	modelId: string,
	messages: any[],
	controller: ReadableStreamDefaultController,
	options: ChatOptions
): Promise<void> {
	let fullResponse = '';
	let completedResponse = false;
	let messageId: string | null = null;

	try {
		console.log('🔄 Google streaming started for chat:', chatId);

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: options.model || 'gemini-1.5-pro' });

		// Convert messages to Google's format
		const googleMessages = messages.map((msg) => ({
			role: msg.role,
			parts: typeof msg.content === 'string' ? [{ text: msg.content }] : msg.content
		}));

		// Start streaming
		const chat = model.startChat({
			history: googleMessages.slice(0, -1),
			generationConfig: {
				temperature: options.temperature || 0.7,
				maxOutputTokens: options.maxTokens || 8192
			}
		});

		const lastMessage = googleMessages[googleMessages.length - 1];
		const lastMessageText =
			typeof lastMessage.parts === 'string'
				? lastMessage.parts
				: lastMessage.parts.map((p) => p.text).join('');

		const result = await chat.sendMessageStream(lastMessageText);

		// Process streaming chunks
		for await (const chunk of result.stream) {
			const chunkText = chunk.text();
			if (chunkText) {
				fullResponse += chunkText;

				controller.enqueue(
					`data: ${JSON.stringify({
						type: 'chunk',
						content: chunkText
					})}\n\n`
				);
			}
		}
		if (fullResponse) {
			try {
				console.log('Options', options);
				console.log('chatID', chatId);
				const saveResponse = await Server.Chats.CreateMessage(pb, user, 'Assistant', {
					chat: chatId,
					model: modelId,
					message: fullResponse,
					status: 'Success',
					timeSent: DateTimeFormat()
				});
				messageId = saveResponse.data?.id;
				console.log('SAVE RESPONSE', saveResponse);
			} catch (saveError) {
				console.error('❌ Failed to save AI response:', saveError);
			}
		}

		controller.enqueue(
			`data: ${JSON.stringify({
				type: 'complete',
				messageId
			})}\n\n`
		);
	} catch (error: any) {
		console.error('❌ Google streaming error:', error);
		controller.enqueue(
			`data: ${JSON.stringify({
				type: 'error',
				message: `Google AI error: ${error.message}`
			})}\n\n`
		);
	}
}
