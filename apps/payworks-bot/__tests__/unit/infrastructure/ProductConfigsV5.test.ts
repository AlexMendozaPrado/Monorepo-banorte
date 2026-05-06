import { MandatoryFieldsConfig } from '@/infrastructure/mandatory-rules/MandatoryFieldsConfig';
import { IntegrationType, IntegrationTypeValueObject } from '@/core/domain/value-objects/IntegrationType';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import layer3ds from '@/config/mandatory-fields/layer-3ds.json';
import layerCybersource from '@/config/mandatory-fields/layer-cybersource.json';
import layerAn5822 from '@/config/mandatory-fields/layer-an5822.json';
import responseRules from '@/config/mandatory-fields/response-rules.json';

// Content-regression (Fase 4.1.4 / 4.2.x) — blinda los cambios clave de
// los JSONs v5 contra edits accidentales. Si alguno de estos asserts
// rompe, consultar con Ramsses antes de "arreglar" el test.

describe('Product configs v5 — smoke', () => {
  const config = new MandatoryFieldsConfig();
  const products = Object.values(IntegrationType);

  it.each(products)('%s carga la matriz sin errores', (product) => {
    const matrix = config.getMatrix(product);
    expect(matrix.integrationType).toBe(product);
    expect(matrix.manualVersion).toBeDefined();
    expect(Object.keys(matrix.servlet).length).toBeGreaterThan(0);
  });

  it.each(products)('%s expone getServletLogNames no vacío', (product) => {
    expect(config.getServletLogNames(product).length).toBeGreaterThan(0);
  });
});

