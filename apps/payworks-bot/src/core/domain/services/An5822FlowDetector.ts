import { CardBrand } from '../value-objects/CardBrand';
import { IntegrationType } from '../value-objects/IntegrationType';
import { TransactionType } from '../value-objects/TransactionType';
import {
  An5822Flow,
  An5822ObservedFields,
  AN5822_APPLICABLE_BRANDS,
  AN5822_EXCLUDED_PRODUCTS,
  AN5822_EXCLUDED_TRANSACTIONS,
} from '../value-objects/An5822Flow';

/**
 * Resultado de la detección: el flujo resuelto + listas separadas de
 * warnings (informativos) y failures (se convierten en FieldValidationResult
 * con `verdict: 'FAIL'` aguas arriba).
 */
export interface An5822DetectionResult {
  flow: An5822Flow;
  warnings: string[];
  failures: string[];
}

/**
 * Decide qué flujo AN5822 aplicar a una transacción. Prioridad:
 *
 *   1. Si la marca / producto / transacción no está cubierta → NOT_APPLICABLE.
 *   2. Si la matriz declara un flujo, se usa. Si además hay observación en
 *      el log que contradice, se emite un **failure** (regla cruzada C10).
 *   3. Si no hay declaración y `PAYMENT_INFO` en el log permite inferir,
 *      se infiere y se emite un warning pidiendo declarar la columna.
 *   4. Si ni declaración ni inferencia fueron posibles → NOT_APPLICABLE
 *      con warning para no bloquear la certificación.
 *
 * Servicio puro: no lee archivos ni tiene estado.
 */
export class An5822FlowDetector {
  detect(args: {
    declaredFlow: An5822Flow | null;
    observedValues: An5822ObservedFields;
    brand: CardBrand;
    transactionType: TransactionType;
    product: IntegrationType;
  }): An5822DetectionResult {
    const { declaredFlow, observedValues, brand, transactionType, product } = args;

    if (!AN5822_APPLICABLE_BRANDS.has(brand)) {
      return { flow: An5822Flow.NOT_APPLICABLE, warnings: [], failures: [] };
    }
    if (AN5822_EXCLUDED_TRANSACTIONS.has(transactionType)) {
      return { flow: An5822Flow.NOT_APPLICABLE, warnings: [], failures: [] };
    }
    if (AN5822_EXCLUDED_PRODUCTS.has(product)) {
      return { flow: An5822Flow.NOT_APPLICABLE, warnings: [], failures: [] };
    }

    const inferredFlow = this.inferFromObserved(observedValues);
    const warnings: string[] = [];
    const failures: string[] = [];

    if (declaredFlow !== null && declaredFlow !== An5822Flow.NOT_APPLICABLE) {
      if (inferredFlow !== null && declaredFlow !== inferredFlow) {
        failures.push(
          `C10: matriz declara flujo AN5822 ${declaredFlow} pero PAYMENT_INFO='${observedValues.PAYMENT_INFO ?? ''}' sugiere ${inferredFlow}.`,
        );
      }
      return { flow: declaredFlow, warnings, failures };
    }

    if (inferredFlow !== null) {
      warnings.push(
        `Flujo AN5822 inferido por PAYMENT_INFO='${observedValues.PAYMENT_INFO}'. Declarar columna flujo_an5822 en la matriz para validación precisa.`,
      );
      return { flow: inferredFlow, warnings, failures };
    }

    warnings.push(
      'No se pudo determinar flujo AN5822 (ni declarado ni inferible). Validación AN5822 omitida.',
    );
    return { flow: An5822Flow.NOT_APPLICABLE, warnings, failures };
  }

  private inferFromObserved(obs: An5822ObservedFields): An5822Flow | null {
    switch (obs.PAYMENT_INFO) {
      case '0':
        return An5822Flow.FIRST_CIT;
      case '3':
        return An5822Flow.SUBSEQ_CIT;
      case '2':
        return An5822Flow.SUBSEQ_MIT;
      default:
        return null;
    }
  }
}
