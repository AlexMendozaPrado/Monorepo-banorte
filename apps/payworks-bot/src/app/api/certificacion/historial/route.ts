import { NextResponse } from 'next/server';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { ApiResponse } from '@/shared/types/api';

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const container = DIContainer.getInstance({ operationMode: 'semi' });
    const sessions = await container.getCertificationHistoryUseCase.execute();

    const data = sessions.map((s) => ({
      id: s.id,
      merchantName: s.merchantName,
      integrationType: s.integrationType,
      operationMode: s.operationMode,
      verdict: 'getVerdict' in s ? (s as any).getVerdict() : 'PENDIENTE',
      totalTransactions: s.results.length,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
