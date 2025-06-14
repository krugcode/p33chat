import { Server } from '$lib/server';

// +server.ts - Server-Sent Events endpoint
export async function GET({ url, locals }) {
  const chatId = url.searchParams.get('chatId');

  return new Response(
    new ReadableStream({
      start(controller) {
        // Set up SSE headers
        const headers = {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        };

        // Stream AI response
        streamAIResponse(chatId, controller);
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

async function streamAIResponse(chatId: string, controller: ReadableStreamDefaultController) {
  try {
    // Get conversation history
    const messages = await Server.Chats.GetMessages(chatId);

    // Call AI API (OpenAI, Anthropic, etc.)
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      stream: true
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;

        // Send chunk to client
        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'chunk',
            content: content
          })}\n\n`
        );
      }
    }

    // Save complete response to database
    await Server.Chats.SaveMessage(pb, {
      chatId,
      content: fullResponse,
      role: 'assistant'
    });

    // Send completion signal
    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'complete',
        messageId: savedMessage.id
      })}\n\n`
    );
  } catch (error) {
    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'error',
        message: error.message
      })}\n\n`
    );
  } finally {
    controller.close();
  }
}
