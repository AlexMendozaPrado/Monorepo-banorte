import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import {
  ChatServicePort,
  ChatOptions,
  ChatResponse,
  StreamChatResponse,
} from "@/core/domain/chat/ports/ChatServicePort";
import { ChatMessage, createChatMessage } from "@/core/domain/chat/ChatMessage";

/**
 * Implementation of ChatServicePort using Vercel AI SDK with OpenAI
 * This implementation follows best practices from AI SDK documentation
 * @see https://ai-sdk.dev/docs/ai-sdk-core/overview
 * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
 */
export class OpenAIChatService implements ChatServicePort {
  constructor(private readonly defaultModel: string = "gpt-4o") {}

  /**
   * Generate a chat response (non-streaming)
   * Uses generateText from AI SDK for non-interactive scenarios
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;

    try {
      // Convert domain messages to AI SDK format
      const aiMessages = this.convertMessagesToAIFormat(messages);

      // Generate response using AI SDK
      const result = await generateText({
        model: openai(model),
        messages: aiMessages,
        temperature,
        maxTokens,
        maxRetries: 2, // Default retry strategy
      });

      // Create domain message from response
      const assistantMessage = createChatMessage({
        role: "assistant",
        content: result.text,
        metadata: {
          model,
          tokenCount: result.usage?.totalTokens,
        },
      });

      return {
        message: assistantMessage,
        metadata: {
          model,
          totalTokens: result.usage?.totalTokens,
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          finishReason: result.finishReason,
        },
      };
    } catch (error) {
      console.error("Error in chat:", error);
      throw new Error(
        `Failed to generate chat response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a streaming chat response
   * Uses streamText from AI SDK for interactive applications like chatbots
   * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
   */
  async chatStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<StreamChatResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;

    try {
      // Convert domain messages to AI SDK format
      const aiMessages = this.convertMessagesToAIFormat(messages);

      // Generate streaming response using AI SDK
      const result = streamText({
        model: openai(model),
        messages: aiMessages,
        temperature,
        maxTokens,
        maxRetries: 2,
        // Optional callbacks for monitoring
        onFinish: ({ text, usage, finishReason }) => {
          console.log("Stream finished:", {
            textLength: text.length,
            usage,
            finishReason,
          });
        },
        onError: (error) => {
          console.error("Stream error:", error);
        },
      });

      // Return the text stream (only text deltas, no tool calls or other events)
      return {
        stream: result.textStream,
        metadata: {
          model,
        },
      };
    } catch (error) {
      console.error("Error in chatStream:", error);
      throw new Error(
        `Failed to generate streaming chat response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Helper method to convert domain ChatMessages to AI SDK message format
   * AI SDK expects messages in the format: { role: string, content: string }
   */
  private convertMessagesToAIFormat(
    messages: ChatMessage[]
  ): Array<{ role: "user" | "assistant" | "system"; content: string }> {
    return messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));
  }
}
