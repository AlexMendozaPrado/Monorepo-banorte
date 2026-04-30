/**
 * Tests unit para los builders del script `generate-fixtures`. Cada
 * test sigue el patrón **round-trip**: ejecuta el builder y luego el
 * parser correspondiente, asegurando que el output del builder es
 * realmente parseable por el bot. Este es el contrato más importante
 * de los builders: si el formato cambia y el parser no se actualiza,
 * los fixtures generados no servirán para los tests.
 *
 * No prueban la lógica del parser en sí (eso ya está cubierto en
 * `__tests__/unit/log-parsers/`).
 */

import { buildMatrixXlsx, MatrixRow } from '../../../scripts/builders/matrixBuilder';
import { buildServletLog, ServletBlock } from '../../../scripts/builders/servletLogBuilder';
import { buildProsaLog, ProsaBlock } from '../../../scripts/builders/prosaLogBuilder';
import { buildCybersourceLog, CybersourceBlock } from '../../../scripts/builders/cybersourceLogBuilder';

import { ExcelMatrixParser } from '@/infrastructure/matrix-parser/ExcelMatrixParser';
import { PayworksServletLogParser } from '@/infrastructure/log-parsers/PayworksServletLogParser';
import { PayworksProsaLogParser } from '@/infrastructure/log-parsers/PayworksProsaLogParser';
import { CybersourceLogParser } from '@/infrastructure/log-parsers/CybersourceLogParser';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { An5822Flow } from '@/core/domain/value-objects/An5822Flow';

describe('matrixBuilder.buildMatrixXlsx', () => {
  it('produce un xlsx parseable por ExcelMatrixParser', async () => {
    const rows: MatrixRow[] = [
      {
        referencia: '140374723108',
        numeroControl: '94784155462025052722082685',
        tipoTransaccion: TransactionType.AUTH,
        cardBrand: CardBrand.MASTERCARD,
        monto: 37999.0,
      },
      {
        referencia: '190369542582',
        numeroControl: '94719577962025052706332389',
        tipoTransaccion: TransactionType.PREAUTH,
        cardBrand: CardBrand.VISA,
        monto: 499.0,
        flujoAn5822: An5822Flow.SUBSEQ_MIT,
      },
    ];

    const buf = buildMatrixXlsx(rows);
    expect(buf.length).toBeGreaterThan(0);

    const parser = new ExcelMatrixParser();
    const parsed = await parser.parse(buf);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.referencia).toBe('140374723108');
    expect(parsed[0]?.tipoTransaccion).toBe(TransactionType.AUTH);
    expect(parsed[0]?.cardBrand).toBe(CardBrand.MASTERCARD);
    expect(parsed[1]?.flujoAn5822).toBe(An5822Flow.SUBSEQ_MIT);
  });

  it('soporta vacío (0 filas) sin tirar', () => {
    const buf = buildMatrixXlsx([]);
    expect(buf.length).toBeGreaterThan(0);
  });
});

describe('servletLogBuilder.buildServletLog', () => {
  it('produce un log parseable por PayworksServletLogParser por NUMERO_CONTROL', () => {
    const blocks: ServletBlock[] = [
      {
        kind: 'request',
        controlNumber: 'CTRL-001',
        timestamp: '01/05/2026 10:00:00',
        ip: '10.0.0.1',
        fields: {
          MERCHANT_ID: '8619640',
          AMOUNT: '37999.00',
          CMD_TRANS: 'AUTH',
          ENTRY_MODE: 'MANUAL',
        },
      },
      {
        kind: 'response',
        controlNumber: 'CTRL-001',
        timestamp: '01/05/2026 10:00:01',
        ip: '10.0.0.1',
        fields: {
          PAYW_RESULT: 'A',
          AUTH_CODE: '208393',
        },
      },
    ];

    const log = buildServletLog(blocks);
    const parser = new PayworksServletLogParser();
    const result = parser.parseByControlNumber(log, 'CTRL-001');

    expect(result.request.getField('MERCHANT_ID')).toBe('8619640');
    expect(result.request.getField('AMOUNT')).toBe('37999.00');
    expect(result.request.getField('CMD_TRANS')).toBe('AUTH');
    expect(result.response.getField('PAYW_RESULT')).toBe('A');
    expect(result.response.getField('AUTH_CODE')).toBe('208393');
  });

  it('inyecta CONTROL_NUMBER si el caller no lo pasa en fields', () => {
    const blocks: ServletBlock[] = [
      {
        kind: 'request',
        controlNumber: 'CTRL-AUTO',
        timestamp: '01/05/2026 10:00:00',
        ip: '10.0.0.1',
        fields: { MERCHANT_ID: '123' },
      },
    ];
    const log = buildServletLog(blocks);
    expect(log).toContain('CONTROL_NUMBER:');
    expect(log).toContain('[CTRL-AUTO]');
  });
});

