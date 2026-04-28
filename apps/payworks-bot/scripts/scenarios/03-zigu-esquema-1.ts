import { TransactionType } from '../../src/core/domain/value-objects/TransactionType';
import { CardBrand } from '../../src/core/domain/value-objects/CardBrand';
import { IntegrationType } from '../../src/core/domain/value-objects/IntegrationType';
import { An5822Flow } from '../../src/core/domain/value-objects/An5822Flow';
import { ServletBlock } from '../builders/servletLogBuilder';
import { ProsaBlock } from '../builders/prosaLogBuilder';
import { MatrixRow } from '../builders/matrixBuilder';
import { VTransaccionRow, AfiliacionRow } from '../builders/csvBuilder';

/**
 * Bundle 03 — ZIGU · ESQUEMA 1
 *
 * Fuente: LOGS ZIGU - ESQUEMA 1.txt
 * Producto: AGREGADORES_COMERCIO_ELECTRONICO (Esquema 1)
 *
 * 2 transacciones VENTA con campos AN5822 explicitos (COF, AMOUNT_TYPE,
 * PAYMENT_INFO, PAYMENT_IND):
 *   - VTA1 ref=140559968829  control=6535824458  MASTERCARD  19.97  PAYMENT_INFO=2 (subseqMIT)
 *   - VTA2 ref=140559970854  control=6535827540  MASTERCARD  19.99  PAYMENT_IND=R (Recurring)
 */

