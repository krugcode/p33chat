import type { ChatOptions, StreamResult } from '$lib/types/ai';

export async function Generate(
  apiKey: string,
  messages: any[],
  options: ChatOptions = {}
): Promise<StreamResult> {
  const { model = 'gpt-4o', temperature = 0.7, maxTokens = 4096 } = options;

  if (!apiKey) {
    return {
      modelID: model,
      messageID: '',
      fullResponse: '',
      success: false,
      error: 'OpenAI API key not found for this user'
    };
  }

  try {
    // Format messages for OpenAI
    const openaiMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
        error: `OpenAI API error: ${errorData.error?.message || response.statusText}`
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
      error: `OpenAI API error: ${error.message}`
    };
  }
}
