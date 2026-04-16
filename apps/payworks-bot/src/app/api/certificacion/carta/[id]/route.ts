import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import {
  CertificationLetterData,
  buildCertificateCode,
} from '@/core/domain/value-objects/CertificationLetterData';
import { generateCertificationLetterPDF } from '@/presentation/utils/generateCertificationLetterPDF';
import { IntegrationTypeValueObject } from '@/core/domain/value-objects/IntegrationType';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';
import { ValidationVerdict } from '@/core/domain/value-objects/ValidationVerdict';

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  try {
    const container = DIContainer.getInstance({ operationMode: 'semi' });
    const session = await container.certificationRepository.findById(params.id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: `Certificación ${params.id} no encontrada` },
        { status: 404 },
      );
    }

    const integrationVO = new IntegrationTypeValueObject(session.integrationType);

    // Try to find the affiliation record from the first transaction's merchant id.
    // Falls back to merchantName captured during the run if the repo is empty.
    const firstRef = session.results[0]?.transactionRef;
    const txnRepo = container.transactionRepository;
    const firstTxn = firstRef ? await txnRepo.findByReferencia(firstRef) : null;
    const idAfiliacion = firstTxn?.numero ?? '';
    const afiliacion = idAfiliacion
      ? container.afiliacionRepository.findByIdAfiliacion(idAfiliacion)
      : undefined;

    const codigoCertificado = buildCertificateCode(
      session.integrationType,
      session.id,
      idAfiliacion,
    );

    const approved = session.results.filter(
      r => r.verdict === ValidationVerdict.APROBADO,
    ).length;
    const rejected = session.results.filter(
      r => r.verdict === ValidationVerdict.RECHAZADO,
    ).length;

    const globalVerdict: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE' =
      session.results.length === 0
        ? 'PENDIENTE'
        : rejected > 0
          ? 'RECHAZADO'
          : 'APROBADO';

    const data: CertificationLetterData = {
      codigoCertificado,
      fechaEmision: formatDate(session.createdAt),
      versionManual: integrationVO.getManualVersion(),
      tituloCertificacion: `CERTIFICACIÓN ${integrationVO.getDisplayName().toUpperCase()}`,
      coordinadorCertificacion: session.coordinadorCertificacion,
      nombreComercio: afiliacion?.getDisplayLabel() ?? session.merchantName,
      rfc: afiliacion?.rfc,
      numeroCliente: afiliacion?.numeroCliente,
      idAfiliacion: idAfiliacion || '—',
      esquema: afiliacion?.esquema ?? integrationVO.getDisplayName(),
      modoTransmision: 'HTTPS',
      mensajeria: integrationVO.isTarjetaPresente() ? 'Servlet + EMV' : 'Servlet HTTPS',
      lenguaje: 'es-MX',
      tarjetasProcesadas: 'VISA, MasterCard' + (afiliacion?.extras?.AMEX ? ', AMEX' : ''),
      giro: afiliacion?.giro ?? afiliacion?.mccDescripcion,
      modoLectura: integrationVO.isTarjetaPresente() ? 'CHIP/BANDA/CONTACTLESS' : 'Manual (No presente)',
      versionAplicacion: integrationVO.getManualVersion(),
      responsableNombre: afiliacion?.usuario,
      responsableEmail: afiliacion?.email,
      responsableTelefono: afiliacion?.telefono,
      responsableDireccion: [
        afiliacion?.direccion,
        afiliacion?.ciudad,
        afiliacion?.estado,
        afiliacion?.codigoPostal,
      ]
        .filter(Boolean)
        .join(', ') || undefined,
      totalTransacciones: session.results.length,
      aprobadas: approved,
      rechazadas: rejected,
      veredictoGlobal: globalVerdict,
      filasMatriz: session.results.map(r => ({
        referencia: r.transactionRef,
        tipoTransaccion: new TransactionTypeValueObject(r.transactionType).getDisplayName(),
        marca: r.cardBrand,
        veredicto: r.verdict,
      })),
      firmaNombre: 'Soporte Técnico Payworks',
      firmaRol: 'Certificación de Comercios — Banorte',
    };

    const blob = generateCertificationLetterPDF(data);
    const arrayBuffer = await blob.arrayBuffer();

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${codigoCertificado}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generando carta oficial:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
