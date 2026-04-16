/**
 * DTO containing the 22 placeholders required by the official Banorte
 * certification letter (see `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf`).
 *
 * Missing fields render as `—` in the PDF; the generator never throws
 * on absent data.
 */
export interface CertificationLetterData {
  // ---- Header ----
  /** e.g. `CE3DS-0003652_9885405` */
  codigoCertificado: string;
  /** Fecha de emisión (DD/MM/YYYY). */
  fechaEmision: string;
  /** Versión del manual del producto certificado (e.g. `2.5`). */
  versionManual: string;
  /** e.g. `CERTIFICACIÓN COMERCIO ELECTRONICO CON 3D SECURE`. */
  tituloCertificacion: string;

  // ---- Sección 1: Datos del proceso ----
  coordinadorCertificacion?: string;
  nombreComercio: string;
  rfc?: string;
  numeroCliente?: string;
  idAfiliacion: string;
  esquema?: string;
  modoTransmision?: string;
  mensajeria?: string;
  lenguaje?: string;
  tarjetasProcesadas?: string;
  giro?: string;
  modoLectura?: string;
  versionAplicacion?: string;

  // ---- Responsable técnico del comercio ----
  responsableNombre?: string;
  responsableEmail?: string;
  responsableTelefono?: string;
  responsableDireccion?: string;

  // ---- Extras para la carta oficial ----
  /** URL del subdominio verificado (ej. `https://api.mueveciudad.net`). */
  urlSubdominio?: string;
  /** Usuario utilizado para la certificación (ej. `A9885405`). */
  usuarioCertificacion?: string;
  /** Lista de manuales utilizados (ej. `["Manual...Tradicional_V2.5", "Manual...3DSecure_V1.4"]`). */
  manualesUtilizados?: string[];

  // ---- Resultados ----
  totalTransacciones: number;
  aprobadas: number;
  rechazadas: number;
  veredictoGlobal: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';

  // ---- Matriz de pruebas ----
  filasMatriz: Array<{
    referencia: string;
    tipoTransaccion: string;
    marca: string;
    veredicto: string;
  }>;

  // ---- Firma ----
  firmaNombre: string;
  firmaRol: string;
}

/**
 * Returns a deterministic certificate code of the form
 * `CE{PREFIJO}-{NNNNNNN}_{AFILIACION}`. Until the official sequence is
 * provided by Ramsses (pendiente P5.1), the consecutivo is derived from
 * the first 7 characters of the sessionId hash so it's stable for a
 * given session.
 */
export function buildCertificateCode(
  integrationType: string,
  sessionId: string,
  idAfiliacion: string,
): string {
  const prefixMap: Record<string, string> = {
    ECOMMERCE_TRADICIONAL: '3DS',
    MOTO: 'MTO',
    CARGOS_PERIODICOS_POST: 'CPP',
    VENTANA_COMERCIO_ELECTRONICO: 'VCE',
    AGREGADORES_COMERCIO_ELECTRONICO: 'AEC',
    AGREGADORES_CARGOS_PERIODICOS: 'ACP',
    API_PW2_SEGURO: 'PW2',
    INTERREDES_REMOTO: 'INT',
  };
  const prefix = prefixMap[integrationType] ?? 'GEN';
  // Stable 7-digit numeric consecutive from sessionId hash
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  const consecutivo = (hash % 9999999).toString().padStart(7, '0');
  const afiliacion = idAfiliacion || '0000000';
  return `CE${prefix}-${consecutivo}_${afiliacion}`;
}
