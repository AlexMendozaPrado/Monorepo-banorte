import { MandatoryFieldsConfig } from '@/infrastructure/mandatory-rules/MandatoryFieldsConfig';
import { ValidateTransactionFieldsUseCase } from '@/core/application/use-cases/ValidateTransactionFieldsUseCase';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { An5822FlowDetector } from '@/core/domain/services/An5822FlowDetector';
import { An5822Validator } from '@/core/domain/services/An5822Validator';
import { AnexoDValidator } from '@/core/domain/services/AnexoDValidator';
import { LayerAn5822Config } from '@/core/domain/value-objects/An5822Flow';
import layerAn5822 from '@/config/mandatory-fields/layer-an5822.json';

// Regression suite (Fase 7). Cada caso reproduce un escenario operativo
// real identificado en la revisión Banorte y bloquea que una regresión
// futura vuelva a romperlo. Sintéticos — no leen logs de disco para
// evitar incluir PII en el repo.

const config = new MandatoryFieldsConfig();
const an5822Config = layerAn5822 as unknown as LayerAn5822Config;
const useCase = new ValidateTransactionFieldsUseCase(
  config,
  new An5822FlowDetector(),
  new An5822Validator(an5822Config),
  new AnexoDValidator(),
);

function buildServlet(fields: Array<[string, string]>): ServletLogEntity {
  return new ServletLogEntity(
    new Date('2026-04-22T12:00:00Z'),
    'REQUEST',
    '1.2.3.4',
    new Map(fields),
  );
}

function buildServletResponse(): ServletLogEntity {
  return new ServletLogEntity(
    new Date('2026-04-22T12:00:01Z'),
    'RESPONSE',
    '1.2.3.4',
    new Map([['CODIGO_PAYW', '000']]),
  );
}

describe('Regression: MUEVE CIUDAD (afil. 9885405) — VCE + 3DS', () => {
  // Bug #1.3 histórico: regex forbidden_chars incluía letras `e, u, o`
  // literales y rechazaba nombres válidos como "MUEVE CIUDAD". Commit
  // `6ee6b86` lo alineó al manual (vocales acentuadas + Ñ + signos).

  it('MERCHANT_NAME="MUEVE CIUDAD" pasa forbidden_chars', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-MC-001',
      servletRequest: buildServlet([
        ['merchantId', '9885405'],
        ['merchantName', 'MUEVE CIUDAD'],
        ['merchantCity', 'GUADALAJARA'],
      ]),
      servletResponse: buildServletResponse(),
    });
    const charFails = result.fieldResults.filter(
      f => f.failReason === 'forbidden_chars',
    );
    expect(charFails).toHaveLength(0);
  });

  it('merchantCity admite >13 chars (bug VCE v1.0 corregido a 40)', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-MC-002',
      servletRequest: buildServlet([
        ['merchantId', '9885405'],
        ['merchantCity', 'SAN PEDRO GARZA GARCIA'], // 22 chars
      ]),
      servletResponse: buildServletResponse(),
    });
    const lenFails = result.fieldResults.filter(
      f => f.field === 'merchantCity' && f.failReason === 'exceeds_max_length',
    );
    expect(lenFails).toHaveLength(0);
  });
});

describe('Regression: DLOCAL (afil. 9342244) — Agregador Esq.4 con AGP', () => {
  // Comercio real Agregadores CE. SUB_MERCHANT con formato 7*14
  // (§Anexo D). Con AGP implica que también manda MERCHANT_MCC,
  // DOMICILIO_COMERCIO, CODIGO_POSTAL.

  it('SUB_MERCHANT "DLOCAL *ECOFLOWCOM   " (7*14) pasa Anexo D', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-DLOCAL-001',
      servletRequest: buildServlet([
        ['MERCHANT_ID', '9342244'],
        ['SUB_MERCHANT', 'DLOCALM*ECOFLOWCOMSRL0'],
        ['ID_AGREGADOR', 'DLOCAL'],
        ['CIUDAD_TERMINAL', 'CDMX'],
        ['CUSTOMER_REF5', 'DLOCAL'],
      ]),
      servletResponse: buildServletResponse(),
    });
    const anexoDFails = result.fieldResults.filter(
      f => f.failReason?.startsWith('anexo_d_'),
    );
    expect(anexoDFails).toHaveLength(0);
  });

  it('ID_AGREGADOR con caracter inválido (Ñ) falla Anexo D', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-DLOCAL-002',
      servletRequest: buildServlet([
        ['MERCHANT_ID', '9342244'],
        ['SUB_MERCHANT', 'DLOCALM*ECOFLOWCOMSRL0'],
        ['ID_AGREGADOR', 'AÑOS'], // inválido
      ]),
      servletResponse: buildServletResponse(),
    });
    expect(
      result.fieldResults.find(f => f.field === 'ID_AGREGADOR' && f.failReason === 'anexo_d_chars'),
    ).toBeDefined();
  });
});

