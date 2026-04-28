import { TransactionType } from '../../src/core/domain/value-objects/TransactionType';
import { CardBrand } from '../../src/core/domain/value-objects/CardBrand';
import { IntegrationType } from '../../src/core/domain/value-objects/IntegrationType';
import { ServletBlock } from '../builders/servletLogBuilder';
import { ProsaBlock } from '../builders/prosaLogBuilder';
import { ThreeDsBlock } from '../builders/threeDsLogBuilder';
import { CybersourceBlock } from '../builders/cybersourceLogBuilder';
import { MatrixRow } from '../builders/matrixBuilder';
import { VTransaccionRow, AfiliacionRow } from '../builders/csvBuilder';

/**
 * Bundle 04 — ECOMMERCE TRADICIONAL · 3DS + CYBERSOURCE
 *
 * Fuentes:
 *   - LOG 3D SECURE.txt        (folio 9905419_140426_1776156193609, MerchantId 9905419, monto 4156)
 *   - LOG CYBERSOURCE.txt      (OrderId F465EEC19C1941EBB114BB7981CB91, MerchantID banorteixe, monto 165 USD)
 *
 * Los 2 logs son de transacciones distintas en el dump original. Para
 * armar un bundle coherente con el endpoint, usamos la transaccion 3DS
 * como tx principal y construimos:
 *   - servlet+prosa minimos coherentes con la matriz (campos requeridos
 *     basicos del producto + REFERENCE/CONTROL_NUMBER que enlazan los logs)
 *   - cybersource opcional (incluido para activar la pill de capa)
 *
 * Esta es la unica licencia que tomamos en este PR: servlet+prosa minimos
 * para el bundle 4. Todo lo demas viene literal de los logs del equipo.
 */

const FOLIO = '9905419_140426_1776156193609';
const REFERENCE = '321000000001';
const CONTROL_NUMBER = '99054191404261776156193609';
const CYBER_ORDER_ID = 'F465EEC19C1941EBB114BB7981CB91';

