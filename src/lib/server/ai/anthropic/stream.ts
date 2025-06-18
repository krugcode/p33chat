import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { ChatOptions } from '$lib/types/ai';
import { Server } from '../..';
import { DateTimeFormat } from '$lib/utils';

export async function Stream(
  pb: TypedPocketBase,
  user: any,
  apiKey: string,

  chatID: string,
  modelID: string,
  messages: any[],
  controller: ReadableStreamDefaultController,
  options: ChatOptions
): Promise<void> {
  let fullResponse = '';
  let messageId: string | null = null;

  try {
    console.log('🔄 Anthropic streaming started');

    // Separate system message from conversation messages
    const systemMessage = messages.find((msg) => msg.role === 'system');
    const conversationMessages = messages.filter((msg) => msg.role !== 'system');

    // Format messages for Anthropic
    const anthropicMessages = conversationMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody: any = {
      model: options.model || 'claude-3-5-sonnet-20241022',
      messages: anthropicMessages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true
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
      throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream reader');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            // Handle different Anthropic event types
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              const content = parsed.delta.text;
              fullResponse += content;

              controller.enqueue(
                `data: ${JSON.stringify({
                  type: 'chunk',
                  content: content
                })}\n\n`
              );
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }

    // Save the complete response if we have a chatId
    if (fullResponse && options.chatId) {
      console.log('CLAUDE OUTPUT', options);
      try {
        const saveResponse = await Server.Chats.CreateMessage(pb, user, 'Assistant', {
          chat: chatID,
          model: modelID || 'claude-3-5-sonnet-20241022',
          message: fullResponse,
          status: 'Success',
          timeSent: DateTimeFormat()
        });
        messageId = saveResponse.data?.id;
      } catch (saveError) {
        console.error('❌ Failed to save Anthropic response:', saveError);
      }
    }

    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'complete',
        messageId
      })}\n\n`
    );
  } catch (error: any) {
    console.error('❌ Anthropic streaming error:', error);
    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'error',
        message: `Anthropic error: ${error.message}`
      })}\n\n`
    );
  }
}
