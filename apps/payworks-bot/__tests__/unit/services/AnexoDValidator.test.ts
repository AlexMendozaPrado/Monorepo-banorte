import { AnexoDValidator } from '@/core/domain/services/AnexoDValidator';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';

describe('AnexoDValidator', () => {
  const validator = new AnexoDValidator();

  describe('solo aplica a productos agregadores', () => {
    it.each([
      IntegrationType.ECOMMERCE_TRADICIONAL,
      IntegrationType.MOTO,
      IntegrationType.CARGOS_PERIODICOS_POST,
      IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
      IntegrationType.API_PW2_SEGURO,
      IntegrationType.INTERREDES_REMOTO,
    ])('%s no genera fallas aunque los campos tengan basura', (product) => {
      const failures = validator.validate({
        product,
        fields: { SUB_MERCHANT: 'bad!!!', CIUDAD_TERMINAL: 'Ñ año' },
      });
      expect(failures).toEqual([]);
    });

    it.each([
      IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
      IntegrationType.AGREGADORES_CARGOS_PERIODICOS,
    ])('%s sí aplica', (product) => {
      const failures = validator.validate({
        product,
        fields: { CIUDAD_TERMINAL: ' MONTERREY' },
      });
      expect(failures.length).toBeGreaterThan(0);
    });
  });

  describe('SUB_MERCHANT formato 7*14', () => {
    const product = IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO;

    it('acepta "OPLINEA*ESSENTIALMASSA" (7 + * + 14)', () => {
      const failures = validator.validate({
        product,
        fields: { SUB_MERCHANT: 'OPLINEA*ESSENTIALMASSA' },
      });
      expect(failures.filter(f => f.field === 'SUB_MERCHANT')).toHaveLength(0);
    });

    it('rechaza formato corto "ABCDE*FGH"', () => {
      const failures = validator.validate({
        product,
        fields: { SUB_MERCHANT: 'ABCDE*FGH' },
      });
      const f = failures.find(x => x.field === 'SUB_MERCHANT');
      expect(f?.reason).toBe('anexo_d_format');
      expect(f?.detail).toContain('7*14');
    });

    it('rechaza sin separador', () => {
      const failures = validator.validate({
        product,
        fields: { SUB_MERCHANT: 'OPLINEAESSENTIALMASSA123' },
      });
      expect(failures.find(f => f.field === 'SUB_MERCHANT')?.reason).toBe('anexo_d_format');
    });

    it('vacío no se valida (no es presencia)', () => {
      const failures = validator.validate({
        product,
        fields: { SUB_MERCHANT: '' },
      });
      expect(failures.filter(f => f.field === 'SUB_MERCHANT')).toHaveLength(0);
    });
  });

  describe('campos genéricos (charset A-Z/0-9/&/espacio)', () => {
    const product = IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO;

    it.each([
      ['CIUDAD_TERMINAL', 'MONTERREY'],
      ['ESTADO_TERMINAL', 'NUEVO LEON'],
      ['PAIS_TERMINAL', 'MX'],
      ['ID_AGREGADOR', 'ABC123 & CO'],
    ])('acepta %s limpio: "%s"', (field, value) => {
      const failures = validator.validate({
        product,
        fields: { [field]: value },
      });
      expect(failures.filter(f => f.field === field)).toHaveLength(0);
    });

    it('rechaza doble espacio', () => {
      const failures = validator.validate({
        product,
        fields: { CIUDAD_TERMINAL: 'NUEVO  LEON' },
      });
      expect(failures.find(f => f.reason === 'anexo_d_double_space')).toBeDefined();
    });

    it('rechaza espacio al inicio', () => {
      const failures = validator.validate({
        product,
        fields: { CIUDAD_TERMINAL: ' MONTERREY' },
      });
      expect(failures.find(f => f.reason === 'anexo_d_leading_space')).toBeDefined();
    });

    it('rechaza acentos', () => {
      const failures = validator.validate({
        product,
        fields: { CIUDAD_TERMINAL: 'MÉRIDA' },
      });
      expect(failures.find(f => f.reason === 'anexo_d_chars')).toBeDefined();
    });

    it('rechaza Ñ', () => {
      const failures = validator.validate({
        product,
        fields: { ESTADO_TERMINAL: 'NUEVO LEÑO' },
      });
      expect(failures.find(f => f.reason === 'anexo_d_chars')).toBeDefined();
    });

    it('rechaza punto en campos genéricos (solo DOMICILIO lo permite)', () => {
      const failures = validator.validate({
        product,
        fields: { CIUDAD_TERMINAL: 'MTY.NL' },
      });
      expect(failures.find(f => f.reason === 'anexo_d_chars')).toBeDefined();
    });
  });

  describe('DOMICILIO_COMERCIO permite punto', () => {
    const product = IntegrationType.AGREGADORES_CARGOS_PERIODICOS;

    it('acepta "AV. REFORMA 123"', () => {
      const failures = validator.validate({
        product,
        fields: { DOMICILIO_COMERCIO: 'AV. REFORMA 123' },
      });
      expect(failures.filter(f => f.field === 'DOMICILIO_COMERCIO')).toHaveLength(0);
    });

    it('rechaza acentos también aquí', () => {
      const failures = validator.validate({
        product,
        fields: { DOMICILIO_COMERCIO: 'AV. JUÁREZ 45' },
      });
      expect(failures.find(f => f.field === 'DOMICILIO_COMERCIO' && f.reason === 'anexo_d_chars')).toBeDefined();
    });

    it('rechaza dobles espacios también aquí', () => {
      const failures = validator.validate({
        product,
        fields: { DOMICILIO_COMERCIO: 'AV  REFORMA' },
      });
      expect(failures.find(f => f.field === 'DOMICILIO_COMERCIO' && f.reason === 'anexo_d_double_space')).toBeDefined();
    });
  });

  describe('campos undefined/ausentes', () => {
    it('no genera fallas cuando todos los campos son undefined', () => {
      const failures = validator.validate({
        product: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
        fields: {},
      });
      expect(failures).toEqual([]);
    });
  });
});