export const ecommerce3dsCsScenario = {
  name: '04-ecommerce-3ds-cybersource',
  product: IntegrationType.ECOMMERCE_TRADICIONAL,
  merchantName: 'BOLETERA RED MUSIC',

  matrix: [
    {
      referencia: REFERENCE,
      numeroControl: CONTROL_NUMBER,
      tipoTransaccion: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      monto: 4156.00,
      fecha: '14/04/2026',
      hora: '02:43:13',
    },
  ] as MatrixRow[],

  servletBlocks: [
    {
      kind: 'request',
      controlNumber: CONTROL_NUMBER,
      timestamp: '14/04/2026 02:43:13',
      ip: '99.80.99.245',
      contextHeader: 'VENTA LOG DE ENTRADA',
      fields: {
        CARD_NUMBER: '418914******5560',
        CMD_TRANS: 'AUTH',
        MERCHANT_ID: '9905419',
        USER: 'a9905419',
        CONTROL_NUMBER: CONTROL_NUMBER,
        TERMINAL_ID: '99054191',
        AMOUNT: '4156.00',
        ENTRY_MODE: 'MANUAL',
        MODE: 'PRD',
        ID_CYBERSOURCE: CYBER_ORDER_ID,
        TERMINAL_COUNTRY: 'MX',
      },
    },
    {
      kind: 'response',
      controlNumber: CONTROL_NUMBER,
      timestamp: '14/04/2026 02:43:49',
      ip: '99.80.99.245',
      contextHeader: 'VENTA LOG DE SALIDA',
      fields: {
        AUTH_CODE: '654001',
        CUST_RSP_DATE: '20260414 02:43:49.500',
        AUTH_RSP_DATE: '20260414 02:43:49.470',
        CARD_TYPE: 'CREDITO   ',
        TEXT: 'Approved',
        ISSUING_BANK: 'EXTRANJERA',
        PAYW_RESULT: 'A',
        CONTROL_NUMBER: CONTROL_NUMBER,
        CUST_REQ_DATE: '20260414 02:43:13.100',
        REFERENCE: REFERENCE,
        AUTH_RESULT: '00',
        CARD_BRAND: 'VISA      ',
        MERCHANT_ID: '9905419',
        AUTH_REQ_DATE: '20260414 02:43:13.130',
      },
    },
  ] as ServletBlock[],

  prosaBlocks: [
    {
      kind: 'request',
      timestamp: '14/04/2026 02:43:13',
      prosaInstance: 'PROSA1',
      authAddress: '/140.240.11.78:58701',
      sendIp: '/192.168.55.50:48701',
      contextHeader: 'PROSA',
      campos: {
        0: '0200', 3: '000000', 4: '000000415600', 7: '0414084313',
        11: '024313', 12: '024313', 13: '0414', 17: '0414', 18: '5964', 22: '010',
        32: '544550', 35: '418914******5560', 37: REFERENCE,
        41: '99054191        ',
        43: 'BOLETERA RED MUSIC    CIUDAD DE MEXDF MX',
        49: '484',
      },
    },
    {
      kind: 'response',
      timestamp: '14/04/2026 02:43:49',
      prosaInstance: 'PROSA1',
      authAddress: '/140.240.11.78:58701',
      campos: {
        0: '0210', 3: '000000', 4: '000000415600', 7: '0414084349',
        11: '024313', 12: '024313', 13: '0414', 17: '0414', 18: '5964', 22: '010',
        32: '544550', 35: '418914******5560', 37: REFERENCE,
        38: '654001', 39: '00',
        41: '99054191        ', 49: '484',
      },
    },
  ] as ProsaBlock[],

  threedsBlocks: [
    {
      kind: 'request',
      timestamp: '2026/04/14 02:43:13',
      folio: FOLIO,
      fields: {
        MerchantId: '9905419',
        MerchantName: 'BOLETERA RED MUSIC',
        MerchantCity: 'MEXICO',
        Card: '41891431******56',
        CardType: 'VISA',
        Total: '4156',
        Cert3D: '03',
        ForwardPath: 'https://arjona.funticket.mx/onsale/en/payCompleted?localizador=J3034L2&idEmpresaFormaPago=112',
        Reference3D: REFERENCE,
        Version3D: '2',
      },
    },
    {
      kind: 'response',
      timestamp: '2026/04/14 02:43:49',
      folio: FOLIO,
      fields: {
        Status: '200',
        CardType: 'VISA',
        Total: '4156',
        Reference3D: REFERENCE,
        ECI: '05',
        XID: '0005010469201900000657704841047500000000',
        CAVV: '0005010469201900000657704841047500000000',
      },
    },
  ] as ThreeDsBlock[],

  cybersourceBlocks: [
    {
      kind: 'request',
      timestamp: '14/04/2026 02:43',
      fields: {
        BillTo_city: 'Imperial Beach',
        BillTo_country: 'US',
        BillTo_email: 'MAREACORP@GMAIL.COM',
        BillTo_firstName: 'RAUL ROBERTO',
        BillTo_ipAddress: '68.7.137.72',
        BillTo_lastName: 'FARFAN',
        BillTo_phoneNumber: '16199541338',
        BillTo_postalCode: '91932',
        BillTo_state: 'CA',
        BillTo_street: 'Imperial Beach Boulevard',
        BillTo_streetNumber: '1087',
        Card_cardType: '001',
        Comments: 'Grupo Aries',
        DeviceFingerprintID: CYBER_ORDER_ID,
        MerchantID: 'banorteixe',
        MerchantNumber: '8248847',
        MerchantReferenceCode: CYBER_ORDER_ID,
        Mode: 'PRD',
        Name: 'a8248847',
        OrderId: CYBER_ORDER_ID,
        PurchaseTotals_currency: 'USD',
        PurchaseTotals_grandTotalAmount: '165',
        Review: 'Secure3D',
        TerminalId: '82488471',
      },
    },
    {
      kind: 'response',
      timestamp: '14/04/2026 02:43',
      fields: {
        decision: 'ACCEPT',
        requestID: '7761093337886442003282',
        reasonCode: '100',
        OrderId: CYBER_ORDER_ID,
        afsReply_afsResult: '1',
        Bnte_code: '00',
      },
    },
  ] as CybersourceBlock[],

  vTransacciones: [
    {
      numero: '9905419', nombre: 'BOLETERA RED MUSIC',
      referencia: REFERENCE, numeroControl: CONTROL_NUMBER,
      tipoTrans: 'VTA', modo: 'PRD', monto: '4156.00',
      numeroTarjeta: '4189143100005560',
      fechaRecepCte: '2026-04-14 02:43:13', horaRecepCte: '02:43:13',
      codResultAut: '00', textoAprobacion: 'Approved',
    },
  ] as VTransaccionRow[],

  afiliaciones: [
    {
      idAfiliacion: '9905419', nombreComercio: 'BOLETERA RED MUSIC',
      razonSocial: 'BOLETERA RED MUSIC SA DE CV',
      esquema: 'ESQ_1', giro: 'Boletera',
      ciudad: 'MEXICO', estado: 'CDMX',
    },
  ] as AfiliacionRow[],
};
