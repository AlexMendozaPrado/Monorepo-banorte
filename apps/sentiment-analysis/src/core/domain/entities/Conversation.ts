export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  clientName: string;
  channel: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationEntity implements Conversation {
  constructor(
    public readonly id: string,
    public readonly clientName: string,
    public readonly channel: string,
    public readonly messages: ConversationMessage[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Conversation ID cannot be empty');
    }
    
    if (!this.clientName || this.clientName.trim() === '') {
      throw new Error('Client name cannot be empty');
    }
    
    if (!this.channel || this.channel.trim() === '') {
      throw new Error('Channel cannot be empty');
    }
    
    if (!Array.isArray(this.messages)) {
      throw new Error('Messages must be an array');
    }
  }

  public addMessage(message: ConversationMessage): ConversationEntity {
    const updatedMessages = [...this.messages, message];
    return new ConversationEntity(
      this.id,
      this.clientName,
      this.channel,
      updatedMessages,
      this.createdAt,
      new Date()
    );
  }

  public getMessageCount(): number {
    return this.messages.length;
  }

  public getLastMessage(): ConversationMessage | null {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  public getConversationText(): string {
    return this.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      clientName: this.clientName,
      channel: this.channel,
      messages: this.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
