import * as XLSX from 'xlsx';
import { ExcelMatrixParser } from '@/infrastructure/matrix-parser/ExcelMatrixParser';
import { An5822Flow } from '@/core/domain/value-objects/An5822Flow';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';

function buildWorkbook(headers: string[], rows: string[][]): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Matriz');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

describe('ExcelMatrixParser', () => {
  const parser = new ExcelMatrixParser();

  const baseHeaders = [
    'REFERENCIA', 'NUMERO_CONTROL', 'TIPO_TRANSACCION',
    'TARJETA', 'MONTO', 'FECHA', 'HORA',
  ];
  const baseRow = ['REF-001', 'CTRL-001', 'VENTA', 'MC', '1500.00', '2026-03-11', '12:00:00'];

  describe('columna base (retrocompatibilidad)', () => {
    it('parsea una matriz sin columna flujo_an5822 sin errores', async () => {
      const buffer = buildWorkbook(baseHeaders, [baseRow]);
      const txs = await parser.parse(buffer);
      expect(txs).toHaveLength(1);
      expect(txs[0].referencia).toBe('REF-001');
      expect(txs[0].tipoTransaccion).toBe(TransactionType.AUTH);
      expect(txs[0].cardBrand).toBe(CardBrand.MASTERCARD);
      // flujoAn5822 debe ser undefined (columna ausente), no null.
      expect(txs[0].flujoAn5822).toBeUndefined();
    });
  });

  describe('columna flujo_an5822', () => {
    const headersWithFlujo = [...baseHeaders, 'FLUJO_AN5822'];

    it.each<[string, An5822Flow]>([
      ['firstCIT', An5822Flow.FIRST_CIT],
      ['subseqCIT', An5822Flow.SUBSEQ_CIT],
      ['subseqMIT', An5822Flow.SUBSEQ_MIT],
      ['firstcit', An5822Flow.FIRST_CIT],
      ['SUBSEQCIT', An5822Flow.SUBSEQ_CIT],
      ['subseq_mit', An5822Flow.SUBSEQ_MIT],
    ])('acepta variante de escritura "%s" → %s', async (input, expected) => {
      const buffer = buildWorkbook(headersWithFlujo, [[...baseRow, input]]);
      const txs = await parser.parse(buffer);
      expect(txs[0].flujoAn5822).toBe(expected);
    });

    it.each(['N/A', 'n/a', ''])('valor "%s" se mapea a null', async (input) => {
      const buffer = buildWorkbook(headersWithFlujo, [[...baseRow, input]]);
      const txs = await parser.parse(buffer);
      expect(txs[0].flujoAn5822).toBeNull();
    });

    it('rechaza valores inválidos con mensaje claro', async () => {
      const buffer = buildWorkbook(headersWithFlujo, [[...baseRow, 'CIT']]);
      await expect(parser.parse(buffer)).rejects.toThrow(/inválido/);
      await expect(parser.parse(buffer)).rejects.toThrow(/firstCIT, subseqCIT, subseqMIT/);
    });

    it('el error de valor inválido incluye número de fila (2-indexed)', async () => {
      const buffer = buildWorkbook(headersWithFlujo, [
        [...baseRow, 'firstCIT'],       // fila 2 OK
        [...baseRow, 'BAD_VALUE'],      // fila 3 inválida
      ]);
      await expect(parser.parse(buffer)).rejects.toThrow(/Fila 3/);
    });
  });

  describe('aliases de columna', () => {
    it.each([
      'FLUJO_AN5822',
      'flujo_an5822',
      'Flujo AN5822',
      'FLUJOAN5822',
      'AN5822_FLOW',
      'an5822 flow',
    ])('reconoce header "%s"', async (header) => {
      const headers = [...baseHeaders, header];
      const buffer = buildWorkbook(headers, [[...baseRow, 'firstCIT']]);
      const txs = await parser.parse(buffer);
      expect(txs[0].flujoAn5822).toBe(An5822Flow.FIRST_CIT);
    });
  });
});
