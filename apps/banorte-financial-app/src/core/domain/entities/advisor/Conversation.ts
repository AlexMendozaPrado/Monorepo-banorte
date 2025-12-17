import { v4 as uuidv4 } from 'uuid';
import { Message } from './Message';

export class Conversation {
  private _messages: Message[] = [];
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string
  ) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(userId: string, title: string = 'Nueva Conversación'): Conversation {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    return new Conversation(uuidv4(), userId, title);
  }

  addMessage(message: Message): void {
    if (message.conversationId !== this.id) {
      throw new Error('Message does not belong to this conversation');
    }
    this._messages.push(message);
    this.updatedAt = new Date();
  }

  getMessages(): readonly Message[] {
    return this._messages;
  }

  getLastMessage(): Message | undefined {
    return this._messages[this._messages.length - 1];
  }

  getMessageCount(): number {
    return this._messages.length;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      messages: this._messages.map(m => m.toJSON()),
      messageCount: this.getMessageCount(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

