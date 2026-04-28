import { toCertificationResponse } from '@/shared/mappers/certificationResponseMapper';
import { CertificationSessionEntity } from '@/core/domain/entities/CertificationSession';
import { ValidationResultEntity } from '@/core/domain/entities/ValidationResult';
import { ValidationVerdict } from '@/core/domain/value-objects/ValidationVerdict';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';

function buildSession(): CertificationSessionEntity {
  const result = new ValidationResultEntity(
    'REF-001',
    TransactionType.AUTH,
    CardBrand.VISA,
    [
      {
        field: 'CARD_NUMBER',
        manualName: 'CARD_NUMBER',
        displayName: 'Numero de Tarjeta',
        rule: 'R',
        found: true,
        value: '510125******2396',
        verdict: 'PASS',
        source: 'SERVLET',
        layer: ValidationLayer.SERVLET,
      },
      {
        field: 'CVV2',
        rule: 'R',
        found: false,
        value: undefined,
        verdict: 'FAIL',
        source: 'SERVLET',
        layer: ValidationLayer.SERVLET,
      },
      {
        field: 'ENTRY_MODE',
        rule: 'R',
        found: true,
        value: 'CONTACTLESSCHIP',
        verdict: 'FAIL',
        failReason: 'invalid_value',
        failDetail: 'Valor "CONTACTLESSCHIP" no permitido. Valores válidos: MANUAL, CHIP, CONTACTLESS',
        source: 'SERVLET',
        layer: ValidationLayer.SERVLET,
      },
    ],
  );

  return new CertificationSessionEntity(
    'cert-1',
    'Liverpool',
    IntegrationType.ECOMMERCE_TRADICIONAL,
    'semi',
    [result],
    new Date('2026-04-27T12:00:00.000Z'),
  );
}

describe('toCertificationResponse', () => {
  it('serializa los campos top-level usando los metodos de la entity', () => {
    const session = buildSession();
    const dto = toCertificationResponse(session);

    expect(dto.id).toBe('cert-1');
    expect(dto.merchantName).toBe('Liverpool');
    expect(dto.integrationType).toBe(IntegrationType.ECOMMERCE_TRADICIONAL);
    expect(dto.operationMode).toBe('semi');
    expect(dto.totalTransactions).toBe(1);
    expect(dto.createdAt).toBe('2026-04-27T12:00:00.000Z');
  });

  it('marca verdict RECHAZADO cuando algun field falla', () => {
    const session = buildSession();
    const dto = toCertificationResponse(session);
    expect(dto.verdict).toBe(ValidationVerdict.RECHAZADO);
    expect(dto.rejectedCount).toBe(1);
    expect(dto.approvedCount).toBe(0);
  });

  it('serializa cada field result preservando layer y source', () => {
    const session = buildSession();
    const dto = toCertificationResponse(session);
    const fields = dto.results[0].fieldResults;

    expect(fields).toHaveLength(3);
    expect(fields[0]).toMatchObject({
      field: 'CARD_NUMBER',
      manualName: 'CARD_NUMBER',
      displayName: 'Numero de Tarjeta',
      verdict: 'PASS',
      layer: ValidationLayer.SERVLET,
      source: 'SERVLET',
    });
    expect(fields[1]).toMatchObject({
      field: 'CVV2',
      verdict: 'FAIL',
      found: false,
    });
  });

  it('expone passedCount/failedCount/totalValidated calculados por la entity', () => {
    const session = buildSession();
    const dto = toCertificationResponse(session);
    const result = dto.results[0];

    expect(result.passedCount).toBe(1);
    expect(result.failedCount).toBe(2);
    expect(result.totalValidated).toBe(3);
  });

  it('propaga failReason y failDetail desde el dominio al DTO', () => {
    const session = buildSession();
    const dto = toCertificationResponse(session);
    const fields = dto.results[0].fieldResults;

    // Campo missing — sin failDetail explicito
    expect(fields[1]).toMatchObject({
      field: 'CVV2',
      verdict: 'FAIL',
      found: false,
    });
    expect(fields[1].failDetail).toBeUndefined();

    // Campo con valor invalido — domain provee failDetail rico
    expect(fields[2]).toMatchObject({
      field: 'ENTRY_MODE',
      verdict: 'FAIL',
      found: true,
      failReason: 'invalid_value',
      failDetail: expect.stringContaining('CONTACTLESSCHIP'),
    });
  });
});
