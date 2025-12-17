import { IFinancialAdvisorPort } from '@/core/domain/ports/ai-services/IFinancialAdvisorPort';
import { Message, MessageRole } from '@/core/domain/entities/advisor/Message';
import { Conversation } from '@/core/domain/entities/advisor/Conversation';

export interface SendMessageDTO {
  conversationId?: string;
  userId: string;
  message: string;
  context?: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    totalDebt?: number;
    totalSavings?: number;
  };
}

export class SendMessageUseCase {
  private conversations: Map<string, Conversation> = new Map();

  constructor(
    private readonly financialAdvisor: IFinancialAdvisorPort
  ) {}

  async execute(dto: SendMessageDTO) {
    // Get or create conversation
    let conversation: Conversation;
    if (dto.conversationId && this.conversations.has(dto.conversationId)) {
      conversation = this.conversations.get(dto.conversationId)!;
    } else {
      conversation = Conversation.create(dto.userId);
      this.conversations.set(conversation.id, conversation);
    }

    // Create user message
    const userMessage = Message.create({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: dto.message,
    });
    conversation.addMessage(userMessage);

    // Get AI response
    const aiResponse = await this.financialAdvisor.generateResponse(
      dto.message,
      Array.from(conversation.getMessages()),
      {
        userId: dto.userId,
        monthlyIncome: dto.context?.monthlyIncome,
        monthlyExpenses: dto.context?.monthlyExpenses,
        totalDebt: dto.context?.totalDebt,
        totalSavings: dto.context?.totalSavings,
      }
    );

    // Create assistant message
    const assistantMessage = Message.create({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: aiResponse.response,
    });
    conversation.addMessage(assistantMessage);

    return {
      conversationId: conversation.id,
      messages: conversation.getMessages().map(m => m.toJSON()),
      suggestedQuestions: aiResponse.suggestedQuestions,
    };
  }
}

