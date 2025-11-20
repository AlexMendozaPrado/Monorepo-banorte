import { ChatMessage } from "./ChatMessage";
import { DocumentChunk } from "./DocumentChunk";

/**
 * Represents the context for a chat conversation
 * Includes message history and relevant document chunks
 */
export interface ChatContext {
  /** Conversation history */
  messages: ChatMessage[];

  /** Relevant document chunks retrieved for the current query */
  relevantChunks: Array<{
    /** The document chunk */
    chunk: DocumentChunk;

    /** Similarity score (0-1) */
    similarity: number;
  }>;

  /** Configuration for context window */
  config: {
    /** Maximum number of messages to include in context */
    maxMessages?: number;

    /** Maximum number of document chunks to include */
    maxChunks?: number;

    /** Minimum similarity threshold for chunks */
    minSimilarity?: number;
  };
}

/**
 * Factory function to create a new ChatContext
 */
export function createChatContext(params?: {
  messages?: ChatMessage[];
  relevantChunks?: ChatContext["relevantChunks"];
  config?: ChatContext["config"];
}): ChatContext {
  return {
    messages: params?.messages || [],
    relevantChunks: params?.relevantChunks || [],
    config: {
      maxMessages: params?.config?.maxMessages || 10,
      maxChunks: params?.config?.maxChunks || 5,
      minSimilarity: params?.config?.minSimilarity || 0.7,
    },
  };
}

/**
 * Helper function to add a message to the context
 */
export function addMessageToContext(
  context: ChatContext,
  message: ChatMessage
): ChatContext {
  const messages = [...context.messages, message];

  // Keep only the last N messages based on config
  const maxMessages = context.config.maxMessages || 10;
  const trimmedMessages =
    messages.length > maxMessages
      ? messages.slice(messages.length - maxMessages)
      : messages;

  return {
    ...context,
    messages: trimmedMessages,
  };
}

/**
 * Helper function to update relevant chunks in the context
 */
export function updateRelevantChunks(
  context: ChatContext,
  chunks: ChatContext["relevantChunks"]
): ChatContext {
  // Filter by minimum similarity
  const minSimilarity = context.config.minSimilarity || 0.7;
  const filteredChunks = chunks.filter(
    (item) => item.similarity >= minSimilarity
  );

  // Keep only top N chunks
  const maxChunks = context.config.maxChunks || 5;
  const sortedChunks = filteredChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxChunks);

  return {
    ...context,
    relevantChunks: sortedChunks,
  };
}