describe('Product configs v5 — cambios clave', () => {
  const config = new MandatoryFieldsConfig();

  describe('ecommerce-tradicional', () => {
    const m = config.getMatrix(IntegrationType.ECOMMERCE_TRADICIONAL);

    it('MERCHANT_ID: maxLength 7 + format numérico ≤7', () => {
      expect(m.servlet.MERCHANT_ID?.maxLength).toBe(7);
      expect(m.servlet.MERCHANT_ID?.format).toBe('^\\d{1,7}$');
    });

    it('MARKETPLACE_TX: PROHIBITED en MC/AMEX, O en VISA', () => {
      const spec = m.servlet.MARKETPLACE_TX;
      expect(spec?.rules.AUTH_MC).toBe('PROHIBITED');
      expect(spec?.rules.AUTH_AMEX).toBe('PROHIBITED');
      expect(spec?.rules.AUTH_VISA).toBe('O');
    });

    it('ID_GATEWAY NO existe en Tradicional (pertenece a Agregadores v2.6.4)', () => {
      expect(m.servlet.ID_GATEWAY).toBeUndefined();
    });

    it('TERMINAL_ID: maxLength 10 (manual v2.5 p.6)', () => {
      expect(m.servlet.TERMINAL_ID?.maxLength).toBe(10);
    });

    it('CUSTOMER_REF3 y CUSTOMER_REF5: Opcional (no R — eso viene de Agregadores)', () => {
      expect(m.servlet.CUSTOMER_REF3?.rules.AUTH_VISA).toBe('O');
      expect(m.servlet.CUSTOMER_REF5?.rules.AUTH_VISA).toBe('O');
    });

    it('CONTROL_NUMBER: R para todas las transacciones (manual v2.5 p.7)', () => {
      const r = m.servlet.CONTROL_NUMBER?.rules;
      expect(r?.AUTH_VISA).toBe('R');
      expect(r?.VOID_VISA).toBe('R');
      expect(r?.REFUND_VISA).toBe('R');
      expect(r?.VERIFY_VISA).toBe('R');
    });

    it('AMOUNT: R en REFUND (manual excluye solo CANCELACION y REVERSA)', () => {
      expect(m.servlet.AMOUNT?.rules.REFUND_VISA).toBe('R');
      expect(m.servlet.AMOUNT?.rules.VOID_VISA).toBe('N/A');
      expect(m.servlet.AMOUNT?.rules.REVERSAL_VISA).toBe('N/A');
    });

    it('PASSWORD, EXP_DATE, SECURITY_CODE: R_PCI (no logueables pero requeridos por manual)', () => {
      expect(m.servlet.PASSWORD?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.EXP_DATE?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.EXP_DATE?.rules.PREAUTH_VISA).toBe('R_PCI');
      expect(m.servlet.SECURITY_CODE?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.SECURITY_CODE?.rules.PREAUTH_VISA).toBe('R_PCI');
    });

    it('CARD_NUMBER y ENTRY_MODE: N/A en POSTAUTH (manual v2.5)', () => {
      expect(m.servlet.CARD_NUMBER?.rules.POSTAUTH_VISA).toBe('N/A');
      expect(m.servlet.ENTRY_MODE?.rules.POSTAUTH_VISA).toBe('N/A');
    });

    it('RESPONSE_LANGUAGE: validValues solo [ES, EN] (manual v2.5 p.8)', () => {
      expect(m.servlet.RESPONSE_LANGUAGE?.validValues).toEqual(['ES', 'EN']);
    });

    it('servlet contiene los 20 campos del manual v2.5 p.6-8 + 4 AMEX P9 = 24', () => {
      const keys = Object.keys(m.servlet).filter(k => !k.startsWith('_'));
      // 20 campos servlet base + 4 variables AMEX P9 (revisión Ramsses abr-2026):
      // DOMICILIO, CODIGO_POSTAL, TELEFONO, CORREO_ELECTRONICO.
      expect(keys).toHaveLength(24);
      expect(keys).not.toContain('GROUP');
      expect(keys).not.toContain('PLAN_TYPE');
      expect(keys).not.toContain('PAYMENT_NUMBER');
      expect(keys).not.toContain('INITIAL_DEFERMENT');
      // Las 4 AMEX deben estar presentes
      expect(keys).toContain('DOMICILIO');
      expect(keys).toContain('CODIGO_POSTAL');
      expect(keys).toContain('TELEFONO');
      expect(keys).toContain('CORREO_ELECTRONICO');
    });

    it('AMEX P9: DOMICILIO/CP/TELEFONO/CORREO son R solo en AUTH/PREAUTH AMEX', () => {
      for (const field of ['DOMICILIO', 'CODIGO_POSTAL', 'TELEFONO', 'CORREO_ELECTRONICO']) {
        expect(m.servlet[field]?.rules.AUTH_AMEX).toBe('R');
        expect(m.servlet[field]?.rules.PREAUTH_AMEX).toBe('R');
        expect(m.servlet[field]?.rules.AUTH_VISA).toBe('N/A');
        expect(m.servlet[field]?.rules.AUTH_MC).toBe('N/A');
        expect(m.servlet[field]?.rules.POSTAUTH_AMEX).toBe('N/A');
      }
    });
  });

  describe('moto', () => {
    const m = config.getMatrix(IntegrationType.MOTO);

    it('ENTRY_MODE: validValues = ["MANUAL"]', () => {
      expect(m.servlet.ENTRY_MODE?.validValues).toEqual(['MANUAL']);
    });

    it('no soporta AMEX en rules (producto sin AMEX)', () => {
      const amexKeys = Object.keys(m.servlet.MERCHANT_ID?.rules ?? {}).filter(k => k.endsWith('_AMEX'));
      expect(amexKeys).toHaveLength(0);
    });
  });

  describe('cargos-periodicos-post', () => {
    const m = config.getMatrix(IntegrationType.CARGOS_PERIODICOS_POST);

    it('TERMINAL_ID: maxLength 10 (único entre TNP)', () => {
      expect(m.servlet.TERMINAL_ID?.maxLength).toBe(10);
    });

    it('TERMINAL_ID: R (no O)', () => {
      expect(m.servlet.TERMINAL_ID?.rules.AUTH_VISA).toBe('R');
    });
  });

  describe('ventana-comercio-electronico', () => {
    const m = config.getMatrix(IntegrationType.VENTANA_COMERCIO_ELECTRONICO);

    it('merchantCity: maxLength 40 (antes era 13 por bug 3DS v1.0)', () => {
      expect(m.servlet.merchantCity?.maxLength).toBe(40);
    });

    it('tiene campos Q6 MSI: initialDeferment, paymentsNumber, planType', () => {
      expect(m.servlet.initialDeferment).toBeDefined();
      expect(m.servlet.paymentsNumber).toBeDefined();
      expect(m.servlet.planType).toBeDefined();
    });
  });

  describe('api-pw2-seguro', () => {
    const m = config.getMatrix(IntegrationType.API_PW2_SEGURO);

    it('EMV_TAGS en servlet (único campo EMV real de envío)', () => {
      expect(m.servlet.EMV_TAGS).toBeDefined();
    });

    it('TVR/TSI/AID/APN/AL NO en servlet (movidos a emvVoucher)', () => {
      for (const tag of ['TVR', 'TSI', 'AID', 'APN', 'AL']) {
        expect(m.servlet[tag]).toBeUndefined();
      }
    });

    it('emvVoucher presente y contiene tags EMV de salida', () => {
      expect(m.emvVoucher).toBeDefined();
      expect(m.emvVoucher?.TVR).toBeDefined();
      expect(m.emvVoucher?.TSI).toBeDefined();
    });
  });

  describe('interredes-remoto', () => {
    const m = config.getMatrix(IntegrationType.INTERREDES_REMOTO);

    it('CMD_TRANS tiene 13+ valores (incluye OBTENER_LLAVE, CASHBACK)', () => {
      const vals = m.servlet.CMD_TRANS?.validValues ?? [];
      expect(vals.length).toBeGreaterThanOrEqual(13);
      expect(vals).toContain('OBTENER_LLAVE');
      expect(vals).toContain('CASHBACK');
    });
  });

  describe('agregadores-integradores-tp (manual V2.4.2 — Fase C abr-2026)', () => {
    const m = config.getMatrix(IntegrationType.AGREGADORES_INTEGRADORES_TP);

    it('versión 2.4.2 cargada', () => {
      expect(m.manualVersion).toBe('2.4.2');
    });

    it('CMD_TRANS incluye SUSPENSION/REACTIVACION (diferenciador vs Interredes)', () => {
      const vals = m.servlet.CMD_TRANS?.validValues ?? [];
      expect(vals).toContain('SUSPENSION');
      expect(vals).toContain('REACTIVACION');
      expect(vals).toContain('OBTENER_LLAVE');
    });

    it('ENTRY_MODE incluye CONTACTLESSCHIP (manual TP V2.4.2 p.20)', () => {
      const vals = m.servlet.ENTRY_MODE?.validValues ?? [];
      expect(vals).toContain('CONTACTLESSCHIP');
      expect(vals).toContain('CHIP');
      expect(vals).toContain('MANUAL');
      expect(vals).toContain('BANDA');
    });

    it('VIRTUAL_KEYBOARD existe (campo nuevo v2.4 dic-2023)', () => {
      expect(m.servlet.VIRTUAL_KEYBOARD).toBeDefined();
      expect(m.servlet.VIRTUAL_KEYBOARD?.validValues).toEqual(['0', '1']);
    });

    it('CUSTOMER_REF5 es R (obligatorio para alianzas/agregadores/integradores)', () => {
      expect(m.servlet.CUSTOMER_REF5?.rules.AUTH_VISA).toBe('R');
    });

    it('subEsquemas: 3 esquemas declarados', () => {
      expect(m.subEsquemas?.ESQ_1_TASA_NATURAL).toBeDefined();
      expect(m.subEsquemas?.ESQ_4_CON_AGP).toBeDefined();
      expect(m.subEsquemas?.ESQ_4_SIN_AGP).toBeDefined();
      expect(m.subEsquemas?.ESQ_4_CON_AGP.required).toEqual(['SUB_MERCHANT', 'AGGREGATOR_ID']);
      expect(m.subEsquemas?.ESQ_4_SIN_AGP.required).toHaveLength(8);
    });

    it('PASSWORD/TRACK1/TRACK2/CARD_NUMBER son R_PCI', () => {
      expect(m.servlet.PASSWORD?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.TRACK1?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.TRACK2?.rules.AUTH_VISA).toBe('R_PCI');
      expect(m.servlet.CARD_NUMBER?.rules.AUTH_VISA).toBe('R_PCI');
    });

    it('IntegrationType marca es Tarjeta Presente y soporta esquemas', () => {
      const vo = new IntegrationTypeValueObject(IntegrationType.AGREGADORES_INTEGRADORES_TP);
      expect(vo.isTarjetaPresente()).toBe(true);
      expect(vo.supportsAggregatorSchemes()).toBe(true);
    });

    it('NO soporta capa AN5822 (excluido por ser TP — consistente con API_PW2/Interredes)', () => {
      const vo = new IntegrationTypeValueObject(IntegrationType.AGREGADORES_INTEGRADORES_TP);
      expect(vo.supportsLayer(ValidationLayer.AN5822)).toBe(false);
    });
  });
});

