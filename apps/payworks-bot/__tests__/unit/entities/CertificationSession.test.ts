import { CertificationSessionEntity } from '@/core/domain/entities/CertificationSession';
import { ValidationResult } from '@/core/domain/entities/ValidationResult';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { ValidationVerdict } from '@/core/domain/value-objects/ValidationVerdict';

function makeResult(verdict: ValidationVerdict): ValidationResult {
  return {
    transactionRef: `REF-${verdict}`,
    transactionType: TransactionType.AUTH,
    cardBrand: CardBrand.VISA,
    verdict,
    fieldResults: [],
  };
}

function makeSession(results: ValidationResult[]): CertificationSessionEntity {
  return new CertificationSessionEntity(
    'sess-1',
    'COMERCIO TEST',
    IntegrationType.ECOMMERCE_TRADICIONAL,
    'semi',
    results,
    new Date('2026-05-05T10:00:00Z'),
  );
}

describe('CertificationSessionEntity — gate P8 (carta solo si APROBADO)', () => {
  describe('getVerdict()', () => {
    it('PENDIENTE cuando la sesión no tiene resultados todavía', () => {
      const session = makeSession([]);
      expect(session.getVerdict()).toBe(ValidationVerdict.PENDIENTE);
    });

    it('APROBADO cuando todas las transacciones pasaron', () => {
      const session = makeSession([
        makeResult(ValidationVerdict.APROBADO),
        makeResult(ValidationVerdict.APROBADO),
      ]);
      expect(session.getVerdict()).toBe(ValidationVerdict.APROBADO);
    });

    it('RECHAZADO si al menos una transacción falló', () => {
      const session = makeSession([
        makeResult(ValidationVerdict.APROBADO),
        makeResult(ValidationVerdict.RECHAZADO),
      ]);
      expect(session.getVerdict()).toBe(ValidationVerdict.RECHAZADO);
    });

    it('RECHAZADO si todas fallaron', () => {
      const session = makeSession([
        makeResult(ValidationVerdict.RECHAZADO),
        makeResult(ValidationVerdict.RECHAZADO),
      ]);
      expect(session.getVerdict()).toBe(ValidationVerdict.RECHAZADO);
    });
  });

  describe('isFullyApproved() — condición canónica del gate del endpoint', () => {
    it('false para sesión vacía (no hay nada que aprobar)', () => {
      expect(makeSession([]).isFullyApproved()).toBe(false);
    });

    it('true cuando todas las transacciones pasaron', () => {
      const session = makeSession([
        makeResult(ValidationVerdict.APROBADO),
        makeResult(ValidationVerdict.APROBADO),
      ]);
      expect(session.isFullyApproved()).toBe(true);
    });

    it('false si al menos una falló', () => {
      const session = makeSession([
        makeResult(ValidationVerdict.APROBADO),
        makeResult(ValidationVerdict.RECHAZADO),
      ]);
      expect(session.isFullyApproved()).toBe(false);
    });
  });

  describe('Coherencia entre getVerdict() e isFullyApproved()', () => {
    it('isFullyApproved() === true ⟺ getVerdict() === APROBADO', () => {
      const cases: Array<{ results: ValidationResult[]; expectedApproved: boolean }> = [
        { results: [], expectedApproved: false },
        { results: [makeResult(ValidationVerdict.APROBADO)], expectedApproved: true },
        { results: [makeResult(ValidationVerdict.RECHAZADO)], expectedApproved: false },
        {
          results: [makeResult(ValidationVerdict.APROBADO), makeResult(ValidationVerdict.APROBADO)],
          expectedApproved: true,
        },
        {
          results: [makeResult(ValidationVerdict.APROBADO), makeResult(ValidationVerdict.RECHAZADO)],
          expectedApproved: false,
        },
      ];
      for (const { results, expectedApproved } of cases) {
        const session = makeSession(results);
        expect(session.isFullyApproved()).toBe(expectedApproved);
        expect(session.getVerdict() === ValidationVerdict.APROBADO).toBe(expectedApproved);
      }
    });
  });
});
