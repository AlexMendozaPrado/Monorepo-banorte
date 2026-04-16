import jsPDF from 'jspdf';
import { CertificationLetterData } from '@/core/domain/value-objects/CertificationLetterData';

const EM_DASH = '—';
const BANORTE_RED: [number, number, number] = [235, 0, 41];
const BANORTE_DARK: [number, number, number] = [50, 62, 72];
const BANORTE_BROWN: [number, number, number] = [62, 49, 45];
const BANORTE_GRAY: [number, number, number] = [91, 102, 112];
const TEXT_BLACK: [number, number, number] = [30, 30, 30];

function safe(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return EM_DASH;
  const s = String(value).trim();
  return s.length === 0 ? EM_DASH : s;
}

function formatSpanishDate(iso: string): string {
  // Convierte "DD/MM/YYYY" o ISO a "1 de abril de 2026"
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  let d: Date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) {
    const [dd, mm, yyyy] = iso.split('/');
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else {
    d = new Date(iso);
  }
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Renders the official Banorte certification letter, replicating the
 * layout of `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf`:
 * - Page 1: Cover with brown bg + red BANORTE logo + title + date/version
 * - Page 2: Main letter (coordinator, intro, afiliation table, info
 *           general, matriz de pruebas, URL subdominio)
 * - Page 3: Notes + signature + certificate number
 */
export function generateCertificationLetterPDF(data: CertificationLetterData): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // =========================================================================
  // PÁGINA 1 — PORTADA
  // =========================================================================
  doc.setFillColor(...BANORTE_BROWN);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Logo BANORTE (placeholder text-based since no SVG embedded)
  doc.setFillColor(...BANORTE_RED);
  doc.circle(pageWidth / 2 - 32, 35, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('BANORTE', pageWidth / 2 - 22, 40);

  // Decoración: puntos rojos en diagonal (suave)
  doc.setFillColor(...BANORTE_RED);
  for (let i = 0; i < 20; i++) {
    const x = 5 + i * 4;
    const y = pageHeight / 2 + 20 + i * 4;
    if (y < pageHeight - 10) doc.circle(x, y, 1.5, 'F');
  }

  // Título centrado
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const tituloLines = doc.splitTextToSize(data.tituloCertificacion, pageWidth - 60);
  let titleY = pageHeight / 2 - (tituloLines.length * 8) / 2;
  tituloLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, titleY, { align: 'center' });
    titleY += 10;
  });

  // Fecha y versión abajo derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha: ${formatSpanishDate(data.fechaEmision)}`, pageWidth - margin, pageHeight - 25, { align: 'right' });
  doc.text(`Versión: 1.0`, pageWidth - margin, pageHeight - 19, { align: 'right' });

  // =========================================================================
  // PÁGINA 2 — CARTA PRINCIPAL
  // =========================================================================
  doc.addPage();
  drawPageHeader(doc, pageWidth, data.tituloCertificacion);
  drawPageFooter(doc, pageWidth, pageHeight, 2);
  drawSideWatermark(doc, pageHeight);

  let y = 30;

  // Coordinador
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_BLACK);
  doc.text(safe(data.coordinadorCertificacion), margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_BLACK);
  doc.text('Coordinador de Certificación', margin + 4, y);
  y += 10;

  // Párrafo de introducción
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const nombreComercio = safe(data.nombreComercio);
  const rfc = safe(data.rfc);
  const numeroCliente = safe(data.numeroCliente);
  const introText =
    `Por medio de la presente informamos que el proceso de certificación para ` +
    `Payworks Comercio Electrónico se efectuó con éxito. La certificación se realizó ` +
    `para el cliente ${nombreComercio}, con RFC ${rfc} y número de cliente ${numeroCliente}. ` +
    `La afiliación utilizada durante la certificación es la siguiente:`;
  const introLines = doc.splitTextToSize(introText, pageWidth - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 4;

  // Tabla 1: Número y Nombre de afiliación
  drawTable(doc, margin, y, pageWidth - margin * 2, [
    { width: 0.5, header: 'Número de afiliación', align: 'center' },
    { width: 0.5, header: 'Nombre de la afiliación', align: 'center' },
  ], [
    [safe(data.idAfiliacion), nombreComercio],
  ]);
  y += 16;

  // Segundo párrafo
  const intro2 =
    'El proceso de certificación consistió en la validación satisfactoria de las ' +
    'transacciones enviadas por parte del Comercio con el protocolo 3D – Secure de ' +
    'acuerdo con especificaciones de Banorte, posterior a ello, se extrajeron del ' +
    'log las tramas para su análisis, y una vez validadas de forma satisfactoria, ' +
    'se concluyó con el proceso.';
  const intro2Lines = doc.splitTextToSize(intro2, pageWidth - margin * 2);
  doc.text(intro2Lines, margin, y);
  y += intro2Lines.length * 5 + 6;

  // Información general
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Información general', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const infoBullets: [string, string][] = [
    ['Esquema de integración Banorte:', safe(data.esquema)],
    ['Modo de transmisión:', safe(data.modoTransmision)],
    ['Mensajería:', safe(data.mensajeria)],
    ['Lenguaje:', safe(data.lenguaje)],
    ['Tipo de tarjetas a procesar:', safe(data.tarjetasProcesadas)],
    ['Giro del negocio:', safe(data.giro)],
    ['Transacciones certificadas:', data.filasMatriz.length > 0 ? [...new Set(data.filasMatriz.map(f => f.tipoTransaccion.toUpperCase()))].join(', ') : EM_DASH],
    ['Modo de lectura:', safe(data.modoLectura)],
    ['Versión de la aplicación:', safe(data.versionAplicacion)],
  ];
  infoBullets.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text('•', margin + 2, y);
    doc.text(`${label} `, margin + 6, y);
    const labelWidth = doc.getTextWidth(`${label} `);
    doc.setFont('helvetica', 'bold');
    const valueX = margin + 6 + labelWidth;
    const valueLines = doc.splitTextToSize(value, pageWidth - margin - valueX);
    doc.text(valueLines, valueX, y);
    y += valueLines.length * 5;
  });
  y += 4;

  // Matriz de pruebas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Matriz de pruebas', margin, y);
  y += 5;

  const matrizRows = data.filasMatriz.map(f => [
    f.tipoTransaccion.toUpperCase(),
    `Transacción realizada con Tarjeta ${f.marca}`,
    f.veredicto === 'APROBADO' ? 'OK' : 'FAIL',
  ]);
  drawTable(doc, margin, y, pageWidth - margin * 2, [
    { width: 0.3, header: 'Transacción', align: 'center' },
    { width: 0.5, header: 'Descripción', align: 'center' },
    { width: 0.2, header: 'Resultado', align: 'center' },
  ], matrizRows.length > 0 ? matrizRows : [['—', '—', '—']]);
  y += 8 + matrizRows.length * 7 + 4;

  // URL subdominio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_BLACK);
  const verifText = 'Esta verificación se realiza exclusivamente para los motores de pago de los subdominios:';
  const verifLines = doc.splitTextToSize(verifText, pageWidth - margin * 2);
  doc.text(verifLines, margin, y);
  y += verifLines.length * 5 + 6;

  if (data.urlSubdominio) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 238);
    doc.text(data.urlSubdominio, pageWidth / 2, y, { align: 'center' });
  }

  // =========================================================================
  // PÁGINA 3 — NOTAS + FIRMA
  // =========================================================================
  doc.addPage();
  drawPageHeader(doc, pageWidth, data.tituloCertificacion);
  drawPageFooter(doc, pageWidth, pageHeight, 3);
  drawSideWatermark(doc, pageHeight);

  y = 30;

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_BLACK);
  doc.text('Notas:', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const transaccionesLabel = data.filasMatriz.length > 0
    ? [...new Set(data.filasMatriz.map(f => f.tipoTransaccion.toUpperCase()))].join(', ')
    : 'VENTA';

  const notes: string[] = [
    `Las transacciones que se validaron para el comercio fueron ${transaccionesLabel}.`,
    `De acuerdo con la confirmación de NO guardar los datos de las tarjetas por parte del comercio en el documento de la solicitud de certificación, se realiza la validación sin las variables CIT y MIT respecto a la operativa del comercio.`,
    `Si el Cliente desea realizar adecuaciones a su aplicación o implementar nueva funcionalidad es necesario contactar nuevamente al personal de Banorte para gestionar una nueva certificación.`,
    `Si el Cliente realiza adecuaciones a su aplicación sin notificación al personal Banorte la presente carta queda invalidada.`,
    `El comercio generó un usuario nuevo con permisos de ejecución de transacciones como se solicitó en base a recomendación de seguridad de la información, el usuario utilizado para el proceso de certificación fue: [${safe(data.usuarioCertificacion)}].`,
  ];
  notes.forEach(note => {
    doc.text('•', margin + 2, y);
    const lines = doc.splitTextToSize(note, pageWidth - margin * 2 - 6);
    doc.text(lines, margin + 6, y);
    y += lines.length * 5 + 2;
  });

  // Manuales
  doc.text('•', margin + 2, y);
  doc.text('Manual utilizado para la integración:', margin + 6, y);
  y += 5;
  if (data.manualesUtilizados && data.manualesUtilizados.length > 0) {
    doc.setFont('helvetica', 'bold');
    data.manualesUtilizados.forEach(m => {
      doc.text('○', margin + 8, y);
      doc.text(m + '.', margin + 12, y);
      y += 5;
    });
    doc.setFont('helvetica', 'normal');
  }
  y += 2;

  // Nota MODE=PRD
  const lastNote = `Antes de salir a producción el comercio deberá asegurarse del cambio del valor de la variable MODE sea igual a "PRD", ya que Banorte no se hace responsable de las transacciones operadas en modo de pruebas (AUT).`;
  doc.text('•', margin + 2, y);
  const lastLines = doc.splitTextToSize(lastNote, pageWidth - margin * 2 - 6);
  doc.text(lastLines, margin + 6, y);
  y += lastLines.length * 5 + 12;

  // Firma
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_BLACK);
  const firmaY = Math.max(y + 10, pageHeight - 80);
  doc.text(`CERTIFICADO ${data.codigoCertificado}`, pageWidth / 2, firmaY, { align: 'center' });
  doc.text(safe(data.firmaNombre), pageWidth / 2, firmaY + 6, { align: 'center' });
  doc.text(safe(data.firmaRol), pageWidth / 2, firmaY + 12, { align: 'center' });

  return doc.output('blob');
}