describe('Layer configs v5 — cambios clave', () => {
  describe('layer-an5822', () => {
    it('productMapping: ECOMMERCE firstCIT.PAYMENT_IND === "U"', () => {
      expect((layerAn5822 as any)._meta.productMapping.ECOMMERCE_TRADICIONAL.firstCIT.PAYMENT_IND).toBe('U');
    });

    it('productMapping: CARGOS_PERIODICOS_POST firstCIT.PAYMENT_IND === "R"', () => {
      expect((layerAn5822 as any)._meta.productMapping.CARGOS_PERIODICOS_POST.firstCIT.PAYMENT_IND).toBe('R');
    });

    it('CARGOS subseqMIT requiere COF=4', () => {
      expect((layerAn5822 as any)._meta.productMapping.CARGOS_PERIODICOS_POST.subseqMIT.COF).toBe('4');
    });

    it('los 3 flujos firstCIT / subseqCIT / subseqMIT existen', () => {
      const sections = Object.keys((layerAn5822 as any).an5822 ?? {});
      expect(sections).toEqual(expect.arrayContaining(['firstCIT', 'subseqCIT', 'subseqMIT']));
    });
  });

  describe('layer-3ds', () => {
    const l = layer3ds as any;
    it('ECI tiene validValuesByBrand con sets VISA/MC/AMEX', () => {
      const eci = l.threedsResponse?.ECI ?? l.threeds?.ECI;
      expect(eci?.validValuesByBrand?.VISA).toEqual(['05', '06', '07']);
      expect(eci?.validValuesByBrand?.MC).toEqual(['01', '02']);
      expect(eci?.validValuesByBrand?.AMEX).toEqual(['05', '06', '07']);
    });

    it('CERTIFICACION_3D en envío con fixedValue 03 (no confundir con STATUS_3D de retorno)', () => {
      expect(l.threeds?.CERTIFICACION_3D?.fixedValue).toBe('03');
    });

    it('STATUS_3D en retorno (no en envío)', () => {
      expect(l.threedsResponse?.STATUS_3D).toBeDefined();
      expect(l.threeds?.STATUS_3D).toBeUndefined();
    });
  });

  describe('layer-cybersource', () => {
    const l = layerCybersource as any;
    it('Card_cardType sin AMEX (solo 001 VISA y 002 MC)', () => {
      expect(l.cybersource.Card_cardType.validValues).toEqual(['001', '002']);
    });

    it('MerchantID fijo "banorteixe"', () => {
      expect(l.cybersource.MerchantID.fixedValue).toBe('banorteixe');
    });
  });
});

