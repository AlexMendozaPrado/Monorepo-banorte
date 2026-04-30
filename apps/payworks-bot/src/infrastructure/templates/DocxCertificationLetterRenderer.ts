import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { CertificationLetterData } from '@/core/domain/value-objects/CertificationLetterData';

const TEMPLATE_FILENAME = 'carta-certificacion.template.docx';

function resolveTemplatePath(): string {
  return path.join(
    process.cwd(),
    'src',
    'infrastructure',
    'templates',
    TEMPLATE_FILENAME,
  );
}

interface TemplatePayload {
  fechaEmision: string;
  tipoProducto: string;
  esquemaAgregador: string;
  nombreComercio: string;
  nombreCertificadorComercio: string;
  nombreCliente: string;
  rfc: string;
  numeroCliente: string;
  numeroAfiliacion: string;
  nombreAfiliacion: string;
  esquemaIntegracion: string;
  modoTransmision: string;
  mensajeria: string;
  lenguaje: string;
  tarjetasProcesadas: string;
  giro: string;
  transaccionesCertificadas: string;
  modoLectura: string;
  versionAplicacion: string;
  urlSubdominio: string;
  transaccionesValidadas: string;
  usuarioCertificacion: string;
  codigoCertificado: string;
  firmaNombre: string;
  firmaRol: string;
  filasMatriz: Array<{
    tipoTransaccion: string;
    descripcion: string;
    resultado: string;
  }>;
  manualesUtilizados: string[];
  notasAdicionales: string[];
}

function buildPayload(data: CertificationLetterData): TemplatePayload {
  const tipoProducto = data.tituloCertificacion.replace(/^CERTIFICACI[ÓO]N\s+/i, '');
  const tiposUnicos =
    data.filasMatriz.length > 0
      ? [...new Set(data.filasMatriz.map(f => f.tipoTransaccion.toUpperCase()))].join(', ')
      : '';

  return {
    fechaEmision: data.fechaEmision,
    tipoProducto,
    esquemaAgregador: data.esquemaAgregador ?? '',
    nombreComercio: data.nombreComercio,
    nombreCertificadorComercio: data.coordinadorCertificacion ?? '',
    nombreCliente: data.nombreComercio,
    rfc: data.rfc ?? '',
    numeroCliente: data.numeroCliente ?? '',
    numeroAfiliacion: data.idAfiliacion,
    nombreAfiliacion: data.nombreComercio,
    esquemaIntegracion: data.esquema ?? '',
    modoTransmision: data.modoTransmision ?? '',
    mensajeria: data.mensajeria ?? '',
    lenguaje: data.lenguaje ?? '',
    tarjetasProcesadas: data.tarjetasProcesadas ?? '',
    giro: data.giro ?? '',
    transaccionesCertificadas: tiposUnicos,
    modoLectura: data.modoLectura ?? '',
    versionAplicacion: data.versionAplicacion ?? '',
    urlSubdominio: data.urlSubdominio ?? '',
    transaccionesValidadas: tiposUnicos,
    usuarioCertificacion: data.usuarioCertificacion ?? '',
    codigoCertificado: data.codigoCertificado,
    firmaNombre: data.firmaNombre,
    firmaRol: data.firmaRol,
    filasMatriz: data.filasMatriz.map(f => ({
      tipoTransaccion: f.tipoTransaccion.toUpperCase(),
      descripcion: `Transacción realizada con Tarjeta ${f.marca}`,
      resultado: f.veredicto === 'APROBADO' ? 'OK' : 'FAIL',
    })),
    manualesUtilizados: data.manualesUtilizados ?? [],
    notasAdicionales: data.notasAdicionales ?? [],
  };
}

export function generateCertificationLetterDocx(data: CertificationLetterData): Buffer {
  const templateBytes = fs.readFileSync(resolveTemplatePath());
  const zip = new PizZip(templateBytes);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  doc.render(buildPayload(data));

  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  }) as Buffer;
}
