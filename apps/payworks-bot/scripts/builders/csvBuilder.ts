export interface VTransaccionRow {
  numero: string;          // ID_AFILIACION
  nombre: string;          // NOMBRE_COMERCIO
  referencia: string;
  numeroControl: string;
  tipoTrans: string;       // VTA, CAN, DEV, PRE, POS, ...
  modo: string;            // PRD
  monto: string;           // decimal as string for fidelity
  numeroTarjeta: string;   // sin enmascarar (para detectar brand)
  fechaRecepCte: string;   // ISO o YYYY-MM-DD HH:MM:SS
  horaRecepCte: string;
  payWEntrada?: string;
  payWAutorizador?: string;
  codigoErrorPayw?: string;
  codResultAut?: string;
  textoAprobacion?: string;
}

const V_TRANSACCION_HEADERS = [
  'NUMERO',
  'NOMBRE',
  'REFERENCIA',
  'NUMERO_CONTROL',
  'TIPO_TRANS',
  'MODO',
  'MONTO',
  'CODIGO_ERROR_PAYW',
  'COD_RESULT_AUT',
  'TEXTO_APROBACION',
  'PAYW_ENTRADA',
  'PAYW_AUTORIZADOR',
  'FECHA_RECEP_CTE',
  'HORA_RECEP_CTE',
  'NUMERO_TARJETA',
];

export function buildVTransaccionesCsv(rows: VTransaccionRow[]): string {
  const lines = [V_TRANSACCION_HEADERS.join(',')];
  for (const r of rows) {
    lines.push([
      r.numero,
      r.nombre,
      r.referencia,
      r.numeroControl,
      r.tipoTrans,
      r.modo,
      r.monto,
      r.codigoErrorPayw ?? '',
      r.codResultAut ?? '',
      r.textoAprobacion ?? '',
      r.payWEntrada ?? '',
      r.payWAutorizador ?? '',
      r.fechaRecepCte,
      r.horaRecepCte,
      r.numeroTarjeta,
    ].map(csvEscape).join(','));
  }
  return lines.join('\n') + '\n';
}

export interface AfiliacionRow {
  idAfiliacion: string;
  nombreComercio: string;
  razonSocial?: string;
  rfc?: string;
  esquema?: string;
  giro?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
}

const AFILIACION_HEADERS = [
  'ID_AFILIACION',
  'NOMBRE_COMERCIO',
  'RAZON_SOCIAL',
  'RFC',
  'ESQUEMA',
  'GIRO',
  'DIRECCION',
  'CIUDAD',
  'ESTADO',
  'CP',
];

export function buildAfiliacionesCsv(rows: AfiliacionRow[]): string {
  const lines = [AFILIACION_HEADERS.join(',')];
  for (const r of rows) {
    lines.push([
      r.idAfiliacion,
      r.nombreComercio,
      r.razonSocial ?? '',
      r.rfc ?? '',
      r.esquema ?? '',
      r.giro ?? '',
      r.direccion ?? '',
      r.ciudad ?? '',
      r.estado ?? '',
      r.cp ?? '',
    ].map(csvEscape).join(','));
  }
  return lines.join('\n') + '\n';
}

function csvEscape(value: string): string {
  if (value === undefined || value === null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
