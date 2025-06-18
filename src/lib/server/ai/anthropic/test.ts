export async function TestAIKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
	try {
		// Anthropic doesn't have a models endpoint, so we make a minimal message request
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'claude-3-haiku-20240307',
				max_tokens: 1,
				messages: [{ role: 'user', content: 'Hi' }]
			})
		});

		if (response.ok || response.status === 400) {
			// 400 might be rate limit but key is valid
			return { isValid: true, model: 'claude-3-haiku-20240307' };
		}

		return { isValid: false };
	} catch {
		return { isValid: false };
	}
}
