import { Server } from '$lib/server';
import { MovePocketBaseExpandsInline } from '$lib/utils';

export async function GET({ url, locals, params }) {
	const { id: chatID, userProvider } = params;
	const modelID = url.searchParams.get('modelID');
	const user = locals.pb.authStore.record;

	if (!user) {
		return new Response('User not authenticated', { status: 401 });
	}

	if (!modelID) {
		return new Response('Model ID required', { status: 400 });
	}

	if (!chatID) {
		return new Response('Chat ID required', { status: 400 });
	}

	return new Response(
		new ReadableStream({
			start(controller) {
				streamAIResponse(chatID, userProvider, modelID, user, controller, locals.pb);
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

	userProviderID: string,

	modelId: string,
	user: any,
	controller: ReadableStreamDefaultController,
	pb: any
) {
	try {
		let userProvider = await pb.collection('userProviders').getOne(userProviderID, {
			expand: 'provider'
		});

		if (!userProvider?.id) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: `No API key found for provider: ${userProviderID}`
				})}\n\n`
			);
			controller.close();
			return;
		}
		userProvider = MovePocketBaseExpandsInline(userProvider);
		// get model features
		const modelFeatures = await Server.Providers.GetModelFeatures(
			pb,
			modelId,
			userProvider.provider.id
		);
		console.log('modelfeatures', modelFeatures);
		if (!modelFeatures.data) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: 'Model features not found'
				})}\n\n`
			);
			controller.close();
			return;
		}

		const routeRequestData = MovePocketBaseExpandsInline(modelFeatures.data);
		console.log('Routerequestdata', routeRequestData);

		if (!routeRequestData.supportsStreaming) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: `Model ${routeRequestData.model.name} does not support streaming`
				})}\n\n`
			);
			controller.close();
			return;
		}

		// get conversation messages
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

		// format messages (same logic as createmessage)
		const messages = messagesResponse.data.map((msg) => {
			let attachments = [];
			if (msg.attachments) {
				try {
					if (typeof msg.attachments === 'object') {
						attachments = Array.isArray(msg.attachments) ? msg.attachments : [msg.attachments];
					} else if (typeof msg.attachments === 'string') {
						attachments = JSON.parse(msg.attachments);
					}
				} catch (parseError) {
					attachments = [];
				}
			}

			return {
				role: msg.role.toLowerCase(),
				content: msg.message,
				timestamp: msg.created,
				attachments
			};
		});

		// get decrypted api key
		const apiKeyResult = await Server.Chats.GetAPIKeyFromProvider(pb, user, userProvider);
		if (!apiKeyResult.data) {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'error',
					message: 'Failed to decrypt API key'
				})}\n\n`
			);
			controller.close();
			return;
		}

		// route to streaming router
		await Server.AI.RouterStream.RouteAIStreamRequest(
			pb,
			user,
			apiKeyResult.data,
			routeRequestData,
			messages,
			controller,
			{
				temperature: 0.7,
				chatId: chatId
			}
		);
	} catch (error: any) {
		console.error('stream setup error:', error);
		controller.enqueue(
			`data: ${JSON.stringify({
				type: 'error',
				message: error.message || 'Stream setup failed'
			})}\n\n`
		);
		controller.close();
	}
}
