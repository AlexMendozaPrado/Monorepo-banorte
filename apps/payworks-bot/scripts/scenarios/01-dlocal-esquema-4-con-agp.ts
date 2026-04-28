import { TransactionType } from '../../src/core/domain/value-objects/TransactionType';
import { CardBrand } from '../../src/core/domain/value-objects/CardBrand';
import { IntegrationType } from '../../src/core/domain/value-objects/IntegrationType';
import { ServletBlock } from '../builders/servletLogBuilder';
import { ProsaBlock } from '../builders/prosaLogBuilder';
import { MatrixRow } from '../builders/matrixBuilder';
import { VTransaccionRow, AfiliacionRow } from '../builders/csvBuilder';

/**
 * Bundle 01 — DLOCAL · ESQUEMA 4 CON AGP
 *
 * Fuente: LOG DLOCAL - ESQUEMA 4 CON AGP.txt
 * Producto: AGREGADORES_COMERCIO_ELECTRONICO
 *
 * 3 transacciones:
 *   - VENTA   ref=140374723108  control=94784155462025052722082685  MASTERCARD  37999.00
 *   - PREAUTH ref=190369542582  control=94719577962025052706332389  VISA          499.00
 *   - POSTAUTH ref=100370918744 control=22989775632025052706332526  VISA          499.00 (parea con PREAUTH por ref=190369542582)
 *
 * Notar: el log original tiene el campo REFERENCE en POSTAUTH apuntando a
 * la PREAUTH (190369542582), pero el campo Campo 37 PROSA del POSTAUTH es
 * 100370918744 (referencia propia del POST). Replicamos tal cual.
 */

