import jsPDF from 'jspdf';
import { CertificationLetterData } from '@/core/domain/value-objects/CertificationLetterData';

const EM_DASH = '—';

function safe(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return EM_DASH;
  const s = String(value).trim();
  return s.length === 0 ? EM_DASH : s;
}

/**
 * Renders the official Banorte certification letter as a PDF Blob.
 *
 * The layout mirrors the reference file
 * `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf` (5 sections + cover). The
 * generator never throws on missing data — absent fields render as `—`.
 */
export function generateCertificationLetterPDF(data: CertificationLetterData): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
      drawHeaderBanner();
    }
  };

  function drawHeaderBanner() {
    doc.setFillColor(235, 0, 41); // banorte-red #EB0029
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BANORTE', margin, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Certificación Payworks', pageWidth - margin, 10, { align: 'right' });
    doc.setTextColor(50, 62, 72);
    y = 25;
  }

  function sectionTitle(title: string) {
    ensureSpace(12);
    doc.setFillColor(235, 0, 41);
    doc.rect(margin, y, 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 62, 72);
    doc.text(title, margin + 4, y + 5);
    y += 10;
  }

  function kv(label: string, value: string) {
    ensureSpace(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(91, 102, 112); // banorte-gray
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 62, 72);
    const wrapped = doc.splitTextToSize(value, contentWidth - 55);
    doc.text(wrapped, margin + 55, y);
    y += Math.max(5, wrapped.length * 4.5);
  }

  // ============ PORTADA ============
  doc.setFillColor(235, 0, 41);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BANORTE', margin, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Payworks — Certificación Oficial', margin, 40);

  y = 75;
  doc.setTextColor(50, 62, 72);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(data.tituloCertificacion, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 8 + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(91, 102, 112);
  doc.text(`Código de certificado: `, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(235, 0, 41);
  doc.setFontSize(14);
  doc.text(data.codigoCertificado, pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 62, 72);
  doc.text(`Fecha de emisión: ${safe(data.fechaEmision)}`, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text(`Versión de manual: ${safe(data.versionManual)}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Veredict global box
  const boxX = pageWidth / 2 - 50;
  doc.setDrawColor(235, 0, 41);
  doc.setLineWidth(0.5);
  doc.rect(boxX, y, 100, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(91, 102, 112);
  doc.text('VEREDICTO GLOBAL', pageWidth / 2, y + 7, { align: 'center' });
  const verdictColor = data.veredictoGlobal === 'APROBADO'
    ? [108, 192, 74]
    : data.veredictoGlobal === 'RECHAZADO'
      ? [255, 103, 27]
      : [255, 164, 0];
  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.setFontSize(14);
  doc.text(data.veredictoGlobal, pageWidth / 2, y + 15, { align: 'center' });

  // Footer on cover
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(91, 102, 112);
  doc.text(
    'Este documento constituye la certificación oficial del comercio contra los manuales de Banorte Payworks.',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' },
  );

  doc.addPage();
  drawHeaderBanner();

  // ============ SECCIÓN 1 — DATOS DEL PROCESO ============
  sectionTitle('1. Datos del proceso de certificación');
  kv('Coordinador:', safe(data.coordinadorCertificacion));
  kv('Nombre comercio:', safe(data.nombreComercio));
  kv('RFC:', safe(data.rfc));
  kv('Número cliente:', safe(data.numeroCliente));
  kv('ID Afiliación:', safe(data.idAfiliacion));
  kv('Esquema:', safe(data.esquema));
  kv('Modo de transmisión:', safe(data.modoTransmision));
  kv('Mensajería:', safe(data.mensajeria));
  kv('Lenguaje:', safe(data.lenguaje));
  kv('Tarjetas procesadas:', safe(data.tarjetasProcesadas));
  kv('Giro:', safe(data.giro));
  kv('Modo de lectura:', safe(data.modoLectura));
  kv('Versión de aplicación:', safe(data.versionAplicacion));
  y += 5;

  sectionTitle('Responsable técnico del comercio');
  kv('Nombre:', safe(data.responsableNombre));
  kv('Email:', safe(data.responsableEmail));
  kv('Teléfono:', safe(data.responsableTelefono));
  kv('Dirección:', safe(data.responsableDireccion));
  y += 5;

  // ============ SECCIÓN 2 — MATRIZ DE PRUEBAS ============
  sectionTitle('2. Matriz de pruebas validadas');
  ensureSpace(10);
  doc.setFillColor(244, 247, 248);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 62, 72);
  doc.text('Referencia', margin + 2, y + 5);
  doc.text('Transacción', margin + 55, y + 5);
  doc.text('Marca', margin + 100, y + 5);
  doc.text('Veredicto', margin + 130, y + 5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (data.filasMatriz.length === 0) {
    doc.setTextColor(91, 102, 112);
    doc.text('Sin transacciones.', margin + 2, y + 5);
    y += 8;
  } else {
    for (const row of data.filasMatriz) {
      ensureSpace(7);
      doc.setTextColor(50, 62, 72);
      doc.text(safe(row.referencia), margin + 2, y + 5);
      doc.text(safe(row.tipoTransaccion), margin + 55, y + 5);
      doc.text(safe(row.marca), margin + 100, y + 5);
      const verdictIsApproved = row.veredicto === 'APROBADO';
      const rgb = verdictIsApproved ? [108, 192, 74] : [255, 103, 27];
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(safe(row.veredicto), margin + 130, y + 5);
      doc.setFont('helvetica', 'normal');
      y += 6;
    }
  }
  y += 5;

  // Totales
  ensureSpace(10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 62, 72);
  doc.text(
    `Total: ${data.totalTransacciones}   |   Aprobadas: ${data.aprobadas}   |   Rechazadas: ${data.rechazadas}`,
    margin,
    y,
  );
  y += 10;

  // ============ SECCIÓN 3 — NOTAS TÉCNICAS ============
  sectionTitle('3. Notas técnicas');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 62, 72);
  const notas = [
    'Las variables consideradas en esta certificación provienen del manual oficial del producto.',
    'Los campos marcados como Requeridos (R), Opcionales (O) o No Aplica (N/A) se validaron contra los logs reales del servidor Servlet/PROSA y las capas transversales 3D Secure y Cybersource cuando aplican.',
    'Para transacciones con tarjeta MasterCard se validan, cuando corresponde, los indicadores CIT/MIT del mandato AN5822 (PAYMENT_IND, AMOUNT_TYPE, PAYMENT_INFO).',
    'El modo PRD indica que las transacciones fueron ejecutadas contra el ambiente productivo.',
  ];
  for (const nota of notas) {
    ensureSpace(12);
    const lines = doc.splitTextToSize(`• ${nota}`, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 2;
  }
  y += 5;

  // ============ SECCIÓN 4 — LOGS TÉCNICOS (referencia) ============
  sectionTitle('4. Logs técnicos');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(91, 102, 112);
  const logNote = doc.splitTextToSize(
    'Los logs completos (Servlet, PROSA, 3DS, Cybersource) de cada transacción validada se conservan en el dictamen de certificación adjunto y forman parte integral del expediente de esta carta.',
    contentWidth,
  );
  doc.text(logNote, margin, y);
  y += logNote.length * 4.5 + 8;

  // ============ SECCIÓN 5 — RESUMEN DE AFILIACIÓN ============
  sectionTitle('5. Resumen de afiliación');
  kv('ID Afiliación:', safe(data.idAfiliacion));
  kv('Nombre comercial:', safe(data.nombreComercio));
  kv('RFC:', safe(data.rfc));
  kv('Número cliente:', safe(data.numeroCliente));
  kv('Giro:', safe(data.giro));
  kv('Esquema:', safe(data.esquema));
  y += 10;

  // ============ FIRMA ============
  ensureSpace(40);
  doc.setDrawColor(91, 102, 112);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 70, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 62, 72);
  doc.text(safe(data.firmaNombre), margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(91, 102, 112);
  doc.text(safe(data.firmaRol), margin, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(235, 0, 41);
  doc.text(`Certificado: ${data.codigoCertificado}`, margin, y);

  return doc.output('blob');
}
