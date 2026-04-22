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

    it('ID_GATEWAY: PROHIBITED en VISA/AMEX, O en MC', () => {
      const spec = m.servlet.ID_GATEWAY;
      expect(spec?.rules.AUTH_VISA).toBe('PROHIBITED');
      expect(spec?.rules.AUTH_AMEX).toBe('PROHIBITED');
      expect(spec?.rules.AUTH_MC).toBe('O');
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
