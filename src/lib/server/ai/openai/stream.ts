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
    console.log('🔄 OpenAI streaming started');

    // Format messages for OpenAI
    const openaiMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model: options.model || 'gpt-4o',
      messages: openaiMessages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true
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
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
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
            const content = parsed.choices?.[0]?.delta?.content || '';

            if (content) {
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
      try {
        const saveResponse = await Server.Chats.CreateMessage(pb, user, 'Assistant', {
          chat: chatID,
          model: modelID || 'gpt-4o',
          message: fullResponse,
          status: 'Success',
          timeSent: DateTimeFormat()
        });
        messageId = saveResponse.data?.id;
      } catch (saveError) {
        console.error('❌ Failed to save OpenAI response:', saveError);
      }
    }

    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'complete',
        messageId
      })}\n\n`
    );
  } catch (error: any) {
    console.error('❌ OpenAI streaming error:', error);
    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'error',
        message: `OpenAI error: ${error.message}`
      })}\n\n`
    );
  }
}
