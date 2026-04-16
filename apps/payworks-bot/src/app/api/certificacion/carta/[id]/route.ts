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

    // Derivar esquema y manuales de integración según producto + capas activas
    const hasThreeDS = session.results.some(r =>
      r.fieldResults?.some(f => f.layer === 'THREEDS'),
    );
    const hasCybersource = session.results.some(r =>
      r.fieldResults?.some(f => f.layer === 'CYBERSOURCE'),
    );
    const esquemaSuffix = [
      hasThreeDS ? 'CON 3D SECURE' : null,
      hasCybersource ? 'CON CYBERSOURCE' : null,
    ].filter(Boolean).join(' ');
    const esquemaCompleto = `PAYWORKS 2 - ${integrationVO.getDisplayName().toUpperCase()}${esquemaSuffix ? ' ' + esquemaSuffix : ''}`;

    const manualesUsados: string[] = [
      `Manual DeIntegración_${integrationVO.getConfigFileName()}_V${integrationVO.getManualVersion()}`,
    ];
    if (hasThreeDS) manualesUsados.push('Manual DeIntegración_3DSecure_Banorte_V1.4');
    if (hasCybersource) manualesUsados.push('Manual DeIntegración_Cybersource_Direct_V1.10');

    // Detectar marcas reales usadas en las transacciones
    const marcasSet = new Set<string>();
    session.results.forEach(r => marcasSet.add(r.cardBrand));
    const tarjetasProcesadas = Array.from(marcasSet)
      .map(m => m === 'MC' ? 'MASTERCARD' : m)
      .join(', ') || 'VISA, MASTERCARD';

    // Detectar tipos de transacción certificados (únicos)
    const tiposSet = new Set<string>();
    session.results.forEach(r => tiposSet.add(new TransactionTypeValueObject(r.transactionType).getDisplayName().toUpperCase()));
    const transaccionesCertificadas = Array.from(tiposSet).join(', ');

    const data: CertificationLetterData = {
      codigoCertificado,
      fechaEmision: formatDate(session.createdAt),
      versionManual: integrationVO.getManualVersion(),
      tituloCertificacion: `CERTIFICACIÓN ${integrationVO.getDisplayName().toUpperCase()}${esquemaSuffix ? ' ' + esquemaSuffix : ''}`,
      coordinadorCertificacion: session.coordinadorCertificacion,
      nombreComercio: afiliacion?.getDisplayLabel() ?? session.merchantName,
      rfc: afiliacion?.rfc,
      numeroCliente: afiliacion?.numeroCliente,
      idAfiliacion: idAfiliacion || '—',
      esquema: esquemaCompleto,
      modoTransmision: integrationVO.isTarjetaPresente() ? 'TCP / IP / TLS' : 'TCP / IP / TLS',
      mensajeria: 'HTTP',
      lenguaje: session.lenguaje || 'NO PROPORCIONADO',
      tarjetasProcesadas,
      giro: afiliacion?.giro ?? afiliacion?.mccDescripcion,
      modoLectura: integrationVO.isTarjetaPresente() ? 'CHIP/BANDA/CONTACTLESS' : 'MANUAL',
      versionAplicacion: session.versionAplicacion || 'NO PROPORCIONADA',
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
      urlSubdominio: session.urlSubdominio,
      usuarioCertificacion: afiliacion?.usuario,
      manualesUtilizados: manualesUsados,
      totalTransacciones: session.results.length,
      aprobadas: approved,
      rechazadas: rejected,
      veredictoGlobal: globalVerdict,
      filasMatriz: session.results.map(r => ({
        referencia: r.transactionRef,
        tipoTransaccion: new TransactionTypeValueObject(r.transactionType).getDisplayName(),
        marca: r.cardBrand === 'MC' ? 'MASTERCARD' : r.cardBrand,
        veredicto: r.verdict,
      })),
      firmaNombre: 'Dulce María Rivera Luna',
      firmaRol: 'Soporte Técnico Payworks',
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
