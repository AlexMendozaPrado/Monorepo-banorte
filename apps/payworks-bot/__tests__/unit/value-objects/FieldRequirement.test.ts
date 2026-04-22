import { FieldRequirementValueObject, FieldRule } from '@/core/domain/value-objects/FieldRequirement';
import { FieldSpec, resolveSpecForBrand } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';

function makeSpec(overrides: Partial<FieldSpec> = {}): FieldSpec {
  return {
    manualName: 'TEST_FIELD',
    displayName: 'Test Field',
    dataType: 'alphanum',
    ambiguous: false,
    rules: { AUTH_VISA: 'R' },
    ...overrides,
  };
}

describe('FieldRequirementValueObject', () => {

  // =========================================================================
  // 1. PRESENCIA — R / O / OI / N/A
  // =========================================================================
  describe('Regla 1: Presencia (R/O/N/A/OI)', () => {
    it('R — PASS cuando campo existe y tiene valor', () => {
      const vo = new FieldRequirementValueObject('R');
      expect(vo.evaluate(true, 'valor')).toBe(true);
    });

    it('R — FAIL reason=missing cuando campo no existe', () => {
      const vo = new FieldRequirementValueObject('R');
      const r = vo.evaluateDetailed(false, undefined);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('missing');
    });

    it('R — FAIL reason=empty cuando campo existe pero vacío', () => {
      const vo = new FieldRequirementValueObject('R');
      const r = vo.evaluateDetailed(true, '');
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('empty');
    });

    it('R — FAIL reason=empty cuando campo es solo espacios', () => {
      const vo = new FieldRequirementValueObject('R');
      const r = vo.evaluateDetailed(true, '   ');
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('empty');
    });

    it('O — PASS siempre (campo ausente)', () => {
      expect(new FieldRequirementValueObject('O').evaluate(false)).toBe(true);
    });

    it('O — PASS siempre (campo presente vacío)', () => {
      expect(new FieldRequirementValueObject('O').evaluate(true, '')).toBe(true);
    });

    it('O — PASS cuando campo tiene valor', () => {
      expect(new FieldRequirementValueObject('O').evaluate(true, 'abc')).toBe(true);
    });

    it('OI — PASS siempre', () => {
      expect(new FieldRequirementValueObject('OI').evaluate(false)).toBe(true);
      expect(new FieldRequirementValueObject('OI').evaluate(true, 'x')).toBe(true);
    });

    it('N/A — PASS siempre sin importar nada', () => {
      expect(new FieldRequirementValueObject('N/A').evaluate(false)).toBe(true);
      expect(new FieldRequirementValueObject('N/A').evaluate(true, 'valor')).toBe(true);
    });

    it('regla inválida lanza error', () => {
      expect(() => new FieldRequirementValueObject('X' as FieldRule)).toThrow('Regla de campo invalida');
    });
  });

  // =========================================================================
  // 2. CARACTERES PROHIBIDOS
  // =========================================================================
  describe('Regla 2: Caracteres prohibidos', () => {
    // Set alineado a Manual VCE v1.8 §7 y Ecommerce Tradicional v2.6.4.
    // `ü` fue removido (no figura en los manuales vigentes). Se añaden
    // vocales acentuadas faltantes, ñ/Ñ, y los signos ¡ ! ¿ ¨ ,.
    const chars = [
      '<', '>', '|', '\\', '{', '}', '[', ']', '"',
      '*', ';', ':', '#', '$', '%', '&', '(', ')', '=',
      '?', '+', "'", '/', ',',
      'á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú',
      'ñ', 'Ñ', '¡', '!', '¿', '¨',
    ];

    for (const c of chars) {
      it(`FAIL con caracter prohibido: "${c}"`, () => {
        const vo = new FieldRequirementValueObject('R');
        const r = vo.evaluateDetailed(true, `valor${c}test`);
        expect(r.passes).toBe(false);
        expect(r.reason).toBe('forbidden_chars');
        expect(r.detail).toContain(c);
      });
    }

    it('PASS con valor limpio (sin caracteres especiales)', () => {
      const vo = new FieldRequirementValueObject('R');
      expect(vo.evaluate(true, 'VALOR_LIMPIO_123')).toBe(true);
    });

    // Nombres reales de comercios que deben pasar. Contienen E, U, O
    // (letras sin acento) y deben distinguirse de las vocales acentuadas.
    it.each([
      ['MUEVE CIUDAD'],
      ['ECOFLOW'],
      ['OPENLINEA'],
      ['DLOCAL'],
      ['ZIGU TECHNOLOGIES'],
    ])('PASS con nombre real de comercio: "%s"', (name) => {
      const vo = new FieldRequirementValueObject('R');
      expect(vo.evaluate(true, name)).toBe(true);
    });

    it('PASS con "ü" (no está prohibido en los manuales vigentes)', () => {
      const vo = new FieldRequirementValueObject('R');
      expect(vo.evaluate(true, 'PINGÜINO')).toBe(true);
    });

    it('PASS con campo O que tiene caracteres prohibidos y está vacío', () => {
      const vo = new FieldRequirementValueObject('O');
      expect(vo.evaluate(true, '')).toBe(true);
    });

    it('N/A no verifica caracteres aunque tenga valor con chars prohibidos', () => {
      const vo = new FieldRequirementValueObject('N/A');
      expect(vo.evaluate(true, 'valor<>prohibido')).toBe(true);
    });

    it('hasForbiddenChars() static helper', () => {
      expect(FieldRequirementValueObject.hasForbiddenChars('normal')).toBe(false);
      expect(FieldRequirementValueObject.hasForbiddenChars('tiene<angulo')).toBe(true);
    });
  });

  // =========================================================================
  // 3. FORMATO (regex)
  // =========================================================================
  describe('Regla 3: Formato (regex)', () => {
    it('MONTO — PASS formato decimal correcto "1500.00"', () => {
      const spec = makeSpec({ format: '^\\d{1,16}(\\.\\d{1,2})?$' });
      const vo = new FieldRequirementValueObject('R');
      expect(vo.evaluate(true, '1500.00', spec)).toBe(true);
    });

    it('MONTO — PASS entero sin decimales "37999"', () => {
      const spec = makeSpec({ format: '^\\d{1,16}(\\.\\d{1,2})?$' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '37999', spec)).toBe(true);
    });

    it('MONTO — FAIL con comas "1,500.00" (comas prohibidas por manual)', () => {
      const spec = makeSpec({ format: '^\\d{1,16}(\\.\\d{1,2})?$' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '1,500.00', spec);
      expect(r.passes).toBe(false);
      // La coma ahora está en el set de caracteres prohibidos (VCE v1.8 §7),
      // así que la regla 2 (forbidden_chars) se activa antes que la regla 3
      // (format). Comportamiento más específico y correcto semánticamente.
      expect(r.reason).toBe('forbidden_chars');
    });

    it('FECHA_EXP — PASS "1227" (diciembre 2027)', () => {
      const spec = makeSpec({ format: '^\\d{4}$' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '1227', spec)).toBe(true);
    });

    it('FECHA_EXP — FAIL "12/27" (formato incorrecto)', () => {
      const spec = makeSpec({ format: '^\\d{4}$' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '12/27', spec);
      expect(r.passes).toBe(false);
    });

    it('SECURITY_CODE — PASS "123" (3 dígitos)', () => {
      const spec = makeSpec({ format: '^\\d{3,4}$' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '123', spec)).toBe(true);
    });

    it('SECURITY_CODE — PASS "1234" (4 dígitos AMEX)', () => {
      const spec = makeSpec({ format: '^\\d{3,4}$' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '1234', spec)).toBe(true);
    });

    it('SECURITY_CODE — FAIL "12" (muy corto)', () => {
      const spec = makeSpec({ format: '^\\d{3,4}$' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '12', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('invalid_format');
    });

    it('regex inválido en spec no bloquea (pasa silenciosamente)', () => {
      const spec = makeSpec({ format: '[invalid(' });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'abc', spec)).toBe(true);
    });
  });

  // =========================================================================
  // 4. VALORES FIJOS (fixedValue)
  // =========================================================================
  describe('Regla 4: Valores fijos (fixedValue)', () => {
    it('VERSION_3D — PASS cuando valor es exactamente "2"', () => {
      const spec = makeSpec({ fixedValue: '2' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '2', spec)).toBe(true);
    });

    it('VERSION_3D — FAIL cuando valor es "1" (versión incorrecta)', () => {
      const spec = makeSpec({ fixedValue: '2' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '1', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('fixed_value_mismatch');
      expect(r.detail).toContain('Esperado: "2"');
      expect(r.detail).toContain('recibido: "1"');
    });

    it('Cert3D — PASS con "03"', () => {
      const spec = makeSpec({ fixedValue: '03' });
      expect(new FieldRequirementValueObject('R').evaluate(true, '03', spec)).toBe(true);
    });

    it('Cert3D — FAIL con "200" (valor del manual vs log)', () => {
      const spec = makeSpec({ fixedValue: '03' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '200', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('fixed_value_mismatch');
    });
  });

  // =========================================================================
  // 5. VALORES ENUMERADOS (validValues)
  // =========================================================================
  describe('Regla 5: Valores enumerados (validValues)', () => {
    it('MODE — PASS con "PRD"', () => {
      const spec = makeSpec({ validValues: ['PRD', 'AUT', 'DEC', 'RND'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'PRD', spec)).toBe(true);
    });

    it('MODE — PASS con "AUT" (prueba autorizado)', () => {
      const spec = makeSpec({ validValues: ['PRD', 'AUT', 'DEC', 'RND'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'AUT', spec)).toBe(true);
    });

    it('MODE — FAIL con "TEST" (no está en lista)', () => {
      const spec = makeSpec({ validValues: ['PRD', 'AUT', 'DEC', 'RND'] });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, 'TEST', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('invalid_value');
      expect(r.detail).toContain('TEST');
    });

    it('ENTRY_MODE — PASS con "MANUAL"', () => {
      const spec = makeSpec({ validValues: ['MANUAL', 'BANDA', 'CHIP', 'CONTACTLESSCHIP', 'CONTACTLESSBANDA'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'MANUAL', spec)).toBe(true);
    });

    it('ENTRY_MODE — PASS con "CONTACTLESSCHIP"', () => {
      const spec = makeSpec({ validValues: ['MANUAL', 'BANDA', 'CHIP', 'CONTACTLESSCHIP', 'CONTACTLESSBANDA'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'CONTACTLESSCHIP', spec)).toBe(true);
    });

    it('ECI — PASS con "05"', () => {
      const spec = makeSpec({ validValues: ['01', '02', '05', '06', '07'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, '05', spec)).toBe(true);
    });

    it('ECI — FAIL con "99"', () => {
      const spec = makeSpec({ validValues: ['01', '02', '05', '06', '07'] });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '99', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('invalid_value');
    });

    it('Decision Cybersource — PASS con "ACCEPT"', () => {
      const spec = makeSpec({ validValues: ['ACCEPT', 'REVIEW', 'REJECT', 'ERROR'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'ACCEPT', spec)).toBe(true);
    });

    it('Decision Cybersource — FAIL con "PENDING"', () => {
      const spec = makeSpec({ validValues: ['ACCEPT', 'REVIEW', 'REJECT', 'ERROR'] });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, 'PENDING', spec);
      expect(r.passes).toBe(false);
    });

    it('Card_cardType — PASS con "001" (VISA)', () => {
      const spec = makeSpec({ validValues: ['001', '002', '003'] });
      expect(new FieldRequirementValueObject('R').evaluate(true, '001', spec)).toBe(true);
    });

    it('validValues vacío no bloquea', () => {
      const spec = makeSpec({ validValues: [] });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'anything', spec)).toBe(true);
    });
  });

  // =========================================================================
  // 6. LONGITUD MÁXIMA (maxLength)
  // =========================================================================
  describe('Regla 6: Longitud máxima (maxLength)', () => {
    it('MERCHANT_ID — PASS con 7 dígitos (dentro de max 15)', () => {
      const spec = makeSpec({ maxLength: 15 });
      expect(new FieldRequirementValueObject('R').evaluate(true, '9607773', spec)).toBe(true);
    });

    it('MERCHANT_ID — PASS con 10 dígitos (dentro de max 15)', () => {
      const spec = makeSpec({ maxLength: 15 });
      expect(new FieldRequirementValueObject('R').evaluate(true, '7004145530', spec)).toBe(true);
    });

    it('TERMINAL_ID — FAIL con 16+ chars excede max 15', () => {
      const spec = makeSpec({ maxLength: 15 });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '1234567890123456', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('exceeds_max_length');
      expect(r.detail).toContain('16');
      expect(r.detail).toContain('15');
    });

    it('CONTROL_NUMBER — PASS con 26 chars (max 30)', () => {
      const spec = makeSpec({ maxLength: 30 });
      expect(new FieldRequirementValueObject('R').evaluate(true, '94784155462025052722082685', spec)).toBe(true);
    });

    it('EXP_DATE — PASS con 4 chars (max 4)', () => {
      const spec = makeSpec({ maxLength: 4 });
      expect(new FieldRequirementValueObject('R').evaluate(true, '1227', spec)).toBe(true);
    });

    it('EXP_DATE — FAIL con 6 chars excede max 4', () => {
      const spec = makeSpec({ maxLength: 4 });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '122027', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('exceeds_max_length');
    });
  });

  // =========================================================================
  // 7. ENMASCARAMIENTO (mustBeMasked)
  // =========================================================================
  describe('Regla 7: Enmascaramiento (mustBeMasked)', () => {
    it('CARD_NUMBER — PASS con tarjeta enmascarada "542418******1734"', () => {
      const spec = makeSpec({ mustBeMasked: true });
      expect(new FieldRequirementValueObject('R').evaluate(true, '542418******1734', spec)).toBe(true);
    });

    it('CARD_NUMBER — PASS con otro patrón "4111****1111"', () => {
      const spec = makeSpec({ mustBeMasked: true });
      expect(new FieldRequirementValueObject('R').evaluate(true, '4111****1111', spec)).toBe(true);
    });

    it('CARD_NUMBER — FAIL con tarjeta sin enmascarar "4111111111111111"', () => {
      const spec = makeSpec({ mustBeMasked: true });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '4111111111111111', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('not_masked');
      expect(r.detail).toContain('enmascarada');
    });

    it('campo sin mustBeMasked no valida enmascaramiento', () => {
      const spec = makeSpec();
      expect(new FieldRequirementValueObject('R').evaluate(true, '4111111111111111', spec)).toBe(true);
    });
  });

  // =========================================================================
  // 8. OMITIR SI VACÍO (omitIfEmpty)
  // =========================================================================
  describe('Regla 8: Omitir si vacío (omitIfEmpty)', () => {
    it('XID — PASS cuando tiene valor "A...A"', () => {
      const spec = makeSpec({ omitIfEmpty: true });
      expect(new FieldRequirementValueObject('R').evaluate(true, 'A'.repeat(40), spec)).toBe(true);
    });

    it('XID — FAIL cuando está presente pero vacío (debe omitirse)', () => {
      const spec = makeSpec({ omitIfEmpty: true });
      const r = new FieldRequirementValueObject('O').evaluateDetailed(true, '', spec);
      expect(r.passes).toBe(false);
      expect(r.reason).toBe('should_be_omitted');
    });

    it('CAVV — PASS cuando no está presente (no enviado)', () => {
      const spec = makeSpec({ omitIfEmpty: true });
      expect(new FieldRequirementValueObject('O').evaluate(false, undefined, spec)).toBe(true);
    });
  });

  // =========================================================================
  // 9. ORDEN DE PRECEDENCIA DE EVALUACIÓN
  // =========================================================================
  describe('Regla 9: Orden de precedencia', () => {
    it('R missing se evalúa ANTES que forbidden_chars', () => {
      const r = new FieldRequirementValueObject('R').evaluateDetailed(false, undefined);
      expect(r.reason).toBe('missing');
    });

    it('R empty se evalúa ANTES que formato', () => {
      const spec = makeSpec({ format: '^\\d+$' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '', spec);
      expect(r.reason).toBe('empty');
    });

    it('forbidden_chars se evalúa ANTES que fixedValue', () => {
      const spec = makeSpec({ fixedValue: '2' });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '<', spec);
      expect(r.reason).toBe('forbidden_chars');
    });

    it('fixedValue se evalúa ANTES que validValues', () => {
      const spec = makeSpec({ fixedValue: '2', validValues: ['1', '2', '3'] });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '3', spec);
      expect(r.reason).toBe('fixed_value_mismatch');
    });

    it('maxLength se evalúa DESPUÉS de validValues', () => {
      const spec = makeSpec({ validValues: ['AB', 'CD'], maxLength: 1 });
      const r = new FieldRequirementValueObject('R').evaluateDetailed(true, 'XY', spec);
      expect(r.reason).toBe('invalid_value');
    });
  });

  // =========================================================================
  // 10. HELPERS
  // =========================================================================
  describe('Helpers', () => {
    it('getDisplayName() retorna nombre correcto para cada regla', () => {
      expect(new FieldRequirementValueObject('R').getDisplayName()).toBe('Requerido');
      expect(new FieldRequirementValueObject('O').getDisplayName()).toBe('Opcional');
      expect(new FieldRequirementValueObject('N/A').getDisplayName()).toBe('No Aplica');
      expect(new FieldRequirementValueObject('OI').getDisplayName()).toBe('Opcional (si aplica)');
    });

    it('isRequired/isOptional/isNotApplicable', () => {
      expect(new FieldRequirementValueObject('R').isRequired()).toBe(true);
      expect(new FieldRequirementValueObject('O').isOptional()).toBe(true);
      expect(new FieldRequirementValueObject('OI').isOptional()).toBe(true);
      expect(new FieldRequirementValueObject('N/A').isNotApplicable()).toBe(true);
    });
  });
});

// ===========================================================================
// resolveSpecForBrand — proyección de FieldSpec a validValues por marca
// ===========================================================================
describe('resolveSpecForBrand', () => {
  // Simula el FieldSpec de ECI en layer-3ds.json:476.
  const eciSpec: FieldSpec = {
    manualName: 'ECI',
    displayName: 'ECI',
    dataType: 'numeric',
    ambiguous: false,
    rules: { AUTH_VISA: 'R', AUTH_MC: 'R' },
    validValues: ['01', '02', '05', '06', '07'],
    validValuesByBrand: {
      [CardBrand.VISA]: ['05', '06', '07'],
      [CardBrand.MASTERCARD]: ['01', '02'],
    },
  };

  it('VISA proyecta validValues a [05,06,07]', () => {
    const out = resolveSpecForBrand(eciSpec, CardBrand.VISA);
    expect(out.validValues).toEqual(['05', '06', '07']);
  });

  it('MC proyecta validValues a [01,02]', () => {
    const out = resolveSpecForBrand(eciSpec, CardBrand.MASTERCARD);
    expect(out.validValues).toEqual(['01', '02']);
  });

  it('no muta el spec original', () => {
    const snapshot = JSON.stringify(eciSpec);
    resolveSpecForBrand(eciSpec, CardBrand.VISA);
    expect(JSON.stringify(eciSpec)).toBe(snapshot);
  });

  it('fallback a validValues global cuando no hay validValuesByBrand', () => {
    const simple: FieldSpec = { ...eciSpec, validValuesByBrand: undefined };
    const out = resolveSpecForBrand(simple, CardBrand.VISA);
    expect(out.validValues).toEqual(['01', '02', '05', '06', '07']);
  });

  it('fallback a validValues global cuando la marca no está mapeada', () => {
    const partial: FieldSpec = {
      ...eciSpec,
      validValuesByBrand: { [CardBrand.VISA]: ['05', '06', '07'] },
    };
    const out = resolveSpecForBrand(partial, CardBrand.MASTERCARD);
    expect(out.validValues).toEqual(['01', '02', '05', '06', '07']);
  });

  it('fallback cuando byBrand[brand] está vacío', () => {
    const empty: FieldSpec = {
      ...eciSpec,
      validValuesByBrand: { [CardBrand.VISA]: [] },
    };
    const out = resolveSpecForBrand(empty, CardBrand.VISA);
    expect(out.validValues).toEqual(['01', '02', '05', '06', '07']);
  });

  // Integración con el evaluador: el VO sólo ve los valores proyectados.
  it('integración: evaluador rechaza ECI=01 en VISA tras proyección', () => {
    const projected = resolveSpecForBrand(eciSpec, CardBrand.VISA);
    const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '01', projected);
    expect(r.passes).toBe(false);
    expect(r.reason).toBe('invalid_value');
    expect(r.detail).toContain('05');
  });

  it('integración: evaluador acepta ECI=01 en MC tras proyección', () => {
    const projected = resolveSpecForBrand(eciSpec, CardBrand.MASTERCARD);
    const r = new FieldRequirementValueObject('R').evaluateDetailed(true, '01', projected);
    expect(r.passes).toBe(true);
  });
});