// =========================================================================
// Helpers de layout (header/footer/watermark/table)
// =========================================================================

function drawPageHeader(doc: jsPDF, pageWidth: number, title: string) {
  doc.setFillColor(...BANORTE_RED);
  doc.rect(0, 0, pageWidth, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BANORTE_DARK);
  // Formato: "Certificación Comercio Electrónico con 3D Secure" — versión amigable del título
  const subtitle = title.replace(/^CERTIFICACIÓN\s+/i, 'Certificación ').toLowerCase();
  const prettyTitle = subtitle.charAt(0).toUpperCase() + subtitle.slice(1);
  doc.text(prettyTitle, pageWidth - 20, 10, { align: 'right' });
}

function drawPageFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number) {
  doc.setFillColor(...BANORTE_BROWN);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(String(pageNum), 15, pageHeight - 5);
  // Logo BANORTE mini en footer
  doc.setFillColor(...BANORTE_RED);
  doc.circle(pageWidth - 40, pageHeight - 7.5, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('BANORTE', pageWidth - 35, pageHeight - 5);
}

function drawSideWatermark(doc: jsPDF, pageHeight: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BANORTE_GRAY);
  const text = 'NOTA: ESTE DOCUMENTO ES DE CARÁCTER INFORMATIVO Y NO FORMA PARTE DE NINGÚN CONTRATO, SIN RESPONSABILIDAD PARA BANORTE.';
  // Rotado 90 grados en el margen derecho
  doc.text(text, pageWidth - 5, pageHeight / 2, { angle: 90, align: 'center' });
}

