import { IntegrationType } from '../value-objects/IntegrationType';

/**
 * Reglas de contenido del **Anexo D** (Manual Agregadores v2.6.4 §Anexo D).
 * Solo aplican a los 2 productos de agregadores — se ignoran en TNP/TP
 * regular.
 *
 * Charset base (todos los campos con Anexo D):
 *   - Permitidos: `A-Z`, `0-9`, `&`, espacio.
 *   - Prohibidos: dobles espacios, espacio al inicio, `Ñ/ñ`, acentos,
 *     caracteres de símbolos adicionales.
 *
 * Excepciones documentadas:
 *   - `SUB_MERCHANT`: formato estricto `^[A-Z0-9&]{7}\*[A-Z0-9&]{14}$`
 *     (el `*` separa los 7 chars de identificador de agregador de los
 *     14 chars de sub-afiliado).
 *   - `DOMICILIO_COMERCIO`: además permite `.`.
 *
 * Reportes con `field`, `reason` y `detail` para que el orquestador
 * materialice el `FieldValidationResult`.
 */
export interface AnexoDFailure {
  field: string;
  reason: 'anexo_d_format' | 'anexo_d_chars' | 'anexo_d_double_space' | 'anexo_d_leading_space';
  detail: string;
}

const SUB_MERCHANT_FORMAT = /^[A-Z0-9&]{7}\*[A-Z0-9&]{14}$/;
const GENERIC_ALLOWED = /^[A-Z0-9& ]+$/;
const DOMICILIO_ALLOWED = /^[A-Z0-9& .]+$/;
const DOUBLE_SPACE = / {2,}/;

const AGGREGATOR_PRODUCTS: ReadonlySet<IntegrationType> = new Set([
  IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
  IntegrationType.AGREGADORES_CARGOS_PERIODICOS,
  IntegrationType.AGREGADORES_INTEGRADORES_TP,
]);

/**
 * Campos sujetos a charset genérico + chequeo de espacios. `SUB_MERCHANT`
 * y `DOMICILIO_COMERCIO` se manejan aparte por su formato específico.
 */
const GENERIC_FIELDS = [
  'ID_AGREGADOR',
  'CIUDAD_TERMINAL',
  'ESTADO_TERMINAL',
  'PAIS_TERMINAL',
] as const;

/**
 * Servicio puro, sin estado ni I/O. La aplicación lo invoca por
 * transacción entregando el producto y un mapa de campos observados.
 */
export class AnexoDValidator {
  validate(input: {
    product: IntegrationType;
    fields: Record<string, string | undefined>;
  }): AnexoDFailure[] {
    if (!AGGREGATOR_PRODUCTS.has(input.product)) return [];

    const failures: AnexoDFailure[] = [];
    const { fields } = input;

    const subMerchant = fields.SUB_MERCHANT;
    if (subMerchant && subMerchant.trim() !== '') {
      if (!SUB_MERCHANT_FORMAT.test(subMerchant)) {
        failures.push({
          field: 'SUB_MERCHANT',
          reason: 'anexo_d_format',
          detail:
            `Anexo D: SUB_MERCHANT="${subMerchant}" no cumple formato 7*14. ` +
            'Debe ser 7 chars A-Z/0-9/& + "*" + 14 chars A-Z/0-9/&.',
        });
      }
    }

    for (const fname of GENERIC_FIELDS) {
      const value = fields[fname];
      if (!value || value === '') continue;
      failures.push(...this.checkGenericField(fname, value));
    }

    const domicilio = fields.DOMICILIO_COMERCIO;
    if (domicilio && domicilio !== '') {
      failures.push(...this.checkDomicilioField(domicilio));
    }

    return failures;
  }

  private checkGenericField(fname: string, value: string): AnexoDFailure[] {
    const out: AnexoDFailure[] = [];
    if (value.startsWith(' ')) {
      out.push({
        field: fname,
        reason: 'anexo_d_leading_space',
        detail: `Anexo D: ${fname}="${value}" no debe comenzar con espacio.`,
      });
    }
    if (DOUBLE_SPACE.test(value)) {
      out.push({
        field: fname,
        reason: 'anexo_d_double_space',
        detail: `Anexo D: ${fname}="${value}" contiene espacios consecutivos.`,
      });
    }
    if (!GENERIC_ALLOWED.test(value)) {
      out.push({
        field: fname,
        reason: 'anexo_d_chars',
        detail:
          `Anexo D: ${fname}="${value}" contiene caracteres no permitidos. ` +
          'Charset permitido: A-Z, 0-9, &, espacio.',
      });
    }
    return out;
  }

  private checkDomicilioField(value: string): AnexoDFailure[] {
    const out: AnexoDFailure[] = [];
    if (value.startsWith(' ')) {
      out.push({
        field: 'DOMICILIO_COMERCIO',
        reason: 'anexo_d_leading_space',
        detail: `Anexo D: DOMICILIO_COMERCIO="${value}" no debe comenzar con espacio.`,
      });
    }
    if (DOUBLE_SPACE.test(value)) {
      out.push({
        field: 'DOMICILIO_COMERCIO',
        reason: 'anexo_d_double_space',
        detail: `Anexo D: DOMICILIO_COMERCIO="${value}" contiene espacios consecutivos.`,
      });
    }
    if (!DOMICILIO_ALLOWED.test(value)) {
      out.push({
        field: 'DOMICILIO_COMERCIO',
        reason: 'anexo_d_chars',
        detail:
          `Anexo D: DOMICILIO_COMERCIO="${value}" contiene caracteres no permitidos. ` +
          'Charset permitido: A-Z, 0-9, &, espacio, punto.',
      });
    }
    return out;
  }
}
