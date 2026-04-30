import { CardBrand } from '../value-objects/CardBrand';
import { IntegrationType } from '../value-objects/IntegrationType';
import {
  An5822ExpectedValues,
  An5822Flow,
  An5822ObservedFields,
  AN5822_APPLICABLE_BRANDS,
  LayerAn5822Config,
} from '../value-objects/An5822Flow';

/**
 * Una falla AN5822 sin acoplarse a `FieldValidationResult`. El
 * orquestador se encarga de materializarla al shape del caso de uso.
 */
export interface An5822FieldFailure {
  /** Nombre del campo en el log (e.g. `PAYMENT_IND`). */
  field: string;
  /** Nombre oficial en el manual (e.g. `IND_PAGO`). */
  manualName: string;
  /** Etiqueta humana. */
  displayName: string;
  /** Valor observado en el log (o `undefined` si ausente). */
  value: string | undefined;
  /** Razón tipada (alineada a `FailReason`). */
  reason: 'invalid_value' | 'missing' | 'prohibited';
  /** Detalle lib­re. */
  detail: string;
}

/**
 * Valida una transacción contra la expectativa AN5822 del producto y flujo
 * resueltos. Consume el `productMapping` del `layer-an5822.json` inyectado
 * en construcción; puro, sin I/O.
 *
 * Para productos o flujos no mapeados (ej. `CARGOS_PERIODICOS_POST` no
 * tiene `subseqCIT`), retorna una falla única señalando el caso. El
 * detector debería haber descartado esas combinaciones antes, pero lo
 * reportamos defensivamente para no silenciar inconsistencias.
 */
export class An5822Validator {
  constructor(private readonly config: LayerAn5822Config) {}

  validate(input: {
    product: IntegrationType;
    flow: An5822Flow;
    brand: CardBrand;
    fields: An5822ObservedFields;
  }): An5822FieldFailure[] {
    const { product, flow, brand, fields } = input;

    if (!AN5822_APPLICABLE_BRANDS.has(brand)) return [];
    if (flow === An5822Flow.NOT_APPLICABLE) return [];

    const productMapping = this.config._meta.productMapping[product];
    const expected: An5822ExpectedValues | undefined = productMapping?.[
      flow as Exclude<An5822Flow, An5822Flow.NOT_APPLICABLE>
    ];

    if (!expected) {
      return [
        {
          field: 'an5822',
          manualName: 'AN5822',
          displayName: 'AN5822 flujo',
          value: undefined,
          reason: 'invalid_value',
          detail: `Producto ${product} no tiene flujo ${flow} declarado en productMapping (AN5822).`,
        },
      ];
    }

    const failures: An5822FieldFailure[] = [];

    failures.push(...this.checkExactValue({
      field: 'PAYMENT_IND',
      manualName: 'IND_PAGO',
      displayName: 'Indicador de Pago',
      observed: fields.PAYMENT_IND,
      expected: expected.PAYMENT_IND,
      context: `${product} / ${flow}`,
    }));

    failures.push(...this.checkEnumValue({
      field: 'AMOUNT_TYPE',
      manualName: 'TIPO_MONTO',
      displayName: 'Tipo de Monto',
      observed: fields.AMOUNT_TYPE,
      allowed: expected.AMOUNT_TYPE,
      context: `${product} / ${flow}`,
    }));

    failures.push(...this.checkExactValue({
      field: 'PAYMENT_INFO',
      manualName: 'INFO_PAGO',
      displayName: 'Información de Pago',
      observed: fields.PAYMENT_INFO,
      expected: expected.PAYMENT_INFO,
      context: `${product} / ${flow}`,
    }));

    failures.push(...this.checkCOF({
      observed: fields.COF,
      expected: expected.COF,
      context: `${product} / ${flow}`,
    }));

    return failures;
  }

