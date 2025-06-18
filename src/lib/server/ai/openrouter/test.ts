export async function TestAIKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const defaultModel =
        data.data?.find((m: any) => m.id.includes('claude-3.5-sonnet')) ||
        data.data?.find((m: any) => m.id.includes('claude')) ||
        data.data?.[0];
      return { isValid: true, model: defaultModel?.id };
    }

    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}
