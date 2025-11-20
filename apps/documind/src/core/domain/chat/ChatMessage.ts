/**
 * Represents a message in the chat conversation
 * This is a pure domain entity following Clean Architecture principles
 */
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;

  /** Role of the message sender */
  role: ChatRole;

  /** Content of the message */
  content: string;

  /** Timestamp when the message was created */
  createdAt: Date;

  /** Optional context documents used to generate this message */
  contextDocuments?: Array<{
    /** Document chunk ID */
    id: string;

    /** Document title */
    title: string;

    /** Similarity score (0-1) */
    similarity: number;
  }>;

  /** Optional metadata */
  metadata?: {
    /** Token count for this message */
    tokenCount?: number;

    /** Model used to generate this message */
    model?: string;

    /** Custom fields */
    [key: string]: any;
  };
}

/**
 * Factory function to create a new ChatMessage
 */
export function createChatMessage(params: {
  id?: string;
  role: ChatRole;
  content: string;
  contextDocuments?: ChatMessage["contextDocuments"];
  metadata?: ChatMessage["metadata"];
}): ChatMessage {
  return {
    id: params.id || crypto.randomUUID(),
    role: params.role,
    content: params.content,
    createdAt: new Date(),
    contextDocuments: params.contextDocuments,
    metadata: params.metadata,
  };
}
