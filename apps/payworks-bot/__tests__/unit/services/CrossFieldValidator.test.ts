import { CrossFieldValidator, UniqueValidator } from '@/core/domain/services/CrossFieldValidator';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';

function makeEntity(fields: Record<string, string>) {
  const map = new Map(Object.entries(fields));
  return {
    hasField: (n: string) => map.has(n),
    getField: (n: string) => map.get(n),
  };
}

describe('CrossFieldValidator', () => {

  describe('XID/CAVV condicional (3DS)', () => {
    it('no genera issue cuando XID/CAVV tienen valor', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ XID: 'A'.repeat(40), CAVV: 'B'.repeat(40) }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('genera issue cuando XID está presente pero vacío', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ XID: '', CAVV: 'B'.repeat(40) }));
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('XID');
      expect(issues[0].layer).toBe(ValidationLayer.THREEDS);
    });

    it('genera issue cuando CAVV está presente pero vacío', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ XID: 'A'.repeat(40), CAVV: '  ' }));
      expect(v.getIssues()).toHaveLength(1);
      expect(v.getIssues()[0].field).toBe('CAVV');
    });

    it('genera 2 issues cuando ambos XID y CAVV están vacíos', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ XID: '', CAVV: '' }));
      expect(v.getIssues()).toHaveLength(2);
    });

    it('no genera issue cuando XID no está presente (campo no enviado — correcto)', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ CAVV: 'B'.repeat(40) }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no genera issue cuando log 3DS es undefined', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(undefined);
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('POSTAUTH requiere AUTH_CODE', () => {
    it('no genera issue para transacciones que no son POSTAUTH', () => {
      const v = new CrossFieldValidator();
      v.validatePostAuthRequiresAuthCode('AUTH', makeEntity({}), []);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no genera issue cuando POSTAUTH tiene AUTH_CODE en request', () => {
      const v = new CrossFieldValidator();
      v.validatePostAuthRequiresAuthCode('POSTAUTH', makeEntity({ AUTH_CODE: '830125' }), []);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no genera issue cuando AUTH_CODE está en respuesta previa', () => {
      const v = new CrossFieldValidator();
      const prevResp = makeEntity({ AUTH_CODE: '830125' });
      v.validatePostAuthRequiresAuthCode('POSTAUTH', makeEntity({}), [prevResp]);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('genera issue cuando POSTAUTH sin AUTH_CODE ni en request ni en previas', () => {
      const v = new CrossFieldValidator();
      v.validatePostAuthRequiresAuthCode('POSTAUTH', makeEntity({}), []);
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('AUTH_CODE');
      expect(issues[0].detail).toContain('respuestas previas');
    });
  });

  describe('PROSA Campo37 ↔ Servlet REFERENCIA', () => {
    it('no genera issue cuando ambos coinciden', () => {
      const v = new CrossFieldValidator();
      v.validateProsaReferenceMatch(
        makeEntity({ REFERENCE: '140559968829' }),
        makeEntity({ '37': '140559968829' }),
      );
      expect(v.getIssues()).toHaveLength(0);
    });

    it('genera issue cuando no coinciden', () => {
      const v = new CrossFieldValidator();
      v.validateProsaReferenceMatch(
        makeEntity({ REFERENCE: '140559968829' }),
        makeEntity({ '37': '999999999999' }),
      );
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('REFERENCE↔Campo37');
      expect(issues[0].detail).toContain('140559968829');
      expect(issues[0].detail).toContain('999999999999');
    });

    it('no genera issue cuando alguno de los logs es undefined', () => {
      const v = new CrossFieldValidator();
      v.validateProsaReferenceMatch(undefined, makeEntity({ '37': '123' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no genera issue cuando ninguno tiene REFERENCIA/Campo37', () => {
      const v = new CrossFieldValidator();
      v.validateProsaReferenceMatch(makeEntity({}), makeEntity({}));
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('Cybersource Decision flow', () => {
    it('no genera issue con Decision=ACCEPT', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceDecisionFlow(makeEntity({ decision: 'ACCEPT' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no genera issue con Decision=REVIEW', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceDecisionFlow(makeEntity({ decision: 'REVIEW' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('genera issue con Decision=UNKNOWN', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceDecisionFlow(makeEntity({ decision: 'UNKNOWN' }));
      expect(v.getIssues()).toHaveLength(1);
      expect(v.getIssues()[0].layer).toBe(ValidationLayer.CYBERSOURCE);
    });

    it('no genera issue cuando log cybersource es undefined', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceDecisionFlow(undefined);
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('ShipTo_country ↔ TERMINAL_COUNTRY (regla 22)', () => {
    it('no genera issue cuando países coinciden', () => {
      const v = new CrossFieldValidator();
      v.validateShipToCountryMatch(
        makeEntity({ ShipTo_country: 'MX' }),
        makeEntity({ TERMINAL_COUNTRY: 'MX' }),
      );
      expect(v.getIssues()).toHaveLength(0);
    });

    it('genera issue cuando países no coinciden', () => {
      const v = new CrossFieldValidator();
      v.validateShipToCountryMatch(
        makeEntity({ ShipTo_country: 'US' }),
        makeEntity({ TERMINAL_COUNTRY: 'MX' }),
      );
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('ShipTo_country↔TERMINAL_COUNTRY');
      expect(issues[0].layer).toBe(ValidationLayer.CYBERSOURCE);
    });

    it('no genera issue cuando alguno de los campos no existe', () => {
      const v = new CrossFieldValidator();
      v.validateShipToCountryMatch(makeEntity({}), makeEntity({ TERMINAL_COUNTRY: 'MX' }));
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('Response fields validation (regla 21)', () => {
    it('PASS cuando RESULTADO_PAYW es A (Aprobada)', () => {
      const v = new CrossFieldValidator();
      v.validateResponseFields(
        makeEntity({ PAYW_RESULT: 'A' }),
        [{ field: 'PAYW_RESULT', validValues: ['A', 'D', 'R', 'T'] }],
      );
      expect(v.getIssues()).toHaveLength(0);
    });

    it('FAIL cuando RESULTADO_PAYW es un valor inválido', () => {
      const v = new CrossFieldValidator();
      v.validateResponseFields(
        makeEntity({ PAYW_RESULT: 'X' }),
        [{ field: 'PAYW_RESULT', validValues: ['A', 'D', 'R', 'T'] }],
      );
      expect(v.getIssues()).toHaveLength(1);
      expect(v.getIssues()[0].detail).toContain('X');
    });

    it('no genera issue cuando campo de respuesta no existe', () => {
      const v = new CrossFieldValidator();
      v.validateResponseFields(
        makeEntity({}),
        [{ field: 'PAYW_RESULT', validValues: ['A', 'D', 'R', 'T'] }],
      );
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('toFieldValidationResults()', () => {
    it('convierte issues a FieldValidationResult[]', () => {
      const v = new CrossFieldValidator();
      v.validateXidCavvConditional(makeEntity({ XID: '' }));
      const results = v.toFieldValidationResults();
      expect(results).toHaveLength(1);
      expect(results[0].verdict).toBe('FAIL');
      expect(results[0].failReason).toBe('cross_field');
      expect(results[0].layer).toBe(ValidationLayer.THREEDS);
    });

    it('Fase F.1: value queda undefined (no muestra el mensaje de error como valor)', () => {
      const v = new CrossFieldValidator();
      v.validatePostAuthRequiresAuthCode('POSTAUTH', makeEntity({}), []);
      const results = v.toFieldValidationResults();
      expect(results).toHaveLength(1);
      expect(results[0].field).toBe('AUTH_CODE');
      expect(results[0].value).toBeUndefined();
      expect(results[0].failDetail).toContain('POSTAUTH requiere AUTH_CODE');
      expect(results[0].failDetail).toContain('No se encontró AUTH_CODE');
    });

    it('respeta issue.source cuando se especifica (no hard-codea SERVLET)', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        makeEntity({ ID_CYBERSOURCE: 'REQ-X' }),
        makeEntity({ requestID: 'REQ-Y', Card_accountNumber: '4111111111111111', Card_cardType: '001' }),
      );
      const results = v.toFieldValidationResults();
      expect(results.some(r => r.source === 'CYBERSOURCE')).toBe(true);
    });
  });

  describe('C11 — Cybersource ID + BIN vs CardType', () => {
    it('C11a: pasa cuando ID_CYBERSOURCE y requestID coinciden', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        makeEntity({ ID_CYBERSOURCE: 'REQ-001' }),
        makeEntity({ requestID: 'REQ-001', Card_accountNumber: '4111111111111111', Card_cardType: '001' }),
      );
      expect(v.getIssues()).toHaveLength(0);
    });

    it('C11a: falla cuando difieren', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        makeEntity({ ID_CYBERSOURCE: 'REQ-AAA' }),
        makeEntity({ requestID: 'REQ-BBB', Card_accountNumber: '4111111111111111', Card_cardType: '001' }),
      );
      const issues = v.getIssues();
      expect(issues.some(i => i.field === 'ID_CYBERSOURCE↔requestID')).toBe(true);
      expect(issues.find(i => i.field === 'ID_CYBERSOURCE↔requestID')?.source).toBe('CYBERSOURCE');
    });

    it('C11b: Card_cardType=001 (VISA) con BIN no-VISA falla', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        undefined,
        makeEntity({ Card_accountNumber: '5555555555554444', Card_cardType: '001' }),
      );
      const issue = v.getIssues().find(i => i.field === 'Card_cardType↔BIN');
      expect(issue?.rule).toContain('C11b');
      expect(issue?.rule).toContain('VISA');
    });

    it('C11b: Card_cardType=002 (MC) con BIN VISA falla', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        undefined,
        makeEntity({ Card_accountNumber: '4111111111111111', Card_cardType: '002' }),
      );
      expect(v.getIssues().find(i => i.field === 'Card_cardType↔BIN')?.rule).toContain('MC');
    });

    it('C11b: MC en rango 222100-272099 (nuevo BIN range) pasa', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        undefined,
        makeEntity({ Card_accountNumber: '2221001234567890', Card_cardType: '002' }),
      );
      expect(v.getIssues().filter(i => i.field === 'Card_cardType↔BIN')).toHaveLength(0);
    });

    it('C11b: MC en rango 51-55 pasa', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        undefined,
        makeEntity({ Card_accountNumber: '5300001234567890', Card_cardType: '002' }),
      );
      expect(v.getIssues().filter(i => i.field === 'Card_cardType↔BIN')).toHaveLength(0);
    });

    it('C11: no se ejecuta sin log Cybersource', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(makeEntity({ ID_CYBERSOURCE: 'X' }), undefined);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('C11b: acepta BIN enmascarado (masking con *) extrayendo los 6 primeros dígitos reales', () => {
      const v = new CrossFieldValidator();
      v.validateCybersourceIdAndBin(
        undefined,
        makeEntity({ Card_accountNumber: '411111******1111', Card_cardType: '001' }),
      );
      expect(v.getIssues().filter(i => i.field === 'Card_cardType↔BIN')).toHaveLength(0);
    });
  });

  describe('C12 — Códigos error PinPad', () => {
    const codes = { '01': 'Timeout', '05': 'Cancelado por usuario', 'EMV_DECLINE': 'Rechazo EMV' };

    it('pasa con ERROR_CODE documentado', () => {
      const v = new CrossFieldValidator();
      v.validatePinPadErrorCode(makeEntity({ ERROR_CODE: '01' }), codes);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('pasa con ERROR_CODE = "0" o "00" (sin error)', () => {
      const v = new CrossFieldValidator();
      v.validatePinPadErrorCode(makeEntity({ ERROR_CODE: '0' }), codes);
      v.validatePinPadErrorCode(makeEntity({ ERROR_CODE: '00' }), codes);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('falla con ERROR_CODE no documentado', () => {
      const v = new CrossFieldValidator();
      v.validatePinPadErrorCode(makeEntity({ ERROR_CODE: 'XYZ' }), codes);
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('ERROR_CODE');
      expect(issues[0].rule).toContain('C12');
    });

    it('reconoce alias CODIGO_ERROR y PINPAD_ERROR', () => {
      const v1 = new CrossFieldValidator();
      v1.validatePinPadErrorCode(makeEntity({ CODIGO_ERROR: 'XYZ' }), codes);
      expect(v1.getIssues()).toHaveLength(1);

      const v2 = new CrossFieldValidator();
      v2.validatePinPadErrorCode(makeEntity({ PINPAD_ERROR: 'BAD' }), codes);
      expect(v2.getIssues()).toHaveLength(1);
    });

    it('no corre cuando el producto no tiene errorCodes (TNP)', () => {
      const v = new CrossFieldValidator();
      v.validatePinPadErrorCode(makeEntity({ ERROR_CODE: 'XYZ' }), undefined);
      expect(v.getIssues()).toHaveLength(0);
    });

    it('no corre sin servlet log', () => {
      const v = new CrossFieldValidator();
      v.validatePinPadErrorCode(undefined, codes);
      expect(v.getIssues()).toHaveLength(0);
    });
  });

  describe('Tokenización Token de Red — consistencia por marca (ADDENDUM I V1.2)', () => {
    it('no genera issue cuando no hay marcadores de tokenización', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('VISA', makeEntity({ AMOUNT: '100.00', MERCHANT_ID: '8619640' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('VISA con TAVV: pasa (caso correcto)', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('VISA', makeEntity({ TAVV: '/gAAAAAAjXTHmrMAmbV0gwEAAAA=' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('MC con TR_ID + AAV: pasa (caso correcto)', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('MC', makeEntity({ TR_ID: '50110540444', AAV: 'AAQao7vxa6NeAAEaly6IAAADFA==' }));
      expect(v.getIssues()).toHaveLength(0);
    });

    it('VISA con AAV: falla (AAV es exclusivo de MC)', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('VISA', makeEntity({ AAV: 'AAQao7vxa6NeAAEaly6IAAADFA==' }));
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('AAV');
      expect(issues[0].layer).toBe(ValidationLayer.TOKENIZACION);
      expect(issues[0].source).toBe('TOKENIZACION');
    });

    it('VISA con TR_ID: falla (TR_ID es exclusivo de MC)', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('VISA', makeEntity({ TR_ID: '50110540444' }));
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('TR_ID');
    });

    it('MC con TAVV: falla (TAVV es exclusivo de VISA)', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('MC', makeEntity({ TAVV: '/gAAAAAAjXTHmrMAmbV0gwEAAAA=' }));
      const issues = v.getIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].field).toBe('TAVV');
      expect(issues[0].source).toBe('TOKENIZACION');
    });

    it('no corre sin servlet log', () => {
      const v = new CrossFieldValidator();
      v.validateTokenizacionBrandConsistency('VISA', undefined);
      expect(v.getIssues()).toHaveLength(0);
    });
  });
});

describe('UniqueValidator', () => {
  it('no reporta duplicados cuando todas las combinaciones son únicas', () => {
    const v = new UniqueValidator();
    v.addTransaction('CTRL-001', 'MERCH-A');
    v.addTransaction('CTRL-002', 'MERCH-A');
    v.addTransaction('CTRL-001', 'MERCH-B');
    expect(v.hasDuplicates()).toBe(false);
    expect(v.getDuplicates()).toHaveLength(0);
  });

  it('detecta duplicado cuando misma combinación aparece 2 veces', () => {
    const v = new UniqueValidator();
    v.addTransaction('CTRL-001', 'MERCH-A');
    v.addTransaction('CTRL-001', 'MERCH-A');
    expect(v.hasDuplicates()).toBe(true);
    expect(v.getDuplicates()).toHaveLength(1);
    expect(v.getDuplicates()[0].key).toBe('MERCH-A:CTRL-001');
    expect(v.getDuplicates()[0].occurrences).toBe(2);
  });

  it('detecta múltiples duplicados', () => {
    const v = new UniqueValidator();
    v.addTransaction('CTRL-001', 'M1');
    v.addTransaction('CTRL-001', 'M1');
    v.addTransaction('CTRL-002', 'M2');
    v.addTransaction('CTRL-002', 'M2');
    v.addTransaction('CTRL-002', 'M2');
    expect(v.getDuplicates()).toHaveLength(2);
    expect(v.getDuplicates().find(d => d.key === 'M2:CTRL-002')?.occurrences).toBe(3);
  });

  it('toFieldValidationResults() genera FAIL por cada duplicado', () => {
    const v = new UniqueValidator();
    v.addTransaction('CTRL-001', 'M1');
    v.addTransaction('CTRL-001', 'M1');
    const results = v.toFieldValidationResults();
    expect(results).toHaveLength(1);
    expect(results[0].verdict).toBe('FAIL');
    expect(results[0].field).toBe('CONTROL_NUMBER+MERCHANT_ID');
    expect(results[0].failDetail).toContain('2 veces');
  });
});