interface TableColumn {
  width: number; // fracción 0..1
  header: string;
  align?: 'left' | 'center' | 'right';
}

function drawTable(
  doc: jsPDF,
  x: number,
  y: number,
  totalWidth: number,
  columns: TableColumn[],
  rows: string[][],
) {
  const rowHeight = 7;
  const headerHeight = 8;
  const widths = columns.map(c => totalWidth * c.width);

  // Header
  doc.setFillColor(...BANORTE_RED);
  doc.rect(x, y, totalWidth, headerHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  let cx = x;
  columns.forEach((col, i) => {
    const tx = col.align === 'center' ? cx + widths[i] / 2 : cx + 2;
    doc.text(col.header, tx, y + 5.5, { align: col.align || 'left' });
    cx += widths[i];
  });

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_BLACK);
  let ry = y + headerHeight;
  rows.forEach(row => {
    doc.setDrawColor(...BANORTE_RED);
    doc.setLineWidth(0.3);
    doc.rect(x, ry, totalWidth, rowHeight, 'S');
    let rx = x;
    row.forEach((cell, i) => {
      const align = columns[i].align || 'left';
      const tx = align === 'center' ? rx + widths[i] / 2 : rx + 2;
      doc.text(String(cell), tx, ry + 5, { align });
      rx += widths[i];
    });
    ry += rowHeight;
  });
}
