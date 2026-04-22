import { IntegrationType } from './IntegrationType';
import { FieldRule } from './FieldRequirement';
import { CardBrand } from './CardBrand';

/**
 * Transaction key used to index a field's rule inside `FieldSpec.rules`.
 * Convention: `${TransactionType}_${CardBrand}` — e.g. `AUTH_VISA`, `REVERSAL_MC`.
 *
 * Rationale: differentiation by card brand matters for AN5822 fields (MC-only)
 * and some AMEX-specific fields in Tradicional.
 */
export type TransactionKey = string;

/**
 * Specification of a single field inside a matrix (servlet / layer / sub-scheme).
 *
 * The JSON stored on disk is indexed by `logName` (the actual name that appears
 * in the Payworks/3DS/Cybersource log). `manualName` holds the Spanish
 * name that appears in the official manual, `displayName` is the label shown
 * in the UI.
 */
export interface FieldSpec {
  /** Name in the official Banorte manual (es-MX, e.g. `ID_AFILIACION`). */
  manualName: string;
  /** Human-readable label for the UI (e.g. `ID Afiliación`). */
  displayName: string;
  /** Data type annotation (e.g. `numeric(9)`, `alphanum(25)`). */
  dataType: string;
  /** Whether the mapping (logName vs manual) is still ambiguous / to be confirmed. */
  ambiguous: boolean;
  /** Optional free-form note for the mapping. */
  note?: string;
  /** Rule per transaction+brand key. */
  rules: Record<TransactionKey, FieldRule>;
  /** Maximum length allowed (e.g. 9 for MERCHANT_ID). */
  maxLength?: number;
  /** Regex pattern the value must match (e.g. `"^\\d{1,18}\\.\\d{2}$"` for MONTO). */
  format?: string;
  /** Allowed values — field fails if value is present and NOT in this list. */
  validValues?: string[];
  /**
   * Brand-specific allowed values (narrower than `validValues`). When the
   * transaction brand is a key in this map, the orchestrator projects the
   * spec via {@link resolveSpecForBrand} so the evaluator sees only the
   * per-brand subset. Used by ECI in `layer-3ds.json` (VISA/AMEX→[05,06,07],
   * MC→[01,02]).
   */
  validValuesByBrand?: Partial<Record<CardBrand, string[]>>;
  /** If set, field value must equal this exact string (e.g. VERSION_3D = "2"). */
  fixedValue?: string;
  /** If true, field must contain masked card pattern (e.g. `******`). */
  mustBeMasked?: boolean;
  /** If true, field must NOT be sent when its value is empty/null (inverse of R). */
  omitIfEmpty?: boolean;
}

/**
 * Sub-scheme extra required fields (agregadores only).
 */
export interface SubSchemeSpec {
  /** List of logNames that are required in addition to the base servlet matrix. */
  required: string[];
  /** Optional display label. */
  displayName?: string;
}

/**
 * Root matrix for a product. Keys of `servlet`, `threeds`, `cybersource`
 * are all `logName`. AN5822 is a transversal layer modelled separately in
 * `An5822Flow.ts` / `layer-an5822.json`.
 */
export interface MandatoryFieldsMatrix {
  integrationType: IntegrationType;
  manualVersion: string;
  displayName: string;
  manualDate?: string;
  servlet: Record<string, FieldSpec>;
  threeds?: Record<string, FieldSpec>;
  cybersource?: Record<string, FieldSpec>;
  subEsquemas?: Record<string, SubSchemeSpec>;
}

/**
 * Projects a `FieldSpec` so the evaluator sees brand-scoped `validValues`
 * when `validValuesByBrand` declares values for the given brand. Pure: the
 * source spec is not mutated and, if no narrowing applies, it's returned
 * as-is. Keeps {@link FieldRequirementValueObject.evaluateDetailed} free of
 * brand context — the application layer resolves the projection before
 * invoking the value object.
 */
export function resolveSpecForBrand(spec: FieldSpec, cardBrand: CardBrand): FieldSpec {
  const byBrand = spec.validValuesByBrand?.[cardBrand];
  if (byBrand && byBrand.length > 0) {
    return { ...spec, validValues: byBrand };
  }
  return spec;
}
