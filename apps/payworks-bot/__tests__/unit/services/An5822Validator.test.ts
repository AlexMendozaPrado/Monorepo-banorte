import { An5822Validator } from '@/core/domain/services/An5822Validator';
import { An5822Flow, LayerAn5822Config } from '@/core/domain/value-objects/An5822Flow';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import layerAn5822 from '@/config/mandatory-fields/layer-an5822.json';

describe('An5822Validator', () => {
  const config = layerAn5822 as unknown as LayerAn5822Config;
  const validator = new An5822Validator(config);

  describe('Ecommerce Tradicional (PAYMENT_IND=U)', () => {
    it('firstCIT completo pasa (U / V / 0, sin COF)', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'V', PAYMENT_INFO: '0' },
      });
      expect(failures).toEqual([]);
    });

    it('rechaza PAYMENT_IND=8 (bug legacy que corrige la spec v5)', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: '8', AMOUNT_TYPE: 'V', PAYMENT_INFO: '0' },
      });
      expect(failures.find(f => f.field === 'PAYMENT_IND')).toBeDefined();
      expect(failures.find(f => f.field === 'PAYMENT_IND')?.reason).toBe('invalid_value');
    });

    it('subseqCIT requiere PAYMENT_INFO=3', () => {
      const okay = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.SUBSEQ_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'F', PAYMENT_INFO: '3' },
      });
      expect(okay).toEqual([]);

      const mismatch = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.SUBSEQ_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'F', PAYMENT_INFO: '0' },
      });
      expect(mismatch.find(f => f.field === 'PAYMENT_INFO')).toBeDefined();
    });

    it('subseqMIT requiere PAYMENT_INFO=2 y sin COF', () => {
      const okay = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.SUBSEQ_MIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'V', PAYMENT_INFO: '2' },
      });
      expect(okay).toEqual([]);
    });

    it('rechaza COF presente (no aplica en Ecommerce)', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.SUBSEQ_MIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'V', PAYMENT_INFO: '2', COF: '4' },
      });
      const cof = failures.find(f => f.field === 'COF');
      expect(cof).toBeDefined();
      expect(cof?.reason).toBe('prohibited');
    });

    it('AMOUNT_TYPE fuera del set [V,F] falla', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'X', PAYMENT_INFO: '0' },
      });
      expect(failures.find(f => f.field === 'AMOUNT_TYPE')?.reason).toBe('invalid_value');
    });
  });

  describe('Cargos Periódicos Post (PAYMENT_IND=R, sí hay COF)', () => {
    it('firstCIT requiere PAYMENT_IND=R', () => {
      const bad = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'F', PAYMENT_INFO: '0' },
      });
      expect(bad.find(f => f.field === 'PAYMENT_IND')).toBeDefined();
    });

    it('firstCIT con R pasa', () => {
      const okay = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'F', PAYMENT_INFO: '0' },
      });
      expect(okay).toEqual([]);
    });

    it('subseqMIT exige COF=4', () => {
      const missing = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.SUBSEQ_MIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'F', PAYMENT_INFO: '2' },
      });
      expect(missing.find(f => f.field === 'COF')?.reason).toBe('missing');

      const wrong = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.SUBSEQ_MIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'F', PAYMENT_INFO: '2', COF: '1' },
      });
      expect(wrong.find(f => f.field === 'COF')?.reason).toBe('invalid_value');

      const okay = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.SUBSEQ_MIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'F', PAYMENT_INFO: '2', COF: '4' },
      });
      expect(okay).toEqual([]);
    });

    it('subseqCIT no está mapeado para Cargos Periódicos → reporta inconsistencia', () => {
      const failures = validator.validate({
        product: IntegrationType.CARGOS_PERIODICOS_POST,
        flow: An5822Flow.SUBSEQ_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'F', PAYMENT_INFO: '3' },
      });
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].field).toBe('an5822');
    });
  });

  describe('no-op', () => {
    it('VISA no genera ningún resultado', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.VISA,
        fields: { PAYMENT_IND: 'X' },
      });
      expect(failures).toEqual([]);
    });

    it('flow NOT_APPLICABLE no genera ningún resultado', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.NOT_APPLICABLE,
        brand: CardBrand.MASTERCARD,
        fields: {},
      });
      expect(failures).toEqual([]);
    });
  });

  describe('Hint cross-producto (E.1 — feedback equipo abr-2026)', () => {
    it('IND_PAGO=R en Ecommerce Tradicional incluye hint "aplica a Cargos Periódicos"', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'R', AMOUNT_TYPE: 'V', PAYMENT_INFO: '0' },
      });
      const indPago = failures.find(f => f.field === 'PAYMENT_IND');
      expect(indPago?.reason).toBe('invalid_value');
      expect(indPago?.detail).toContain('Hint');
      expect(indPago?.detail).toContain('CARGOS_PERIODICOS_POST');
      expect(indPago?.detail).toContain('AGREGADORES_CARGOS_PERIODICOS');
    });

    it('PAYMENT_INFO=2 en firstCIT incluye hint del producto/flujo donde sí aplica', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'U', AMOUNT_TYPE: 'V', PAYMENT_INFO: '2' },
      });
      const info = failures.find(f => f.field === 'PAYMENT_INFO');
      expect(info?.detail).toContain('Hint');
      // PAYMENT_INFO=2 aplica a varios productos en subseqMIT
      expect(info?.detail).toMatch(/aplica a [A-Z_, ]+/);
    });

    it('valor totalmente inválido (PAYMENT_IND=Z) no genera hint', () => {
      const failures = validator.validate({
        product: IntegrationType.ECOMMERCE_TRADICIONAL,
        flow: An5822Flow.FIRST_CIT,
        brand: CardBrand.MASTERCARD,
        fields: { PAYMENT_IND: 'Z', AMOUNT_TYPE: 'V', PAYMENT_INFO: '0' },
      });
      const indPago = failures.find(f => f.field === 'PAYMENT_IND');
      expect(indPago?.detail).not.toContain('Hint');
    });
  });
});
