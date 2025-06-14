import type { Single } from '$lib/types/server';

/**
 * Test if an API key is valid (after client-side decryption)
 * This function receives a temporarily decrypted key for validation
 */
export async function TestAPIKeyValidity(
	providerKey: string,
	temporaryAPIKey: string
): Promise<Single<{ isValid: boolean; model?: string }>> {
	let error: any | null = null;
	let notify: string = '';
	let result = { isValid: false, model: undefined as string | undefined };

	try {
		if (!providerKey || !temporaryAPIKey) {
			error = 'Provider and API key are required';
			return { data: result, error, notify };
		}

		// test the key with a minimal api call
		let testResult: boolean = false;
		let modelInfo: string | undefined;

		switch (providerKey) {
			case 'openai':
				const openaiResult = await estOpenAIKey(temporaryAPIKey);
				testResult = openaiResult.isValid;
				modelInfo = openaiResult.model;
				break;

			case 'anthropic':
				const anthropicResult = await testAnthropicKey(temporaryAPIKey);
				testResult = anthropicResult.isValid;
				modelInfo = anthropicResult.model;
				break;

			default:
				error = `Unsupported provider: ${providerKey}`;
				return { data: result, error, notify };
		}

		result = { isValid: testResult, model: modelInfo };
		notify = testResult ? 'API key is valid' : 'API key is invalid';
	} catch (e: any) {
		error = e;
		notify = e.message || 'Failed to test API key';
	}

	return { data: result, error, notify };
}
