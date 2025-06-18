import { Server } from '$lib/server';
import { GetModelInfo } from '$lib/server/ai/router';

export async function GET({ url, locals, params }) {
	const chatID = params.id;
	const modelID = url.searchParams.get('modelID');
	const user = locals.pb.authStore.record;

	if (!user) {
		return new Response('User not authenticated', { status: 401 });
	}

	if (!modelID) {
		return new Response('Model ID required', { status: 400 });
	}

	return new Response(
		new ReadableStream({
			start(controller) {
				streamAIResponse(chatID, modelID, user, controller, locals.pb);
			}
		}),
		{
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'Access-Control-Allow-Origin': '*'
			}
		}
	);
}

async function streamAIResponse(
	chatId: string,
	modelId: string,
	user: any,
	controller: ReadableStreamDefaultController,
	pb: any
) {
	let fullResponse = '';
	let messageId: string | null = null;

	try {
		// Get model info
		const modelInfo = await GetModelInfo(pb, modelId);
		if (!modelInfo) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: 'Model not found'
				})}\n\n`
			);
			controller.close();
			return;
		}

		const messagesResponse = await Server.Chats.FetchChatMessages(pb, chatId);
		if (!messagesResponse.data) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: 'Failed to fetch conversation history'
				})}\n\n`
			);
			controller.close();
			return;
		}

		// Convert to AI format
		const messages = messagesResponse.data.map((msg) => ({
			role: msg.role === 'User' ? 'user' : 'assistant',
			content: msg.message,
			timestamp: msg.created
		}));

		// Route to appropriate provider for streaming
		switch (modelInfo.provider.providerKey) {
			case 'google':
				const { streamContent } = await import('$lib/server/ai/google/message');

				const stream = await streamContent(pb, user, messages, {
					model: modelInfo.key,
					temperature: 0.7,
					maxTokens: modelInfo.maxOutputTokens
				});

				for await (const chunk of stream) {
					if (chunk.error) {
						controller.enqueue(
							`data: ${JSON.stringify({
								type: 'error',
								message: chunk.error
							})}\n\n`
						);
						break;
					}

					if (chunk.content) {
						fullResponse += chunk.content;
						controller.enqueue(
							`data: ${JSON.stringify({
								type: 'chunk',
								content: chunk.content
							})}\n\n`
						);
					}

					if (chunk.finished) {
						// Save the complete response
						if (fullResponse) {
							try {
								const saveResponse = await Server.Chats.CreateMessage(pb, 'Assistant', {
									chat: chatId,
									model: modelId,
									provider: modelInfo.provider.id,
									message: fullResponse
								});
								messageId = saveResponse.data?.id;
							} catch (saveError) {
								console.error('Failed to save AI response:', saveError);
							}
						}

						controller.enqueue(
							`data: ${JSON.stringify({
								type: 'complete',
								messageId
							})}\n\n`
						);
						break;
					}
				}
				break;

			default:
				// For non-Google providers, fall back to direct API
				controller.enqueue(
					`data: ${JSON.stringify({
						type: 'error',
						message: `Streaming not implemented for ${modelInfo.provider.providerKey}`
					})}\n\n`
				);
				break;
		}
	} catch (error: any) {
		controller.enqueue(
			`data: ${JSON.stringify({
				type: 'error',
				message: error.message
			})}\n\n`
		);
	} finally {
		controller.close();
	}
}