  private checkExactValue(args: {
    field: string;
    manualName: string;
    displayName: string;
    observed: string | undefined;
    expected: string;
    context: string;
  }): An5822FieldFailure[] {
    const { field, manualName, displayName, observed, expected, context } = args;
    const trimmed = (observed ?? '').trim();
    if (trimmed === '') {
      return [{
        field, manualName, displayName, value: observed,
        reason: 'missing',
        detail: `Campo requerido por AN5822 en ${context}. Esperado '${expected}'.`,
      }];
    }
    if (trimmed !== expected) {
      const hint = this.findCompatibleProductsHint(field, trimmed);
      return [{
        field, manualName, displayName, value: observed,
        reason: 'invalid_value',
        detail: `En ${context} debe ser '${expected}', recibido '${trimmed}'.${hint}`,
      }];
    }
    return [];
  }

  private checkEnumValue(args: {
    field: string;
    manualName: string;
    displayName: string;
    observed: string | undefined;
    allowed: string[];
    context: string;
  }): An5822FieldFailure[] {
    const { field, manualName, displayName, observed, allowed, context } = args;
    const trimmed = (observed ?? '').trim();
    if (trimmed === '') {
      return [{
        field, manualName, displayName, value: observed,
        reason: 'missing',
        detail: `Campo requerido por AN5822 en ${context}. Esperado uno de [${allowed.join(', ')}].`,
      }];
    }
    if (!allowed.includes(trimmed)) {
      return [{
        field, manualName, displayName, value: observed,
        reason: 'invalid_value',
        detail: `En ${context} debe ser uno de [${allowed.join(', ')}], recibido '${trimmed}'.`,
      }];
    }
    return [];
  }

  private checkCOF(args: {
    observed: string | undefined;
    expected: string | null;
    context: string;
  }): An5822FieldFailure[] {
    const { observed, expected, context } = args;
    const trimmed = (observed ?? '').trim();
    const field = 'COF';
    const manualName = 'COF';
    const displayName = 'Credentials on File';

    if (expected === null) {
      if (trimmed !== '') {
        return [{
          field, manualName, displayName, value: observed,
          reason: 'prohibited',
          detail: `COF no aplica en ${context}. Valor recibido '${trimmed}'.`,
        }];
      }
      return [];
    }

    if (trimmed === '') {
      return [{
        field, manualName, displayName, value: observed,
        reason: 'missing',
        detail: `COF requerido por AN5822 en ${context}. Esperado '${expected}'.`,
      }];
    }
    if (trimmed !== expected) {
      return [{
        field, manualName, displayName, value: observed,
        reason: 'invalid_value',
        detail: `COF en ${context} debe ser '${expected}', recibido '${trimmed}'.`,
      }];
    }
    return [];
  }

  /**
   * Cuando un valor recibido no coincide con la expectativa del producto/flujo
   * actual, recorre el `productMapping` y genera una pista textual con los
   * productos donde ese valor SÍ aplica. Ej: si en `ECOMMERCE_TRADICIONAL /
   * firstCIT` reciben `IND_PAGO=R`, el detalle incluye " (Hint: 'R' aplica a
   * CARGOS_PERIODICOS_POST, AGREGADORES_CARGOS_PERIODICOS)".
   *
   * Devuelve string vacío si el valor no aplica a ningún producto/flujo
   * declarado (e.g. valor totalmente inválido).
   */
  private findCompatibleProductsHint(field: string, value: string): string {
    const mapping = this.config._meta.productMapping;
    const matches = new Set<string>();

    for (const productKey of Object.keys(mapping) as IntegrationType[]) {
      const product = mapping[productKey];
      if (!product) continue;
      for (const flow of Object.keys(product) as Array<
        Exclude<An5822Flow, An5822Flow.NOT_APPLICABLE>
      >) {
        const exp = product[flow];
        if (!exp) continue;
        if (field === 'PAYMENT_IND' && exp.PAYMENT_IND === value) matches.add(productKey);
        if (field === 'PAYMENT_INFO' && exp.PAYMENT_INFO === value) matches.add(productKey);
      }
    }

    if (matches.size === 0) return '';
    return ` (Hint: '${value}' aplica a ${[...matches].join(', ')}, no a este producto.)`;
  }
}
