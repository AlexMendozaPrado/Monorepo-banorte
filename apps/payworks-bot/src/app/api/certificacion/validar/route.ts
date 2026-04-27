import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { OperationMode } from '@/core/domain/entities/CertificationSession';
import { ApiResponse, CertificationResponse } from '@/shared/types/api';
import { toCertificationResponse } from '@/shared/mappers/certificationResponseMapper';

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
    const coordinadorCertificacion = (formData.get('coordinadorCertificacion') as string | null)?.trim() || undefined;
    const lenguaje = (formData.get('lenguaje') as string | null)?.trim() || undefined;
    const versionAplicacion = (formData.get('versionAplicacion') as string | null)?.trim() || undefined;
    const urlSubdominio = (formData.get('urlSubdominio') as string | null)?.trim() || undefined;

    if (!matrizFile) {
      return NextResponse.json({ success: false, error: 'La Matriz de Pruebas es requerida' }, { status: 400 });
    }

    if (!integrationTypeStr) {
      return NextResponse.json({ success: false, error: 'El tipo de integracion es requerido' }, { status: 400 });
    }

    const integrationType = integrationTypeStr as IntegrationType;

    const csvFile = formData.get('csvBD') as File | null;
    const servletLogFile = formData.get('servletLog') as File | null;
    const prosaLogFile = formData.get('prosaLog') as File | null;
    const threeDSLogFile = formData.get('threeDSLog') as File | null;
    const cybersourceLogFile = formData.get('cybersourceLog') as File | null;
    const afiliacionesFile = formData.get('afiliaciones') as File | null;

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
      if (threeDSLogFile) {
        const content = await threeDSLogFile.text();
        container.logRetrieval.setThreeDSLog(content);
      }
      if (cybersourceLogFile) {
        const content = await cybersourceLogFile.text();
        container.logRetrieval.setCybersourceLog(content);
      }
    }

    // Affiliations file is independent of operation mode — always loaded if provided.
    if (afiliacionesFile) {
      const buf = Buffer.from(await afiliacionesFile.arrayBuffer());
      container.afiliacionRepository.loadFromFile(buf, afiliacionesFile.name);
    }

    const matrixBuffer = Buffer.from(await matrizFile.arrayBuffer());

    const session = await container.runCertificationUseCase.execute({
      matrixBuffer,
      integrationType,
      operationMode,
      merchantName: merchantName || undefined,
      coordinadorCertificacion,
      lenguaje,
      versionAplicacion,
      urlSubdominio,
    });

    const response: CertificationResponse = toCertificationResponse(session);

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