describe('prosaLogBuilder.buildProsaLog', () => {
  it('produce un log parseable por PayworksProsaLogParser por REFERENCIA', () => {
    const blocks: ProsaBlock[] = [
      {
        kind: 'request',
        timestamp: '01/05/2026 10:00:00',
        prosaInstance: 'PROSA6',
        authAddress: '/140.240.11.13:59948',
        sendIp: '/192.168.55.11:59948',
        campos: {
          0: '0200',
          4: '000000003700',
          37: '140374723108',
          41: '8619640         ',
          49: '484',
        },
      },
      {
        kind: 'response',
        timestamp: '01/05/2026 10:00:01',
        prosaInstance: 'PROSA6',
        authAddress: '/140.240.11.13:59948',
        campos: {
          0: '0210',
          37: '140374723108',
          39: '00',
        },
      },
    ];

    const log = buildProsaLog(blocks);
    const parser = new PayworksProsaLogParser();
    const result = parser.parseByReferencia(log, '140374723108', { request: '0200', response: '0210' });

    expect(result.request.getCampo(0)).toBe('0200');
    expect(result.request.getCampo(37)).toBe('140374723108');
    expect(result.response.getCampo(39)).toBe('00');
  });

  it('header de request incluye "IP DE ENVIO" cuando sendIp está presente', () => {
    const blocks: ProsaBlock[] = [
      {
        kind: 'request',
        timestamp: '01/05/2026 10:00:00',
        prosaInstance: 'PROSA1',
        authAddress: '/1.2.3.4:55',
        sendIp: '/5.6.7.8:99',
        campos: { 0: '0200', 37: 'REF-1' },
      },
    ];
    expect(buildProsaLog(blocks)).toContain('IP DE ENVIO : (/5.6.7.8:99)');
  });

  it('response no incluye "IP DE ENVIO"', () => {
    const blocks: ProsaBlock[] = [
      {
        kind: 'response',
        timestamp: '01/05/2026 10:00:01',
        prosaInstance: 'PROSA1',
        authAddress: '/1.2.3.4:55',
        campos: { 0: '0210', 37: 'REF-1' },
      },
    ];
    expect(buildProsaLog(blocks)).not.toContain('IP DE ENVIO');
  });
});

describe('cybersourceLogBuilder.buildCybersourceLog', () => {
  it('produce un log parseable por CybersourceLogParser por OrderId', () => {
    const blocks: CybersourceBlock[] = [
      {
        kind: 'request',
        timestamp: '01/05/2026 10:00',
        fields: {
          OrderId: 'ORD-001',
          merchantId: 'banorteixe',
          amount: '37999.00',
          cardType: '001',
        },
      },
      {
        kind: 'response',
        timestamp: '01/05/2026 10:00',
        fields: {
          OrderId: 'ORD-001',
          requestID: '6600593047186212403015',
          decision: 'ACCEPT',
        },
      },
    ];

    const log = buildCybersourceLog(blocks);
    const parser = new CybersourceLogParser();
    const result = parser.parseByOrderId(log, 'ORD-001');

    expect(result.request.getField('merchantId')).toBe('banorteixe');
    expect(result.request.getField('amount')).toBe('37999.00');
    expect(result.response.getField('requestID')).toBe('6600593047186212403015');
    expect(result.response.getField('decision')).toBe('ACCEPT');
  });

  it('request usa prefijo [WARN] y response usa [INFO]', () => {
    const requestBlock: CybersourceBlock = {
      kind: 'request',
      timestamp: '01/05/2026 10:00',
      fields: { OrderId: 'X', amount: '1.00' },
    };
    const responseBlock: CybersourceBlock = {
      kind: 'response',
      timestamp: '01/05/2026 10:00',
      fields: { OrderId: 'X', decision: 'REJECT' },
    };
    const log = buildCybersourceLog([requestBlock, responseBlock]);
    expect(log).toContain('[WARN] amount: 1.00');
    expect(log).toContain('[INFO] decision: REJECT');
  });
});
