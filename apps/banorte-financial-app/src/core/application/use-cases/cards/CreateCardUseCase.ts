// CreateCardUseCase.ts - Create a new card
import { Card, CardEntity } from '../../../domain/entities/cards/Card';
import { ICardRepository, CreateCardDTO } from '../../../domain/ports/repositories/ICardRepository';

export interface CreateCardInput {
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  network: 'VISA' | 'MASTERCARD' | 'AMEX';
  lastFourDigits: string;
  alias: string;
  creditLimit?: number;
  currentBalance: number;
  currency?: string;
  paymentDueDate?: string;
  cutOffDate?: string;
  minimumPayment?: number;
  annualInterestRate?: number;
  expirationYear: number;
  expirationMonth: number;
}

export interface CreateCardOutput {
  success: boolean;
  card?: Card;
  error?: string;
}

export class CreateCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(input: CreateCardInput): Promise<CreateCardOutput> {
    try {
      // Validate input
      if (!input.userId) {
        return { success: false, error: 'User ID is required' };
      }

      if (!input.lastFourDigits || input.lastFourDigits.length !== 4) {
        return { success: false, error: 'Last four digits must be exactly 4 characters' };
      }

      if (!input.alias || input.alias.trim().length === 0) {
        return { success: false, error: 'Card alias is required' };
      }

      // Validate credit card specific fields
      if (input.type === 'CREDIT') {
        if (!input.creditLimit || input.creditLimit <= 0) {
          return { success: false, error: 'Credit limit is required for credit cards' };
        }
      }

      // Create expiration date
      const expiresAt = new Date(input.expirationYear, input.expirationMonth - 1, 1);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      expiresAt.setDate(0); // Last day of the month

      const currency = input.currency || 'MXN';

      const createDTO: CreateCardDTO = {
        userId: input.userId,
        type: input.type,
        network: input.network,
        lastFourDigits: input.lastFourDigits,
        alias: input.alias.trim(),
        creditLimit: input.creditLimit
          ? { amount: input.creditLimit, currency }
          : undefined,
        currentBalance: { amount: input.currentBalance || 0, currency },
        paymentDueDate: input.paymentDueDate,
        cutOffDate: input.cutOffDate,
        minimumPayment: input.minimumPayment
          ? { amount: input.minimumPayment, currency }
          : undefined,
        annualInterestRate: input.annualInterestRate,
        expiresAt,
      };

      const card = await this.cardRepository.create(createDTO);

      return {
        success: true,
        card,
      };
    } catch (error) {
      console.error('Error creating card:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating card',
      };
    }
  }
}

