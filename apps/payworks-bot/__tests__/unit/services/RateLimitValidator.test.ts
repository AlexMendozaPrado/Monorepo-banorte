import { RateLimitValidator } from '@/core/domain/services/RateLimitValidator';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';

describe('RateLimitValidator (200 tx/min Cargos Periódicos)', () => {
  const validator = new RateLimitValidator();

  function makeTxs(count: number, startMs: number, deltaMs: number) {
    return Array.from({ length: count }, (_, i) => ({
      transactionRef: `REF-${i.toString().padStart(4, '0')}`,
      timestamp: new Date(startMs + i * deltaMs),
    }));
  }

  describe('ámbito del mandato', () => {
    it.each([
      IntegrationType.ECOMMERCE_TRADICIONAL,
      IntegrationType.MOTO,
      IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
      IntegrationType.API_PW2_SEGURO,
      IntegrationType.INTERREDES_REMOTO,
      IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
    ])('%s no se evalúa (solo aplica a cargos periódicos)', (product) => {
      const txs = makeTxs(1000, Date.now(), 10); // 1000 tx en 10s — todas fuera de alcance
      const v = validator.validate({ product, transactions: txs });
      expect(v).toEqual([]);
    });

    it.each([
      IntegrationType.CARGOS_PERIODICOS_POST,
      IntegrationType.AGREGADORES_CARGOS_PERIODICOS,
    ])('%s sí se evalúa', (product) => {
      const txs = makeTxs(300, 0, 100); // 300 tx en 30s → >200 en 60s
      const v = validator.validate({ product, transactions: txs });
      expect(v.length).toBeGreaterThan(0);
    });
  });

  describe('ventana deslizante', () => {
    const product = IntegrationType.CARGOS_PERIODICOS_POST;

    it('pasa cuando hay exactamente 200 tx en 60s (el límite)', () => {
      const txs = makeTxs(200, 0, 290); // 200 tx en ~58s
      const v = validator.validate({ product, transactions: txs });
      expect(v).toEqual([]);
    });

    it('falla cuando hay 201 tx en < 60s', () => {
      const txs = makeTxs(201, 0, 290); // 201 tx en ~58s
      const v = validator.validate({ product, transactions: txs });
      expect(v).toHaveLength(1);
      expect(v[0].detail).toContain('201');
      expect(v[0].transactionRefs.length).toBeGreaterThan(200);
    });

    it('pasa cuando 300 tx se distribuyen en > 60s/200tx', () => {
      const txs = makeTxs(300, 0, 400); // 300 tx en 120s
      const v = validator.validate({ product, transactions: txs });
      expect(v).toEqual([]);
    });

    it('identifica la ventana violada con timestamps correctos', () => {
      const start = new Date('2026-04-22T12:00:00Z').getTime();
      const txs = makeTxs(250, start, 200); // 250 tx cada 200ms
      const v = validator.validate({ product, transactions: txs });
      expect(v[0].windowStart.getTime()).toBe(start);
      expect(v[0].windowEnd.getTime() - v[0].windowStart.getTime()).toBe(60_000);
    });
  });

  it('no falla con lista vacía ni con <=200 txs', () => {
    expect(validator.validate({ product: IntegrationType.CARGOS_PERIODICOS_POST, transactions: [] })).toEqual([]);
    expect(validator.validate({
      product: IntegrationType.CARGOS_PERIODICOS_POST,
      transactions: makeTxs(100, 0, 100),
    })).toEqual([]);
  });

  it('tolera timestamps desordenados (los re-ordena internamente)', () => {
    const txs = makeTxs(250, 0, 200);
    const shuffled = [...txs].reverse();
    const v = validator.validate({
      product: IntegrationType.CARGOS_PERIODICOS_POST,
      transactions: shuffled,
    });
    expect(v).toHaveLength(1);
  });
});
