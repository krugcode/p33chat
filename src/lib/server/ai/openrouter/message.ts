import type { ChatOptions, StreamResult } from '$lib/types/ai';

export async function Generate(
  apiKey: string,
  messages: any[],
  options: ChatOptions = {}
): Promise<StreamResult> {
  const { model = 'anthropic/claude-3.5-sonnet', temperature = 0.7, maxTokens = 4096 } = options;

  if (!apiKey) {
    return {
      modelID: model,
      messageID: '',
      fullResponse: '',
      success: false,
      error: 'OpenRouter API key not found for this user'
    };
  }

  try {
    // Format messages for OpenRouter (OpenAI-compatible format)
    const openrouterMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model,
      messages: openrouterMessages,
      temperature,
      max_tokens: maxTokens
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-site.com', // Replace with your actual site URL
        'X-Title': 'T3 Chat Clone'
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
        error: `OpenRouter API error: ${errorData.error?.message || response.statusText}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokenCount = data.usage?.total_tokens || 0;

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
      error: `OpenRouter API error: ${error.message}`
    };
  }
}
