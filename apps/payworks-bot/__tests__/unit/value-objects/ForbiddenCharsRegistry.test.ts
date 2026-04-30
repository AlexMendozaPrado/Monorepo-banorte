import { getForbiddenCharsRegex } from '@/core/domain/value-objects/ForbiddenCharsRegistry';
import { FieldRequirementValueObject } from '@/core/domain/value-objects/FieldRequirement';

describe('ForbiddenCharsRegistry — 3 listas separadas (B4 feedback equipo abr-2026)', () => {
  describe('BASE — productos sin Ventana/3DS', () => {
    const re = getForbiddenCharsRegex('BASE');

    it('rechaza acentos y ñ', () => {
      expect(re.test('camión')).toBe(true);
      expect(re.test('Ñoño')).toBe(true);
      expect(re.test('hola á')).toBe(true);
    });

    it('rechaza símbolos prohibidos por manuales', () => {
      expect(re.test('"comilla"')).toBe(true);
      expect(re.test('a&b')).toBe(true);
      expect(re.test('a/b')).toBe(true);
    });

    it('acepta texto limpio', () => {
      expect(re.test('CAMION DE CARGA')).toBe(false);
      expect(re.test('PRODUCTO 123')).toBe(false);
    });
  });

  describe('CYBERSOURCE — solo acentos y ñ (manual V1.10 p.10)', () => {
    const re = getForbiddenCharsRegex('CYBERSOURCE');

    it('rechaza acentos y ñ', () => {
      expect(re.test('camión')).toBe(true);
      expect(re.test('Ñoño')).toBe(true);
      expect(re.test('María')).toBe(true);
    });

    it('NO rechaza símbolos que SÍ son inválidos en BASE', () => {
      // CS es más permisivo en símbolos — solo le importan acentos y ñ.
      expect(re.test('"comilla"')).toBe(false);
      expect(re.test('a&b')).toBe(false);
      expect(re.test('a/b')).toBe(false);
    });

    it('acepta texto sin acentos ni ñ', () => {
      expect(re.test('CAMION DE CARGA')).toBe(false);
      expect(re.test('a/b "&"')).toBe(false);
    });
  });

  describe('VENTANA_3DS — Ventana CE + capa 3DS (manual VCE v1.8 §7)', () => {
    const re = getForbiddenCharsRegex('VENTANA_3DS');

    it('rechaza el mismo set que BASE (manuales coinciden)', () => {
      expect(re.test('camión')).toBe(true);
      expect(re.test('"x"')).toBe(true);
      expect(re.test('a&b')).toBe(true);
    });
  });

  describe('FieldRequirementValueObject acepta param de lista', () => {
    it('default BASE bloquea acentos en evaluateDetailed', () => {
      const vo = new FieldRequirementValueObject('R');
      const result = vo.evaluateDetailed(true, 'María', { manualName: 'X', displayName: 'X', dataType: 'a', ambiguous: false, rules: { AUTH_VISA: 'R' } });
      expect(result.passes).toBe(false);
      expect(result.reason).toBe('forbidden_chars');
    });

    it('CYBERSOURCE permite símbolos que BASE rechaza', () => {
      const vo = new FieldRequirementValueObject('R');
      const result = vo.evaluateDetailed(
        true,
        'a&b',
        { manualName: 'X', displayName: 'X', dataType: 'a', ambiguous: false, rules: { AUTH_VISA: 'R' } },
        'CYBERSOURCE',
      );
      expect(result.passes).toBe(true);
    });

    it('CYBERSOURCE sigue rechazando acentos', () => {
      const vo = new FieldRequirementValueObject('R');
      const result = vo.evaluateDetailed(
        true,
        'María',
        { manualName: 'X', displayName: 'X', dataType: 'a', ambiguous: false, rules: { AUTH_VISA: 'R' } },
        'CYBERSOURCE',
      );
      expect(result.passes).toBe(false);
    });

    it('hasForbiddenChars también honra el parámetro', () => {
      expect(FieldRequirementValueObject.hasForbiddenChars('a&b', 'BASE')).toBe(true);
      expect(FieldRequirementValueObject.hasForbiddenChars('a&b', 'CYBERSOURCE')).toBe(false);
    });
  });
});
