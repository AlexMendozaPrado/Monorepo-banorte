import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { OperationMode } from '@/core/domain/entities/CertificationSession';
import { ApiResponse, CertificationResponse } from '@/shared/types/api';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CertificationResponse>>> {
  try {
    const container = DIContainer.getInstance({ operationMode: 'semi' });
    const formData = await request.formData();

    const matrizFile = formData.get('matriz') as File;
    const integrationTypeStr = formData.get('integrationType') as string;
    const operationMode = (formData.get('operationMode') as OperationMode) || 'semi';
    const merchantName = formData.get('merchantName') as string;

    if (!matrizFile) {
      return NextResponse.json({ success: false, error: 'La Matriz de Pruebas es requerida' }, { status: 400 });
    }

    if (!integrationTypeStr) {
      return NextResponse.json({ success: false, error: 'El tipo de integracion es requerido' }, { status: 400 });
    }

    const integrationType = integrationTypeStr as IntegrationType;

    // Para modo semi-auto, cargar CSV y LOGs si fueron enviados
    const csvFile = formData.get('csvBD') as File;
    const servletLogFile = formData.get('servletLog') as File;
    const prosaLogFile = formData.get('prosaLog') as File;

    if (operationMode === 'semi') {
      if (csvFile) {
        const csvContent = await csvFile.text();
        container.transactionRepository.loadFromCSV(csvContent);
      }
      if (servletLogFile) {
        const content = await servletLogFile.text();
        container.logRetrieval.setServletLog(content);
      }
      if (prosaLogFile) {
        const content = await prosaLogFile.text();
        container.logRetrieval.setProsaLog(content);
      }
    }

    const matrixBuffer = Buffer.from(await matrizFile.arrayBuffer());

    const session = await container.runCertificationUseCase.execute({
      matrixBuffer,
      integrationType,
      operationMode,
      merchantName: merchantName || undefined,
    });

    const response: CertificationResponse = {
      id: session.id,
      merchantName: session.merchantName,
      integrationType: session.integrationType,
      operationMode: session.operationMode,
      verdict: session.getVerdict(),
      totalTransactions: session.getTotalTransactions(),
      approvedCount: session.getApprovedCount(),
      rejectedCount: session.getRejectedCount(),
      approvalRate: session.getApprovalRate(),
      results: session.results.map((r) => ({
        transactionRef: r.transactionRef,
        transactionType: r.transactionType,
        cardBrand: r.cardBrand,
        verdict: r.verdict,
        passedCount: 'getPassedCount' in r ? (r as any).getPassedCount() : 0,
        failedCount: 'getFailedCount' in r ? (r as any).getFailedCount() : 0,
        totalValidated: 'getTotalValidated' in r ? (r as any).getTotalValidated() : 0,
        fieldResults: r.fieldResults.map((f) => ({
          field: f.field,
          rule: f.rule,
          found: f.found,
          value: f.value,
          verdict: f.verdict,
          source: f.source,
        })),
      })),
      createdAt: session.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Certificacion completada',
    });
  } catch (error) {
    console.error('Error en certificacion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