export const dlocalScenario = {
  name: '01-dlocal-esquema-4-con-agp',
  product: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
  merchantName: 'DLOCAL',

  matrix: [
    {
      referencia: '140374723108',
      numeroControl: '94784155462025052722082685',
      tipoTransaccion: TransactionType.AUTH,
      cardBrand: CardBrand.MASTERCARD,
      monto: 37999.00,
      fecha: '27/05/2025',
      hora: '16:08:26',
    },
    {
      referencia: '190369542582',
      numeroControl: '94719577962025052706332389',
      tipoTransaccion: TransactionType.PREAUTH,
      cardBrand: CardBrand.VISA,
      monto: 499.00,
      fecha: '27/05/2025',
      hora: '00:33:23',
    },
    {
      referencia: '100370918744',
      numeroControl: '22989775632025052706332526',
      tipoTransaccion: TransactionType.POSTAUTH,
      cardBrand: CardBrand.VISA,
      monto: 499.00,
      fecha: '27/05/2025',
      hora: '00:33:25',
    },
  ] as MatrixRow[],

  servletBlocks: [
    // ===== VENTA REQUEST =====
    {
      kind: 'request',
      controlNumber: '94784155462025052722082685',
      timestamp: '27/05/2025 16:08:26',
      ip: '99.80.135.225',
      contextHeader: 'VENTA LOG DE ENTRADA',
      fields: {
        CARD_NUMBER: '518899******7492',
        CMD_TRANS: 'AUTH',
        MERCHANT_ID: '9342244',
        SUB_MERCHANT: 'ECOFLOWCOM',
        RESPONSE_LANGUAGE: 'EN',
        CONTROL_NUMBER: '94784155462025052722082685',
        TERMINAL_ID: '93422441',
        AGGREGATOR_ID: '5299825',
        USER: 'a9342244',
        AMOUNT: '37999.00',
        CUSTOMER_REF3: '9478415546',
        ENTRY_MODE: 'MANUAL',
        CUSTOMER_REF5: 'DLOCAL',
        MODE: 'PRD',
        NUMERO_BIN: '518899',
      },
    },
    // ===== VENTA RESPONSE =====
    {
      kind: 'response',
      controlNumber: '94784155462025052722082685',
      timestamp: '27/05/2025 16:08:27',
      ip: '99.80.135.225',
      contextHeader: 'VENTA LOG DE SALIDA',
      fields: {
        AUTH_CODE: '010431',
        CUST_RSP_DATE: '20250527 16:08:27.673',
        AUTH_RSP_DATE: '20250527 16:08:27.670',
        CARD_TYPE: 'CREDITO   ',
        TEXT: 'Approved',
        ISSUING_BANK: 'BANAMEX   ',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '94784155462025052722082685',
        CUST_REQ_DATE: '20250527 16:08:26.949',
        REFERENCE: '140374723108',
        AUTH_RESULT: '00',
        CARD_BRAND: 'MASTERCARD',
        MERCHANT_ID: '9342244',
        AUTH_REQ_DATE: '20250527 16:08:26.974',
        NUMERO_BIN: '518899',
      },
    },
    // ===== PREAUTH REQUEST =====
    {
      kind: 'request',
      controlNumber: '94719577962025052706332389',
      timestamp: '27/05/2025 00:33:23',
      ip: '99.80.135.225',
      contextHeader: 'PREAUTH LOG DE ENTRADA',
      fields: {
        CARD_NUMBER: '481516******4815',
        USER: 'a9351533',
        CMD_TRANS: 'PREAUTH',
        MERCHANT_ID: '9351533',
        SUB_MERCHANT: 'SIMPLEAPP',
        RESPONSE_LANGUAGE: 'EN',
        CONTROL_NUMBER: '94719577962025052706332389',
        TERMINAL_ID: '93515331',
        AGGREGATOR_ID: '5059634',
        AMOUNT: '499.00',
        CUSTOMER_REF3: '9471957796',
        ENTRY_MODE: 'MANUAL',
        CUSTOMER_REF5: 'DLOCAL',
        MODE: 'PRD',
        NUMERO_BIN: '481516',
      },
    },
    // ===== PREAUTH RESPONSE =====
    {
      kind: 'response',
      controlNumber: '94719577962025052706332389',
      timestamp: '27/05/2025 00:33:24',
      ip: '99.80.135.225',
      contextHeader: 'PREAUTH LOG DE ENVIO',
      fields: {
        AUTH_CODE: '015247',
        CUST_RSP_DATE: '20250527 00:33:24.289',
        AUTH_RSP_DATE: '20250527 00:33:24.286',
        CARD_TYPE: 'DEBITO    ',
        TEXT: 'Approved',
        ISSUING_BANK: 'BANCOMER  ',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '94719577962025052706332389',
        CUST_REQ_DATE: '20250527 00:33:23.996',
        REFERENCE: '190369542582',
        AUTH_RESULT: '00',
        CARD_BRAND: 'VISA------',
        MERCHANT_ID: '9351533',
        AUTH_REQ_DATE: '20250527 00:33:24.028',
        NUMERO_BIN: '481516',
      },
    },
    // ===== POSTAUTH REQUEST =====
    {
      kind: 'request',
      controlNumber: '22989775632025052706332526',
      timestamp: '27/05/2025 00:33:25',
      ip: '99.80.135.225',
      contextHeader: 'POST LOG DE ENTRADA',
      fields: {
        TERMINAL_ID: '93515331',
        CMD_TRANS: 'POSTAUTH',
        MERCHANT_ID: '9351533',
        SUB_MERCHANT: 'SIMPLEAPP',
        RESPONSE_LANGUAGE: 'EN',
        CONTROL_NUMBER: '22989775632025052706332526',
        AGGREGATOR_ID: '5059634',
        REFERENCE: '190369542582',
        USER: 'a9351533',
        AMOUNT: '499.00',
        CUSTOMER_REF3: '9471957796',
        ENTRY_MODE: 'MANUAL',
        CUSTOMER_REF5: 'DLOCAL',
        MODE: 'PRD',
        NUMERO_BIN: '481516',
      },
    },
    // ===== POSTAUTH RESPONSE =====
    {
      kind: 'response',
      controlNumber: '22989775632025052706332526',
      timestamp: '27/05/2025 00:33:25',
      ip: '99.80.135.225',
      contextHeader: 'POST LOG DE ENVIO',
      fields: {
        AUTH_CODE: '015247',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '22989775632025052706332526',
        CUST_RSP_DATE: '20250527 00:33:25.405',
        CUST_REQ_DATE: '20250527 00:33:25.359',
        REFERENCE: '100370918744',
        AUTH_RSP_DATE: '20250527 00:33:25.400',
        AUTH_RESULT: '00',
        TEXT: 'Approved',
        MERCHANT_ID: '9351533',
        AUTH_REQ_DATE: '20250527 00:33:25.377',
        NUMERO_BIN: '481516',
      },
    },
  ] as ServletBlock[],

  prosaBlocks: [
    // ===== VENTA PROSA REQUEST =====
    {
      kind: 'request',
      timestamp: '27/05/2025 16:08:26',
      prosaInstance: 'PROSA6',
      authAddress: '/192.168.121.12:53221',
      sendIp: '/192.168.148.37:43221',
      contextHeader: 'VENTA LOG DE ENVIO A PROSA',
      campos: {
        0: '0200', 3: '000000', 4: '000003799900', 7: '0527220826',
        11: '160826', 12: '160826', 13: '0527', 17: '0527', 18: '5399', 22: '010',
        32: '544550', 35: '518899******7492', 37: '140374723108',
        41: '93422441        ',
        43: 'DLO*ECOFLOWCOM        CIUDAD DE MEXDF MX',
        48: '5299825            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: '    PRO100000000000',
        100: '000000000', 120: '                         0000',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  HOSTB24 1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== VENTA PROSA RESPONSE =====
    {
      kind: 'response',
      timestamp: '27/05/2025 16:08:27',
      prosaInstance: 'PROSA6',
      authAddress: '/192.168.121.12:53221',
      contextHeader: 'VENTA LOG DE RESPUESTA PROSA',
      campos: {
        0: '0210', 3: '000000', 4: '000003799900', 7: '0527220827',
        11: '160826', 12: '160826', 13: '0527', 17: '0527', 18: '5310', 22: '010',
        32: '544550', 35: '518899******7492', 37: '140374723108',
        38: '010431', 39: '00',
        41: '93422441        ', 48: '5299825            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: 'EGLOEGLO00000000000',
        100: '3332', 120: '                         0000',
        121: '      P0          P0', 123: '                    ',
        124: '001001001', 125: 'C1HOSTBICI1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== PREAUTH PROSA REQUEST =====
    {
      kind: 'request',
      timestamp: '27/05/2025 00:33:24',
      prosaInstance: 'PROSA5',
      authAddress: '/192.168.245.13:53204',
      sendIp: '/192.168.148.38:43204',
      contextHeader: 'PREAUTH LOG DE ENTRADA PROSA',
      campos: {
        0: '0200', 3: '000000', 4: '000000049900', 7: '0527063324',
        11: '003323', 12: '003323', 13: '0527', 17: '0527', 18: '5399', 22: '010',
        32: '544550', 35: '481516******4815', 37: '190369542582',
        41: '93515331        ',
        43: 'DLO*SIMPLEAPP         CIUDAD DE MEXDF MX',
        48: '5059634            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: '    PRO100000000000',
        100: '000000000', 120: '                         0000',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  HOSTB24 0 ',
        126: '000000000000133                    000',
      },
    },
    // ===== PREAUTH PROSA RESPONSE =====
    {
      kind: 'response',
      timestamp: '27/05/2025 00:33:24',
      prosaInstance: 'PROSA5',
      authAddress: '/192.168.245.13:53204',
      contextHeader: 'PREAUTH LOG DE RESPUESTA PROSA',
      campos: {
        0: '0210', 3: '000000', 4: '000000049900', 7: '0527063324',
        11: '003323', 12: '003323', 13: '0527', 17: '0527', 18: '7372', 22: '010',
        32: '544550', 35: '481516******4815', 37: '190369542582',
        38: '015247', 39: '00',
        41: '93515331        ', 48: '5059634            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: 'EGLOEGLO00000000000',
        100: '3332', 120: '                         0000',
        121: '      P0          P0', 123: '                    ',
        124: '001001001', 125: 'P2HOSTBICI0 ',
        126: '000000000000133                    000',
      },
    },
    // ===== POSTAUTH PROSA REQUEST =====
    {
      kind: 'request',
      timestamp: '27/05/2025 00:33:25',
      prosaInstance: 'PROSA6',
      authAddress: '/192.168.121.15:53240',
      sendIp: '/192.168.148.39:43240',
      contextHeader: 'POST LOG DE ENTRADA PROSA',
      campos: {
        0: '0220', 3: '000000', 4: '000000049900', 7: '0527063325',
        11: '003325', 12: '003325', 13: '0527', 17: '0527', 18: '5399', 22: '010',
        32: '544550', 35: '481516******4815', 37: '100370918744',
        38: '015247', 39: '00',
        41: '93515331        ',
        43: 'DLO*SIMPLEAPP         CIUDAD DE MEXDF MX',
        48: '5059634            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: 'EGLOEGLO00000000000',
        100: '000000000', 120: '                         0000',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  HOSTB24 1 ',
        126: '000000000000133                    000',
      },
    },
    // ===== POSTAUTH PROSA RESPONSE =====
    {
      kind: 'response',
      timestamp: '27/05/2025 00:33:25',
      prosaInstance: 'PROSA6',
      authAddress: '/192.168.121.15:53240',
      contextHeader: 'POST LOG DE ENVIO PROSA',
      campos: {
        0: '0230', 3: '000000', 4: '000000049900', 7: '0527063325',
        11: '003325', 12: '003325', 13: '0527', 17: '0527', 22: '010',
        32: '544550', 35: '481516******4815', 37: '100370918744', 39: '00',
        41: '93515331        ', 48: '5059634            00010001', 49: '484',
        61: 'EGLOEGLO00000000000',
        120: '                         0000',
        121: '      P0            ',
        126: '000000000000133                    000',
      },
    },
  ] as ProsaBlock[],

  vTransacciones: [
    {
      numero: '9342244', nombre: 'DLOCAL ECOFLOWCOM',
      referencia: '140374723108', numeroControl: '94784155462025052722082685',
      tipoTrans: 'VTA', modo: 'PRD', monto: '37999.00',
      numeroTarjeta: '5188990000007492',
      fechaRecepCte: '2025-05-27 16:08:26', horaRecepCte: '16:08:26',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
    {
      numero: '9351533', nombre: 'DLOCAL SIMPLEAPP',
      referencia: '190369542582', numeroControl: '94719577962025052706332389',
      tipoTrans: 'PRE', modo: 'PRD', monto: '499.00',
      numeroTarjeta: '4815160000004815',
      fechaRecepCte: '2025-05-27 00:33:23', horaRecepCte: '00:33:23',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
    {
      numero: '9351533', nombre: 'DLOCAL SIMPLEAPP',
      referencia: '100370918744', numeroControl: '22989775632025052706332526',
      tipoTrans: 'POS', modo: 'PRD', monto: '499.00',
      numeroTarjeta: '4815160000004815',
      fechaRecepCte: '2025-05-27 00:33:25', horaRecepCte: '00:33:25',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
  ] as VTransaccionRow[],

  afiliaciones: [
    {
      idAfiliacion: '9342244', nombreComercio: 'ECOFLOWCOM',
      razonSocial: 'DLOCAL ECOFLOWCOM SA DE CV', esquema: 'ESQ_4_CON_AGP',
      giro: 'Agregador',
    },
    {
      idAfiliacion: '9351533', nombreComercio: 'SIMPLEAPP',
      razonSocial: 'DLOCAL SIMPLEAPP SA DE CV', esquema: 'ESQ_4_CON_AGP',
      giro: 'Agregador',
    },
  ] as AfiliacionRow[],
};
