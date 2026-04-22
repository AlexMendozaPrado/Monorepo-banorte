import { IntegrationType } from '../value-objects/IntegrationType';

export interface RateLimitInput {
  transactionRef: string;
  timestamp: Date;
}

export interface RateLimitViolation {
  /** Timestamps del inicio y fin de la ventana violada. */
  windowStart: Date;
  windowEnd: Date;
  /** Referencias de las transacciones dentro de la ventana (>200). */
  transactionRefs: string[];
  detail: string;
}

const APPLICABLE_PRODUCTS: ReadonlySet<IntegrationType> = new Set([
  IntegrationType.CARGOS_PERIODICOS_POST,
  IntegrationType.AGREGADORES_CARGOS_PERIODICOS,
]);

/**
 * Manual Cargos Periódicos Post v2.1 y Agregadores CP v2.6.4:
 * *"Si la aplicación del comercio envía las transacciones de forma
 * secuencial, deberá controlar el volumen de envío a no más de 200
 * transacciones por minuto."*
 *
 * Validador puro: barre la lista ordenada por timestamp y verifica
 * con ventana deslizante de 60 segundos. Retorna solo la primera
 * violación detectada (la segunda reportaría ruido sobre el mismo
 * síntoma — ver spec §6.7).
 *
 * Solo aplica a productos de cargos periódicos; para el resto retorna
 * `[]` sin evaluar nada.
 */
export class RateLimitValidator {
  private static readonly WINDOW_MS = 60_000;
  private static readonly MAX_PER_WINDOW = 200;

  validate(input: {
    product: IntegrationType;
    transactions: RateLimitInput[];
  }): RateLimitViolation[] {
    if (!APPLICABLE_PRODUCTS.has(input.product)) return [];
    if (input.transactions.length <= RateLimitValidator.MAX_PER_WINDOW) return [];

    const sorted = [...input.transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    for (let i = 0; i + RateLimitValidator.MAX_PER_WINDOW < sorted.length; i++) {
      const start = sorted[i].timestamp;
      const endCandidate = sorted[i + RateLimitValidator.MAX_PER_WINDOW].timestamp;
      const spanMs = endCandidate.getTime() - start.getTime();
      if (spanMs < RateLimitValidator.WINDOW_MS) {
        const windowEnd = new Date(start.getTime() + RateLimitValidator.WINDOW_MS);
        const within = sorted
          .filter(t => t.timestamp >= start && t.timestamp < windowEnd)
          .map(t => t.transactionRef);
        return [{
          windowStart: start,
          windowEnd,
          transactionRefs: within,
          detail:
            `Rate limit excedido: ${within.length} transacciones entre ` +
            `${start.toISOString()} y ${windowEnd.toISOString()}. ` +
            'Manual limita a 200 tx/min en Cargos Periódicos.',
        }];
      }
    }

    return [];
  }
}