describe('response-rules v5', () => {
  const r = responseRules as any;

  it('PAYW_RESULT incluye "Z" (reversa automática por timeout)', () => {
    expect(r.PAYW_RESULT.validValues).toContain('Z');
  });

  it('ID_AGREGADOR existe (rename desde AGGREGATOR_REF)', () => {
    expect(r.ID_AGREGADOR).toBeDefined();
    expect(r.AGGREGATOR_REF).toBeUndefined();
  });
});

describe('IntegrationType.supportedLayers — cobertura capas transversales', () => {
  it('Agregadores CE incluye CYBERSOURCE (gap Fase 4.2.3 arreglado)', () => {
    const vo = new IntegrationTypeValueObject(IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO);
    expect(vo.supportsLayer(ValidationLayer.CYBERSOURCE)).toBe(true);
    expect(vo.supportsLayer(ValidationLayer.THREEDS)).toBe(true);
    expect(vo.supportsLayer(ValidationLayer.AN5822)).toBe(true);
  });

  it('Agregadores CP NO incluye THREEDS ni CYBERSOURCE', () => {
    const vo = new IntegrationTypeValueObject(IntegrationType.AGREGADORES_CARGOS_PERIODICOS);
    expect(vo.supportsLayer(ValidationLayer.THREEDS)).toBe(false);
    expect(vo.supportsLayer(ValidationLayer.CYBERSOURCE)).toBe(false);
    expect(vo.supportsLayer(ValidationLayer.AN5822)).toBe(true);
  });

  it('API PW2 Seguro e Interredes NO incluyen AN5822 (TP)', () => {
    expect(new IntegrationTypeValueObject(IntegrationType.API_PW2_SEGURO).supportsLayer(ValidationLayer.AN5822)).toBe(false);
    expect(new IntegrationTypeValueObject(IntegrationType.INTERREDES_REMOTO).supportsLayer(ValidationLayer.AN5822)).toBe(false);
  });
});
