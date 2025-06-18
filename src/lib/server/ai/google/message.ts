import { Server } from '$lib/server';
import type { ChatMessage, ChatOptions, StreamResult } from '$lib/types/ai';
import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { AuthRecord } from 'pocketbase';

function formatMessages(messages: ChatMessage[]): {
	contents: any[];
	systemInstruction?: string;
} {
	const systemMessage = messages.find((msg) => msg.role === 'system');
	const conversationMessages = messages.filter((msg) => msg.role !== 'system');

	const contents = conversationMessages.map((msg) => ({
		role: msg.role === 'assistant' ? 'model' : 'user',
		parts: [{ text: msg.content }]
	}));

	return {
		contents,
		systemInstruction: systemMessage?.content
	};
}

export async function Generate(
	apiKey: string,
	messages: ChatMessage[],
	options: ChatOptions = {}
): Promise<StreamResult> {
	const { model = 'gemini-1.5-flash', temperature = 0.7, maxTokens = 2000 } = options;

	if (!apiKey) {
		return {
			modelID: model,
			messageID: '',
			fullResponse: '',
			success: false,
			error: 'Google AI API key not found for this user'
		};
	}

	try {
		const { contents, systemInstruction } = formatMessages(messages);

		const requestBody: any = {
			contents,
			generationConfig: {
				temperature,
				maxOutputTokens: maxTokens,
				candidateCount: 1
			}
		};

		if (systemInstruction) {
			requestBody.systemInstruction = {
				parts: [{ text: systemInstruction }]
			};
		}

		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {
				modelID: model,
				messageID: '',
				fullResponse: '',
				success: false,
				error: `Gemini API error: ${errorData.error?.message || response.statusText}`
			};
		}

		const data = await response.json();
		console.log('Response from Gemini:', data);
		const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
		const tokenCount = data.usageMetadata?.totalTokenCount || 0;

		return {
			modelID: model,
			messageID: '',
			fullResponse: content,
			success: true,
			tokenCount
		};
	} catch (error: any) {
		return {
			modelID: model,
			messageID: '',
			fullResponse: '',
			success: false,
			error: `Gemini API error: ${error.message}`
		};
	}
}
