import { ChatMessage } from "../ChatMessage";

/**
 * Port (interface) for chat/LLM service
 * Follows the Dependency Inversion Principle
 */
export interface ChatOptions {
  /** Model to use for chat */
  model?: string;

  /** Temperature (0-2) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Enable streaming */
  stream?: boolean;

  /** Additional provider-specific options */
  [key: string]: any;
}

export interface ChatResponse {
  /** The assistant's message */
  message: ChatMessage;

  /** Metadata about the response */
  metadata: {
    /** Model used */
    model: string;

    /** Total tokens used */
    totalTokens?: number;

    /** Prompt tokens */
    promptTokens?: number;

    /** Completion tokens */
    completionTokens?: number;

    /** Finish reason */
    finishReason?: string;
  };
}

export interface StreamChatResponse {
  /** Stream of text chunks */
  stream: ReadableStream<string>;

  /** Metadata about the stream */
  metadata: {
    /** Model used */
    model: string;
  };
}

export interface ChatServicePort {
  /**
   * Generate a chat response
   * @param messages - Conversation history
   * @param options - Chat options
   * @returns Chat response with metadata
   */
  chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse>;

  /**
   * Generate a streaming chat response
   * @param messages - Conversation history
   * @param options - Chat options
   * @returns Streaming response
   */
  chatStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<StreamChatResponse>;
}
