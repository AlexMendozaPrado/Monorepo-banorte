import { TransactionType } from '../../src/core/domain/value-objects/TransactionType';
import { CardBrand } from '../../src/core/domain/value-objects/CardBrand';
import { IntegrationType } from '../../src/core/domain/value-objects/IntegrationType';
import { ServletBlock } from '../builders/servletLogBuilder';
import { ProsaBlock } from '../builders/prosaLogBuilder';
import { MatrixRow } from '../builders/matrixBuilder';
import { VTransaccionRow, AfiliacionRow } from '../builders/csvBuilder';

/**
 * Bundle 02 — OPENLINEA · ESQUEMA 4 SIN AGP
 *
 * Fuente: LOG OPENLINEA - ESQUEMA 4 SIN AGP.txt
 * Producto: AGREGADORES_COMERCIO_ELECTRONICO (sin AGP)
 *
 * 1 transaccion VENTA con campos extendidos del Anexo D y EMV_TAGS:
 *   - VENTA ref=821545843260  control=3814--a51411e042b5404394c9  VISA  1650.00
 */

export const openlineaScenario = {
  name: '02-openlinea-esquema-4-sin-agp',
  product: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
  merchantName: 'OPENLINEA',

  matrix: [
    {
      referencia: '821545843260',
      numeroControl: '3814--a51411e042b5404394c9',
      tipoTransaccion: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      monto: 1650.00,
      fecha: '21/03/2026',
      hora: '15:26:41',
    },
  ] as MatrixRow[],

  servletBlocks: [
    {
      kind: 'request',
      controlNumber: '3814--a51411e042b5404394c9',
      timestamp: '21/03/2026 15:26:41',
      ip: '104.210.219.110',
      contextHeader: 'Servlet',
      fields: {
        TERMINAL_ID: '80270239500018',
        SUB_MERCHANT: 'ESSENTIALMASSA',
        DOMICILIO_COMERCIO: 'PORTAL ALLENDE 10',
        CMD_TRANS: 'AUTH',
        EMV_TAGS: '9F02060000001650009F03060000000000009F260876C5A6EFDBAE3BE75F240328033182020000500B56495341204352454449545F3401019F360200539F2701808407A00000000310109F100706011203A000009F330360B0C89F1A0204849F350122950500000000005F2A0204849A032603219C01009F3704CEC89DE49F4104000022754F07A00000000310105F201843415244484F4C4445522F564953412020202020202020209F6E04207000009F0607A00000000310109F1E08333933313737313257124100390732349531D28032010380141100005A08410039******95319B0200009F150212349F1C0831323334353637389F21031526289F3901079F6E04207000009F6C0200009F34030000009F3901079F09020000',
        CUSTOMER_REF1: '5941945',
        RESPONSE_LANGUAGE: 'EN',
        CONTROL_NUMBER: '3814--a51411e042b5404394c9',
        ZIP_CODE: '37700',
        AGGREGATOR_ID: '3814',
        AMOUNT: '1650.00',
        TERMINAL_COUNTRY: 'MX',
        ENTRY_MODE: 'CONTACTLESSCHIP',
        USER: 'OliPayTrans',
        BANORTE_URL: 'https://via.pagosbanorte.com/InterredesSeguro',
        TERMINAL_CITY: 'SAN MIGUEL AL',
        CUSTOMER_REF2: '80270239500018',
        MERCHANT_ID: '8016732',
        ESTADO_TERMINAL: 'GUA',
        CUSTOMER_REF5: 'OPENLINEA',
        MERCHANT_MCC: '7230',
        MODE: 'PRD',
        NUMERO_BIN: '410039',
      },
    },
    {
      kind: 'response',
      controlNumber: '3814--a51411e042b5404394c9',
      timestamp: '21/03/2026 15:26:41',
      ip: '104.210.219.110',
      fields: {
        AUTH_CODE: '65330D',
        CUST_RSP_DATE: '20260321 15:26:41.713',
        AUTH_RSP_DATE: '20260321 15:26:41.709',
        CARD_TYPE: 'CREDITO   ',
        TEXT: 'Approved',
        ISSUING_BANK: 'EXTRANJERA',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: '3814--a51411e042b5404394c9',
        CUST_REQ_DATE: '20260321 15:26:41.290',
        EMV_DATA: '91080008F7D100860000',
        REFERENCE: '821545843260',
        AUTH_RESULT: '00',
        CARD_BRAND: 'VISA      ',
        MERCHANT_ID: '8016732',
        AUTH_REQ_DATE: '20260321 15:26:41.331',
        NUMERO_BIN: '410039',
      },
    },
  ] as ServletBlock[],

  prosaBlocks: [
    {
      kind: 'request',
      timestamp: '21/03/2026 15:26:41',
      prosaInstance: 'PROSA1',
      authAddress: '/140.240.11.12:58714',
      sendIp: '/192.168.55.110:48714',
      contextHeader: 'PROSA',
      campos: {
        0: '0200', 3: '000000', 4: '000000165000', 7: '0321212641',
        11: '152641', 12: '152641', 13: '0321', 17: '0321', 18: '7230', 22: '071',
        32: '544550', 35: '410039******9531', 37: '821545843260',
        41: '80270239500018  ',
        43: 'OPLINEA*ESSENTIALMASSASAN MIGUEL ALGUAMX',
        48: '8016732            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: '    PRO100000000000',
        62: '37700     ',
        100: '000000000', 120: 'PORTAL ALLENDE 10            ',
        121: '      P0            ', 123: '                    ',
        124: '001001001', 125: '  INTRB24 1 ',
        126: '000000000000133                    000',
      },
    },
    {
      kind: 'response',
      timestamp: '21/03/2026 15:26:41',
      prosaInstance: 'PROSA1',
      authAddress: '/140.240.11.12:58714',
      campos: {
        0: '0210', 3: '000000', 4: '000000165000', 7: '0321212641',
        11: '152641', 12: '152641', 13: '0321', 17: '0321', 18: '7230', 22: '071',
        32: '544550', 35: '410039******9531', 37: '821545843260',
        38: '65330D', 39: '00',
        41: '80270239500018  ', 48: '8016732            00010001', 49: '484',
        60: 'B072AGRE-3600001', 61: 'VISAVISA00000      ',
        100: '0', 120: 'PORTAL ALLENDE 10            ',
        121: '      P0          F0', 123: '                    ',
        124: '001001001', 125: 'V INTRVISA1 ',
        126: '000000000000133                    000',
      },
    },
  ] as ProsaBlock[],

  vTransacciones: [
    {
      numero: '8016732', nombre: 'OPENLINEA ESSENTIALMASSA',
      referencia: '821545843260', numeroControl: '3814--a51411e042b5404394c9',
      tipoTrans: 'VTA', modo: 'PRD', monto: '1650.00',
      numeroTarjeta: '4100390000009531',
      fechaRecepCte: '2026-03-21 15:26:41', horaRecepCte: '15:26:41',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
  ] as VTransaccionRow[],

  afiliaciones: [
    {
      idAfiliacion: '8016732', nombreComercio: 'ESSENTIALMASSA',
      razonSocial: 'OPENLINEA ESSENTIALMASSA SA DE CV',
      esquema: 'ESQ_4_SIN_AGP', giro: 'Agregador',
      direccion: 'PORTAL ALLENDE 10', ciudad: 'SAN MIGUEL DE ALLENDE',
      estado: 'GUA', cp: '37700',
    },
  ] as AfiliacionRow[],
};
