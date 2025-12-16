// /api/cards route - GET all cards, POST create card
import { NextRequest, NextResponse } from 'next/server';
import { getCardRepository, getCreateCardUseCase } from '../../../infrastructure/di/cardsModule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-demo';
    const type = searchParams.get('type') as 'CREDIT' | 'DEBIT' | undefined;
    const status = searchParams.get('status') as 'ACTIVE' | 'BLOCKED' | undefined;

    const repository = getCardRepository();
    const cards = await repository.findByUserId(userId, { type, status });

    return NextResponse.json({
      success: true,
      data: cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = getCreateCardUseCase();

    const result = await useCase.execute({
      userId: body.userId || 'user-demo',
      type: body.type,
      network: body.network,
      lastFourDigits: body.lastFourDigits,
      alias: body.alias,
      creditLimit: body.creditLimit,
      currentBalance: body.currentBalance || 0,
      currency: body.currency || 'MXN',
      paymentDueDate: body.paymentDueDate,
      cutOffDate: body.cutOffDate,
      minimumPayment: body.minimumPayment,
      annualInterestRate: body.annualInterestRate,
      expirationYear: body.expirationYear,
      expirationMonth: body.expirationMonth,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.card,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

