import * as XLSX from 'xlsx';
import { TransactionType } from '../../src/core/domain/value-objects/TransactionType';
import { CardBrand } from '../../src/core/domain/value-objects/CardBrand';
import { An5822Flow } from '../../src/core/domain/value-objects/An5822Flow';

export interface MatrixRow {
  referencia: string;
  numeroControl: string;
  tipoTransaccion: TransactionType;
  cardBrand: CardBrand;
  monto: number;
  fecha?: string;
  hora?: string;
  flujoAn5822?: An5822Flow | null;
}

/**
 * Genera un workbook XLSX con headers que `ExcelMatrixParser.COLUMN_MAPPINGS`
 * reconoce sin transformación.
 */
export function buildMatrixXlsx(rows: MatrixRow[]): Buffer {
  const headers = [
    'REFERENCIA',
    'NUMERO_CONTROL',
    'TIPO_TRANSACCION',
    'MARCA',
    'MONTO',
    'FECHA',
    'HORA',
    'FLUJO_AN5822',
  ];

  const data = rows.map((r) => ({
    REFERENCIA: r.referencia,
    NUMERO_CONTROL: r.numeroControl,
    TIPO_TRANSACCION: r.tipoTransaccion,
    MARCA: r.cardBrand,
    MONTO: r.monto,
    FECHA: r.fecha ?? '',
    HORA: r.hora ?? '',
    FLUJO_AN5822: r.flujoAn5822 ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Matriz');
  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  return buf;
}
