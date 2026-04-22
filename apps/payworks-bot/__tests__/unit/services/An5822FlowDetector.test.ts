import { An5822FlowDetector } from '@/core/domain/services/An5822FlowDetector';
import { An5822Flow } from '@/core/domain/value-objects/An5822Flow';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';

describe('An5822FlowDetector', () => {
  const detector = new An5822FlowDetector();

  const baseMcEcommerce = {
    brand: CardBrand.MASTERCARD,
    transactionType: TransactionType.AUTH,
    product: IntegrationType.ECOMMERCE_TRADICIONAL,
  };

  describe('ámbito del mandato', () => {
    it('VISA retorna NOT_APPLICABLE sin ruido', () => {
      const r = detector.detect({
        declaredFlow: An5822Flow.FIRST_CIT,
        observedValues: { PAYMENT_INFO: '0' },
        brand: CardBrand.VISA,
        transactionType: TransactionType.AUTH,
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
      expect(r.warnings).toHaveLength(0);
      expect(r.failures).toHaveLength(0);
    });

    it('VOID en MC retorna NOT_APPLICABLE', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        transactionType: TransactionType.VOID,
        declaredFlow: null,
        observedValues: {},
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
    });

    it('REVERSAL en MC retorna NOT_APPLICABLE', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        transactionType: TransactionType.REVERSAL,
        declaredFlow: null,
        observedValues: {},
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
    });

    it('API PW2 Seguro (Tarjeta Presente) retorna NOT_APPLICABLE aún en MC', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        product: IntegrationType.API_PW2_SEGURO,
        declaredFlow: An5822Flow.FIRST_CIT,
        observedValues: { PAYMENT_INFO: '0' },
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
    });

    it('Interredes Remoto retorna NOT_APPLICABLE aún en MC', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        product: IntegrationType.INTERREDES_REMOTO,
        declaredFlow: null,
        observedValues: { PAYMENT_INFO: '2' },
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
    });
  });

  describe('prioridad declaración > inferencia', () => {
    it('usa declaración cuando concuerda con observación', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: An5822Flow.FIRST_CIT,
        observedValues: { PAYMENT_INFO: '0' },
      });
      expect(r.flow).toBe(An5822Flow.FIRST_CIT);
      expect(r.warnings).toHaveLength(0);
      expect(r.failures).toHaveLength(0);
    });

    it('C10 falla cuando declaración contradice observación', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: An5822Flow.FIRST_CIT,
        observedValues: { PAYMENT_INFO: '2' },
      });
      expect(r.flow).toBe(An5822Flow.FIRST_CIT);
      expect(r.failures).toHaveLength(1);
      expect(r.failures[0]).toContain('C10');
      expect(r.failures[0]).toContain('subseqMIT');
    });

    it('declaración NOT_APPLICABLE se respeta', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: An5822Flow.NOT_APPLICABLE,
        observedValues: {},
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
    });
  });

  describe('inferencia por PAYMENT_INFO', () => {
    it.each([
      ['0', An5822Flow.FIRST_CIT],
      ['3', An5822Flow.SUBSEQ_CIT],
      ['2', An5822Flow.SUBSEQ_MIT],
    ])('PAYMENT_INFO=%s → %s', (info, flow) => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: null,
        observedValues: { PAYMENT_INFO: info },
      });
      expect(r.flow).toBe(flow);
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0]).toContain('flujo_an5822');
    });

    it('PAYMENT_INFO desconocido → NOT_APPLICABLE con warning', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: null,
        observedValues: { PAYMENT_INFO: '9' },
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
      expect(r.warnings).toHaveLength(1);
    });

    it('sin observación ni declaración → NOT_APPLICABLE con warning', () => {
      const r = detector.detect({
        ...baseMcEcommerce,
        declaredFlow: null,
        observedValues: {},
      });
      expect(r.flow).toBe(An5822Flow.NOT_APPLICABLE);
      expect(r.warnings).toHaveLength(1);
    });
  });
});