export const ziguScenario = {
  name: '03-zigu-esquema-1',
  product: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
  merchantName: 'ZIGU',

  matrix: [
    {
      referencia: '140559968829',
      numeroControl: '6535824458',
      tipoTransaccion: TransactionType.AUTH,
      cardBrand: CardBrand.MASTERCARD,
      monto: 19.97,
      fecha: '16/12/2025',
      hora: '08:24:57',
      flujoAn5822: An5822Flow.SUBSEQ_MIT,
    },
    {
      referencia: '140559970854',
      numeroControl: '6535827540',
      tipoTransaccion: TransactionType.AUTH,
      cardBrand: CardBrand.MASTERCARD,
      monto: 19.99,
      fecha: '16/12/2025',
      hora: '08:27:38',
      flujoAn5822: An5822Flow.SUBSEQ_MIT,
    },
  ] as MatrixRow[],

  servletBlocks: [
    // ===== VENTA 1 REQUEST =====
    {
      kind: 'request',
      controlNumber: '6535824458',
      timestamp: '16/12/2025 08:24:57',
      ip: '66.23.212.68',
      contextHeader: 'Servlet',
      fields: {
        CARD_NUMBER: '542418******1734',
        GATEWAY_ID: '00000605483',
        CMD_TRANS: 'AUTH',
        COF: '4',
        AMOUNT_TYPE: 'V',
        USER: 'a9607773',
        CONTROL_NUMBER: '6535824458',
        TERMINAL_ID: '96077731',
        RESPONSE_LANGUAGE: 'EN',
        CUST_REF3: '',
        PAYMENT_INFO: '2',
        AMOUNT: '19.97',
        MERCHANT_ID: '9607773',
        ENTRY_MODE: 'MANUAL',
        CUSTOMER_REF5: 'ZIGU',
        MODE: 'PRD',
        PAYMENT_IND: 'U',
        NUMERO_BIN: '542418',
      },
    },
    // ===== VENTA 1 RESPONSE =====
    {
      kind: 'response',
      controlNumber: '6535824458',
      timestamp: '16/12/2025 08:24:58',
      ip: '66.23.212.68',
      fields: {
        AUTH_CODE: '46802P',
        CUST_RSP_DATE: '20251216 08:24:58.010',
        AUTH_RSP_DATE: '20251216 08:24:58.007',
        CARD_TYPE: 'CREDITO   ',
        TEXT: 'Approved',
        ISSUING_BANK: 'EXTRANJERA',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '6535824458',
        CUST_REQ_DATE: '20251216 08:24:57.452',
        REFERENCE: '140559968829',
        AUTH_RESULT: '00',
        CARD_BRAND: 'MASTERCARD',
        MERCHANT_ID: '9607773',
        AUTH_REQ_DATE: '20251216 08:24:57.482',
        NUMERO_BIN: '542418',
      },
    },
    // ===== VENTA 2 REQUEST =====
    {
      kind: 'request',
      controlNumber: '6535827540',
      timestamp: '16/12/2025 08:27:38',
      ip: '66.23.212.68',
      fields: {
        CARD_NUMBER: '542418******0601',
        GATEWAY_ID: '00000605483',
        CMD_TRANS: 'AUTH',
        COF: '4',
        AMOUNT_TYPE: 'F',
        USER: 'APIFITXR',
        CONTROL_NUMBER: '6535827540',
        TERMINAL_ID: '95263671',
        RESPONSE_LANGUAGE: 'EN',
        CUST_REF3: '6198364708',
        PAYMENT_INFO: '2',
        AMOUNT: '19.99',
        MERCHANT_ID: '9526367',
        ENTRY_MODE: 'MANUAL',
        CUSTOMER_REF5: 'ZIGU',
        MODE: 'PRD',
        PAYMENT_IND: 'R',
        NUMERO_BIN: '542418',
      },
    },
    // ===== VENTA 2 RESPONSE =====
    {
      kind: 'response',
      controlNumber: '6535827540',
      timestamp: '16/12/2025 08:27:38',
      ip: '66.23.212.68',
      fields: {
        AUTH_CODE: '89228P',
        CUST_RSP_DATE: '20251216 08:27:38.623',
        AUTH_RSP_DATE: '20251216 08:27:38.600',
        CARD_TYPE: 'CREDITO   ',
        TEXT: 'Approved',
        ISSUING_BANK: 'EXTRANJERA',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '6535827540',
        CUST_REQ_DATE: '20251216 08:27:38.087',
        REFERENCE: '140559970854',
        AUTH_RESULT: '00',
        CARD_BRAND: 'MASTERCARD',
        MERCHANT_ID: '9526367',
        AUTH_REQ_DATE: '20251216 08:27:38.120',
        NUMERO_BIN: '542418',
      },
    },
  ] as ServletBlock[],

  prosaBlocks: [
    // ===== VENTA 1 PROSA REQUEST =====
    {
      kind: 'request',
      timestamp: '16/12/2025 08:24:57',
      prosaInstance: 'PROSA3',
      authAddress: '/192.168.245.78:53189',
      sendIp: '/192.168.148.40:43189',
      contextHeader: 'PROSA',
      campos: {
        0: '0200', 3: '000000', 4: '000000001997', 7: '1216142457',
        11: '082457', 12: '082457', 13: '1216', 17: '1216', 18: '5964', 22: '100',
        32: '544550', 35: '542418******1734', 37: '140559968829',
        41: '96077731        ',
        43: 'ZIG*USADC 8444820383  SN PEDRO GARZNL MX',
        48: '9607773            00010001', 49: '840',
        60: 'D072AGRE-3600001', 61: '    PRO100000000000',
        62: '66256     ',
        100: '000000000', 120: 'AV LOMAS DEL VALLE NO 430    ',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  INTRB24 1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== VENTA 1 PROSA RESPONSE =====
    {
      kind: 'response',
      timestamp: '16/12/2025 08:24:58',
      prosaInstance: 'PROSA3',
      authAddress: '/192.168.245.78:53189',
      campos: {
        0: '0210', 3: '000000', 4: '000000001997', 7: '1216142457',
        11: '082457', 12: '082457', 13: '1216', 17: '1216', 18: '5964', 22: '100',
        32: '544550', 35: '542418******1734', 37: '140559968829',
        38: '46802P', 39: '00',
        41: '96077731        ', 48: '9607773            00010001', 49: '840',
        60: 'D072AGRE-3600001', 61: 'BNETBNET00000      ',
        100: '0', 120: 'AV LOMAS DEL VALLE NO 430    ',
        121: '      P0          F0', 123: '                    ',
        124: '001001001', 125: 'M INTRBNET1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== VENTA 2 PROSA REQUEST =====
    {
      kind: 'request',
      timestamp: '16/12/2025 08:27:38',
      prosaInstance: 'PROSA3',
      authAddress: '/192.168.245.78:53189',
      sendIp: '/192.168.148.40:43189',
      campos: {
        0: '0200', 3: '000000', 4: '000000001999', 7: '1216142738',
        11: '082738', 12: '082738', 13: '1216', 17: '1216', 18: '4816', 22: '100',
        32: '544550', 35: '542418******0601', 37: '140559970854',
        41: '95263671        ',
        43: 'ZIG*FIT XR 8446762143 SAN PEDRO GARNL MX',
        48: '9526367            00010001', 49: '840',
        60: 'D072AGRE-3600001', 61: '    PRO100000000000',
        62: '66256     ',
        100: '000000000', 120: 'AV LOMAS DEL VALLE NO 430    ',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  INTRB24 1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== VENTA 2 PROSA RESPONSE =====
    {
      kind: 'response',
      timestamp: '16/12/2025 08:27:38',
      prosaInstance: 'PROSA3',
      authAddress: '/192.168.245.78:53189',
      campos: {
        0: '0210', 3: '000000', 4: '000000001999', 7: '1216142738',
        11: '082738', 12: '082738', 13: '1216', 17: '1216', 18: '4816', 22: '100',
        32: '544550', 35: '542418******0601', 37: '140559970854',
        38: '89228P', 39: '00',
        41: '95263671        ', 48: '9526367            00010001', 49: '840',
        60: 'D072AGRE-3600001', 61: 'BNETBNET00000      ',
        100: '0', 120: 'AV LOMAS DEL VALLE NO 430    ',
        121: '      P0          F0', 123: '                    ',
        124: '001001001', 125: 'M INTRBNET1 ',
        126: '000000000000133                    000',
      },
    },
  ] as ProsaBlock[],

  vTransacciones: [
    {
      numero: '9607773', nombre: 'ZIGU USADC',
      referencia: '140559968829', numeroControl: '6535824458',
      tipoTrans: 'VTA', modo: 'PRD', monto: '19.97',
      numeroTarjeta: '5424180000001734',
      fechaRecepCte: '2025-12-16 08:24:57', horaRecepCte: '08:24:57',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
    {
      numero: '9526367', nombre: 'ZIGU FIT XR',
      referencia: '140559970854', numeroControl: '6535827540',
      tipoTrans: 'VTA', modo: 'PRD', monto: '19.99',
      numeroTarjeta: '5424180000000601',
      fechaRecepCte: '2025-12-16 08:27:38', horaRecepCte: '08:27:38',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
  ] as VTransaccionRow[],

  afiliaciones: [
    {
      idAfiliacion: '9607773', nombreComercio: 'USADC',
      razonSocial: 'ZIGU USADC SA DE CV', esquema: 'ESQ_1', giro: 'Agregador',
    },
    {
      idAfiliacion: '9526367', nombreComercio: 'FIT XR',
      razonSocial: 'ZIGU FIT XR SA DE CV', esquema: 'ESQ_1', giro: 'Agregador',
    },
  ] as AfiliacionRow[],
};
