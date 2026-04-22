import { ValidateTransactionFieldsUseCase } from '@/core/application/use-cases/ValidateTransactionFieldsUseCase';
import { MandatoryFieldsConfig } from '@/infrastructure/mandatory-rules/MandatoryFieldsConfig';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { ThreeDSLogEntity } from '@/core/domain/entities/ThreeDSLog';
import { CybersourceLogEntity } from '@/core/domain/entities/CybersourceLog';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import { MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import layer3ds from '@/config/mandatory-fields/layer-3ds.json';
import layerCybersource from '@/config/mandatory-fields/layer-cybersource.json';

describe('ValidateTransactionFieldsUseCase multi-layer', () => {
  const config = new MandatoryFieldsConfig();
  const useCase = new ValidateTransactionFieldsUseCase(config);

  const threeDSMatrix = layer3ds as unknown as MandatoryFieldsMatrix;
  const cybersourceMatrix = layerCybersource as unknown as MandatoryFieldsMatrix;

  function makeServletRequest(overrides: Record<string, string> = {}): ServletLogEntity {
    const fields = new Map<string, string>([
      ['MERCHANT_ID', '9607773'],
      ['USER', 'payworks_user'],
      ['PASSWORD', '****'],
      ['TERMINAL_ID', '12345678'],
      ['CMD_TRANS', 'VENTA'],
      ['AMOUNT', '1500.00'],
      ['MODE', 'PRD'],
      ['CARD_NUMBER', '411111******1111'],
      ['EXP_DATE', '1227'],
      ['ENTRY_MODE', 'MANUAL'],
      ['RESPONSE_LANGUAGE', 'ES'],
      ...Object.entries(overrides),
    ]);
    return new ServletLogEntity(new Date('2026-03-11T18:02:25Z'), 'REQUEST', '1.2.3.4', fields);
  }

  function makeServletResponse(): ServletLogEntity {
    return new ServletLogEntity(
      new Date('2026-03-11T18:02:26Z'),
      'RESPONSE',
      '1.2.3.4',
      new Map([['CODIGO_PAYW', '000']]),
    );
  }

  it('tags servlet field results with ValidationLayer.SERVLET', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-001',
      servletRequest: makeServletRequest(),
      servletResponse: makeServletResponse(),
    });

    expect(result.fieldResults.every(f => f.layer === ValidationLayer.SERVLET)).toBe(true);
    const merchantIdField = result.fieldResults.find(f => f.field === 'MERCHANT_ID');
    expect(merchantIdField?.verdict).toBe('PASS');
    expect(merchantIdField?.manualName).toBe('ID_AFILIACION');
    expect(merchantIdField?.displayName).toBe('ID Afiliación');
  });

  it('adds 3DS layer results when a 3DS log entity is provided', () => {
    const threeDSLog = new ThreeDSLogEntity(
      new Date(),
      'REF-001',
      new Map([
        ['Card', '411111******1111'],
        ['Total', '1500.00'],
        ['CardType', 'VISA'],
        ['MerchantId', '9607773'],
        ['MerchantName', 'MUEVE CIUDAD'],
        ['MerchantCity', 'GDL'],
        ['Cert3D', '03'],
        ['ECI', '05'],
        ['XID', 'A'.repeat(40)],
        ['CAVV', 'B'.repeat(40)],
        ['Version3D', '2'],
      ]),
    );

    const result = useCase.execute({
      integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-001',
      servletRequest: makeServletRequest(),
      servletResponse: makeServletResponse(),
      threeDSLog,
      threeDSMatrix,
    });

    const threeDSResults = result.fieldResults.filter(f => f.layer === ValidationLayer.THREEDS);
    expect(threeDSResults.length).toBeGreaterThan(0);
    expect(threeDSResults.every(f => f.source === 'THREEDS')).toBe(true);
  });

  it('adds Cybersource layer results when a CS log entity is provided', () => {
    const csLog = new CybersourceLogEntity(
      new Date(),
      'REQUEST',
      new Map([
        ['BillTo_firstName', 'Juan'],
        ['BillTo_lastName', 'Pérez'],
        ['BillTo_street', 'Reforma'],
        ['BillTo_streetNumber', '123'],
        ['BillTo_city', 'CDMX'],
        ['BillTo_state', 'CDMX'],
        ['BillTo_country', 'MX'],
        ['BillTo_postalCode', '06600'],
        ['BillTo_email', 'j@example.com'],
        ['BillTo_phoneNumber', '5555555555'],
        ['Card_accountNumber', '4111111111111111'],
        ['Card_cardType', '001'],
        ['Card_expirationMonth', '12'],
        ['Card_expirationYear', '2027'],
        ['DeviceFingerprintID', 'dfp'],
        ['Name', 'user'],
        ['Password', 'x'],
        ['MerchantNumber', '9607773'],
        ['TerminalId', '1'],
        ['OrderId', 'REF-001'],
      ]),
    );

    const result = useCase.execute({
      integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-001',
      servletRequest: makeServletRequest(),
      servletResponse: makeServletResponse(),
      cybersourceLog: csLog,
      cybersourceMatrix,
    });

    const csResults = result.fieldResults.filter(f => f.layer === ValidationLayer.CYBERSOURCE);
    expect(csResults.length).toBeGreaterThan(0);
    expect(csResults.every(f => f.source === 'CYBERSOURCE')).toBe(true);
  });

  it('does not add layer results when matrix is missing', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-001',
      servletRequest: makeServletRequest(),
      servletResponse: makeServletResponse(),
      // No threeDSMatrix nor cybersourceMatrix provided
    });

    expect(result.fieldResults.every(f => f.layer === ValidationLayer.SERVLET)).toBe(true);
  });
});
