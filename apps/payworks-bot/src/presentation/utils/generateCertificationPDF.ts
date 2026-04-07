import jsPDF from 'jspdf';
import { CertificationResponse } from '@/shared/types/api';

const INTEGRATION_NAMES: Record<string, string> = {
  ECOMMERCE_TRADICIONAL: 'E-Commerce Tradicional',
  ECOMMERCE_TOKENIZACION: 'E-Commerce Tokenizacion',
  VENTANA_COMERCIOS: 'Ventana de Comercios',
  CYBERSOURCE_DIRECTO: 'Cybersource Directo',
  AGREGADOR_ECOMM: 'Agregador E-Commerce',
  AGREGADOR_CARGOS_AUTO: 'Agregador Cargos Auto',
};

const TRANSACTION_NAMES: Record<string, string> = {
  AUTH: 'VENTA',
  VOID: 'CANCELACION',
  REFUND: 'DEVOLUCION',
  PREAUTH: 'PREAUTORIZACION',
  POSTAUTH: 'POSTAUTORIZACION',
  VERIFY: 'VERIFICACION',
};

export function generateCertificationPDF(data: CertificationResponse): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkNewPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // === HEADER ===
  doc.setFillColor(235, 0, 41); // #EB0029
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BANORTE', margin, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Dictamen de Certificacion Payworks', pageWidth - margin, 16, { align: 'right' });

  y = 35;

  // === TITULO ===
  doc.setTextColor(50, 62, 72); // #323E48
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DICTAMEN DE CERTIFICACION', margin, y);
  y += 10;

  // === LINEA SEPARADORA ===
  doc.setDrawColor(235, 0, 41);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === INFORMACION DEL COMERCIO ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 102, 112); // #5B6670

  const infoRows = [
    ['Comercio:', data.merchantName],
    ['Tipo de Integracion:', INTEGRATION_NAMES[data.integrationType] || data.integrationType],
    ['Fecha de Certificacion:', new Date(data.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Modo de Operacion:', data.operationMode === 'semi' ? 'Semi-automatico' : 'Totalmente Automatizado'],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 102, 112);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 62, 72);
    doc.text(value, margin + 45, y);
    y += 6;
  }

  y += 5;

  // === RESUMEN ===
  doc.setFillColor(244, 247, 248); // #F4F7F8
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');

  const isApproved = data.verdict === 'APROBADO';
  const approvalRate = data.totalTransactions > 0 ? Math.round((data.approvedCount / data.totalTransactions) * 100) : 0;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (isApproved) {
    doc.setTextColor(108, 192, 74); // #6CC04A
  } else {
    doc.setTextColor(235, 0, 41); // #EB0029
  }
  doc.text(`DICTAMEN: ${data.verdict}`, margin + 5, y + 10);

  doc.setFontSize(10);
  doc.setTextColor(50, 62, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.approvedCount}/${data.totalTransactions} aprobadas (${approvalRate}%)  |  ${data.rejectedCount} rechazada(s)`, margin + 5, y + 20);

  y += 38;

  // === DETALLE POR TRANSACCION ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(50, 62, 72);
  doc.text('DETALLE POR TRANSACCION', margin, y);
  y += 8;

  for (let i = 0; i < data.results.length; i++) {
    const txn = data.results[i];
    const txnName = `${TRANSACTION_NAMES[txn.transactionType] || txn.transactionType} ${txn.cardBrand}`;
    const txnApproved = txn.verdict === 'APROBADO';
    const requiredFields = txn.fieldResults.filter(f => f.rule === 'R');
    const requiredPassed = requiredFields.filter(f => f.verdict === 'PASS').length;
    const failedFields = txn.fieldResults.filter(f => f.verdict === 'FAIL');

    // Estimar espacio necesario
    const rowsNeeded = txn.fieldResults.length;
    checkNewPage(30 + rowsNeeded * 5);

    // Barra de color
    if (txnApproved) {
      doc.setFillColor(108, 192, 74);
    } else {
      doc.setFillColor(235, 0, 41);
    }
    doc.rect(margin, y, contentWidth, 1.5, 'F');
    y += 4;

    // Encabezado de transaccion
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 62, 72);
    doc.text(`${i + 1}. ${txnName}`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(91, 102, 112);
    doc.text(`REF: ${txn.transactionRef}`, margin + 60, y);

    // Badge
    if (txnApproved) {
      doc.setTextColor(46, 139, 21);
      doc.text(`APROBADO (${requiredPassed}/${requiredFields.length} campos R)`, pageWidth - margin, y, { align: 'right' });
    } else {
      doc.setTextColor(184, 24, 24);
      doc.text(`RECHAZADO (${failedFields.length} faltante)`, pageWidth - margin, y, { align: 'right' });
    }
    y += 5;

    // Mensaje de error si rechazada
    if (failedFields.length > 0) {
      doc.setFillColor(255, 244, 244);
      doc.roundedRect(margin, y, contentWidth, 7 * failedFields.length, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(184, 24, 24);
      for (const f of failedFields) {
        y += 5;
        doc.text(`✗ Campo ${f.field} (Requerido): No encontrado en el LOG`, margin + 3, y);
      }
      y += 4;
    }

    // Tabla de campos
    const tableStartY = y;
    const colWidths = [45, 15, 22, 55, 13];
    const headers = ['Campo', 'Regla', 'Encontrado', 'Valor', 'OK'];

    // Header de tabla
    doc.setFillColor(244, 247, 248);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(91, 102, 112);

    let xPos = margin + 2;
    for (let j = 0; j < headers.length; j++) {
      doc.text(headers[j], xPos, y + 4);
      xPos += colWidths[j];
    }
    y += 7;

    // Filas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    for (const field of txn.fieldResults) {
      checkNewPage(6);

      if (field.verdict === 'FAIL') {
        doc.setFillColor(255, 240, 240);
        doc.rect(margin, y - 1, contentWidth, 5, 'F');
      }

      xPos = margin + 2;
      doc.setTextColor(50, 62, 72);
      doc.text(field.field, xPos, y + 2.5);
      xPos += colWidths[0];
      doc.text(field.rule, xPos, y + 2.5);
      xPos += colWidths[1];
      doc.text(field.rule === 'N/A' ? '--' : field.found ? 'Si' : 'No', xPos, y + 2.5);
      xPos += colWidths[2];
      doc.text(field.rule === 'N/A' ? '--' : (field.value || '--').substring(0, 30), xPos, y + 2.5);
      xPos += colWidths[3];

      if (field.verdict === 'PASS') {
        doc.setTextColor(108, 192, 74);
        doc.text('✓', xPos, y + 2.5);
      } else {
        doc.setTextColor(235, 0, 41);
        doc.text('✗', xPos, y + 2.5);
      }

      y += 5;
    }

    y += 8;
  }

  // === PIE DE PAGINA ===
  checkNewPage(20);
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(91, 102, 112);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento generado automaticamente por Bot de Certificacion Payworks - Banorte', margin, y);
  y += 4;
  doc.text(`Fecha de generacion: ${new Date().toLocaleString('es-MX')}`, margin, y);
  y += 4;
  doc.text('Este documento es de uso interno y confidencial.', margin, y);

  // Descargar
  const fileName = `Dictamen_${data.merchantName.replace(/\s+/g, '_')}_${new Date(data.createdAt).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
