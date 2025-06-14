import type { ChatMessage, ChatOptions, StreamChunk, StreamResult } from '$lib/types/ai';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Convert app messages to OpenAI format
 */
export function formatMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));
}

/**
 * PRIMARY METHOD: Chunked streaming chat with robust error handling
 * This should be your default method for all chat interactions
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: StreamChunk) => Promise<void> | void,
  options: ChatOptions = {}
): Promise<StreamResult> {
  const { model = 'gpt-4', temperature = 0.7, maxTokens = 2000 } = options;

  let fullResponse = '';
  let tokenCount = 0;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: formatMessages(messages),
      temperature,
      max_tokens: maxTokens,
      stream: true
    });

    for await (const chunk of stream) {
      try {
        const content = chunk.choices[0]?.delta?.content || '';
        const finished = chunk.choices[0]?.finish_reason !== null;

        // Track tokens if available
        if (chunk.usage?.total_tokens) {
          tokenCount = chunk.usage.total_tokens;
        }

        if (content) {
          fullResponse += content;
        }

        // Send chunk to handler
        await onChunk({
          content,
          finished,
          totalTokens: tokenCount
        });

        if (finished) break;
      } catch (chunkError) {
        // Log chunk error but continue stream
        console.error('Chunk processing error:', chunkError);

        // Notify handler of chunk error
        await onChunk({
          content: '',
          finished: false,
          error: `Chunk error: ${chunkError.message}`
        });
      }
    }

    return {
      fullResponse,
      success: true,
      tokenCount
    };
  } catch (error) {
    // Stream-level error
    const errorMessage = `OpenAI stream error: ${error.message}`;

    // Notify handler of stream error
    try {
      await onChunk({
        content: '',
        finished: true,
        error: errorMessage
      });
    } catch (handlerError) {
      console.error('Error handler failed:', handlerError);
    }

    return {
      fullResponse,
      success: false,
      error: errorMessage,
      tokenCount
    };
  }
}

/**
 * ALTERNATIVE METHOD: Simple request/response (non-streaming)
 * Use this for simple use cases where streaming isn't needed
 */
export async function chatSimple(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<StreamResult> {
  const { model = 'gpt-4', temperature = 0.7, maxTokens = 2000 } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: formatMessages(messages),
      temperature,
      max_tokens: maxTokens,
      stream: false
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokenCount = completion.usage?.total_tokens || 0;

    return {
      fullResponse: content,
      success: true,
      tokenCount
    };
  } catch (error) {
    return {
      fullResponse: '',
      success: false,
      error: `OpenAI API error: ${error.message}`
    };
  }
}

/**
 * WRAPPER: Server-Sent Events streaming
 * Use this in your SvelteKit +server.ts endpoints
 */
export async function streamToSSE(
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController,
  options: ChatOptions & {
    onSave?: (response: string) => Promise<string>; // Returns messageId
  } = {}
): Promise<void> {
  const { onSave, ...chatOptions } = options;
  let messageId: string | null = null;

  const result = await streamChat(
    messages,
    async (chunk) => {
      // Check if client disconnected
      if (controller.desiredSize === null) {
        throw new Error('Client disconnected');
      }

      // Send chunk to client
      controller.enqueue(
        `data: ${JSON.stringify({
          type: chunk.finished ? 'complete' : 'chunk',
          content: chunk.content,
          error: chunk.error,
          messageId: chunk.finished ? messageId : null
        })}\n\n`
      );
    },
    chatOptions
  );

  // Save complete response if successful
  if (result.success && onSave && result.fullResponse) {
    try {
      messageId = await onSave(result.fullResponse);

      // Send final completion with messageId
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'saved',
          messageId,
          tokenCount: result.tokenCount
        })}\n\n`
      );
    } catch (saveError) {
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'error',
          error: `Save failed: ${saveError.message}`,
          partialResponse: result.fullResponse
        })}\n\n`
      );
    }
  }

  // Handle stream errors
  if (!result.success) {
    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'error',
        error: result.error,
        partialResponse: result.fullResponse
      })}\n\n`
    );
  }

  controller.close();
}

/**
 * UTILITY: Validate API setup
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}

/**
 * UTILITY: Get available models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const models = await openai.models.list();
    return models.data
      .filter((model) => model.id.includes('gpt'))
      .map((model) => model.id)
      .sort();
  } catch {
    return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
}

/**
 * HELPER: Create system message
 */
export function createSystemMessage(content: string): ChatMessage {
  return {
    role: 'system',
    content,
    timestamp: new Date().toISOString()
  };
}

/**
 * HELPER: Create user message
 */
export function createUserMessage(content: string): ChatMessage {
  return {
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  };
}

/**
 * HELPER: Create assistant message
 */
export function createAssistantMessage(content: string): ChatMessage {
  return {
    role: 'assistant',
    content,
    timestamp: new Date().toISOString()
  };
}