describe('Regression: OPENLINEA (afil. 8016732) — Agregador Esq.4 sin AGP', () => {
  // ENTRY_MODE debe ser MANUAL (commerce e-commerce puro). Si el log
  // trae "CHIP" o cualquier otro, la validación v5 debe capturarlo.

  it('ENTRY_MODE="MANUAL" con SUB_MERCHANT válido pasa', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-OPLINEA-001',
      servletRequest: buildServlet([
        ['MERCHANT_ID', '8016732'],
        ['SUB_MERCHANT', 'OPLINEA*ESSENTIALMASSA'],
        ['ID_AGREGADOR', 'OPENLINEA'],
        ['ENTRY_MODE', 'MANUAL'],
      ]),
      servletResponse: buildServletResponse(),
    });
    const entryFails = result.fieldResults.filter(
      f => f.field === 'ENTRY_MODE' && f.verdict === 'FAIL',
    );
    expect(entryFails).toHaveLength(0);
  });
});

describe('Regression: ZIGU (afil. 9607773) — Esq.1 + Gateway 7118 MC', () => {
  // Mandato Gateway 7118: ID_GATEWAY aplica solo a MasterCard.
  // En VISA/AMEX debe estar prohibido (PROHIBITED); si aparece, FAIL.

  it('ID_GATEWAY presente en MC pasa', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.MASTERCARD,
      transactionRef: 'REF-ZIGU-MC',
      servletRequest: buildServlet([
        ['MERCHANT_ID', '9607773'],
        ['SUB_MERCHANT', 'ZIGUTEC*TECHNOLOGIESMX'],
        ['ID_AGREGADOR', 'ZIGU'],
        ['ID_GATEWAY', '71180000001'],
        ['PAYMENT_IND', 'U'],
        ['AMOUNT_TYPE', 'V'],
        ['PAYMENT_INFO', '0'],
      ]),
      servletResponse: buildServletResponse(),
    });
    const gatewayFails = result.fieldResults.filter(
      f => f.field === 'ID_GATEWAY' && f.verdict === 'FAIL',
    );
    expect(gatewayFails).toHaveLength(0);
  });

  it('ID_GATEWAY presente en VISA falla por PROHIBITED', () => {
    const result = useCase.execute({
      integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: 'REF-ZIGU-VISA',
      servletRequest: buildServlet([
        ['MERCHANT_ID', '9607773'],
        ['SUB_MERCHANT', 'ZIGUTEC*TECHNOLOGIESMX'],
        ['ID_AGREGADOR', 'ZIGU'],
        ['ID_GATEWAY', '71180000001'],
      ]),
      servletResponse: buildServletResponse(),
    });
    const gatewayFail = result.fieldResults.find(
      f => f.field === 'ID_GATEWAY' && f.failReason === 'prohibited',
    );
    expect(gatewayFail).toBeDefined();
    expect(gatewayFail?.verdict).toBe('FAIL');
  });
});

describe('Regression: smoke — todos los casos ejecutan sin crash', () => {
  // Suite global anti-regresión: la pipeline no debe lanzar excepciones
  // aún con inputs minimalistas.
  const minimalServlet = buildServlet([['MERCHANT_ID', '9607773']]);

  it.each([
    IntegrationType.ECOMMERCE_TRADICIONAL,
    IntegrationType.MOTO,
    IntegrationType.CARGOS_PERIODICOS_POST,
    IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
    IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
    IntegrationType.AGREGADORES_CARGOS_PERIODICOS,
    IntegrationType.API_PW2_SEGURO,
    IntegrationType.INTERREDES_REMOTO,
  ])('%s: produce un veredicto APROBADO o RECHAZADO', (product) => {
    const result = useCase.execute({
      integrationType: product,
      transactionType: TransactionType.AUTH,
      cardBrand: CardBrand.VISA,
      transactionRef: `SMOKE-${product}`,
      servletRequest: minimalServlet,
      servletResponse: buildServletResponse(),
    });
    expect(['APROBADO', 'RECHAZADO']).toContain(result.verdict);
    expect(result.fieldResults).toBeInstanceOf(Array);
  });
});
