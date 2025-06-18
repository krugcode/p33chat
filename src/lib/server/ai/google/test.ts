export async function TestAIKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
	try {
		// first try to list models to validate the key
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
		);

		if (response.ok) {
			const data = await response.json();
			const defaultModel = data.models?.find(
				(m: any) =>
					m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent')
			);
			return {
				isValid: true,
				model: defaultModel?.name?.split('/').pop() || 'gemini-pro'
			};
		}
		return { isValid: false };
	} catch {
		return { isValid: false };
	}
}
