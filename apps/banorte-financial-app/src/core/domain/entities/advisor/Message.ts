import { v4 as uuidv4 } from 'uuid';

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export enum MessageIntent {
  QUESTION = 'QUESTION',
  ADVICE_REQUEST = 'ADVICE_REQUEST',
  DATA_QUERY = 'DATA_QUERY',
  TRANSACTION = 'TRANSACTION',
  GENERAL = 'GENERAL',
}

export interface CreateMessageData {
  conversationId: string;
  role: MessageRole;
  content: string;
  intent?: MessageIntent;
  metadata?: Record<string, any>;
}

export class Message {
  private readonly createdAt: Date;

  private constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly intent: MessageIntent,
    public readonly metadata: Record<string, any>
  ) {
    this.createdAt = new Date();
    this.validate();
  }

  static create(data: CreateMessageData): Message {
    return new Message(
      uuidv4(),
      data.conversationId,
      data.role,
      data.content,
      data.intent || MessageIntent.GENERAL,
      data.metadata || {}
    );
  }

  private validate(): void {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (this.content.length > 4000) {
      throw new Error('Message content too long (max 4000 characters)');
    }
  }

  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      role: this.role,
      content: this.content,
      intent: this.intent,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

