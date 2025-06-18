import type { ChatOptions, StreamResult } from '$lib/types/ai';

export async function Generate(
  apiKey: string,
  messages: any[],
  options: ChatOptions = {}
): Promise<StreamResult> {
  const { model = 'claude-3-5-sonnet-20241022', temperature = 0.7, maxTokens = 4096 } = options;

  if (!apiKey) {
    return {
      modelID: model,
      messageID: '',
      fullResponse: '',
      success: false,
      error: 'Anthropic API key not found for this user'
    };
  }

  try {
    // Separate system message from conversation messages
    const systemMessage = messages.find((msg) => msg.role === 'system');
    const conversationMessages = messages.filter((msg) => msg.role !== 'system');

    // Format messages for Anthropic
    const anthropicMessages = conversationMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody: any = {
      model,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens
    };

    // Add system message if present
    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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
        error: `Anthropic API error: ${errorData.error?.message || response.statusText}`
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const tokenCount = inputTokens + outputTokens;

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
      error: `Anthropic API error: ${error.message}`
    };
  }
}
