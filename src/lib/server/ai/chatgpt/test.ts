// helper functions for testing api keys
export async function TestAIKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
	try {
		const response = await fetch('https://api.openai.com/v1/models', {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const data = await response.json();
			const defaultModel = data.data?.find((m: any) => m.id.includes('gpt-4')) || data.data?.[0];
			return { isValid: true, model: defaultModel?.id };
		}

		return { isValid: false };
	} catch {
		return { isValid: false };
	}
}
