import { IntegrationType } from '../value-objects/IntegrationType';
import { FieldRule } from '../value-objects/FieldRequirement';
import { FieldSpec, MandatoryFieldsMatrix, TransactionKey } from '../value-objects/MandatoryFieldsMatrix';

/**
 * Extra validation sections (beyond `servlet`). `an5822` is not here because
 * its matrix is double-keyed (CIT/MIT) and has its own accessors.
 */
export type ExtraSection = 'threeds' | 'cybersource';

export interface MandatoryFieldsPort {
  /** Returns the full matrix for a product. */
  getMatrix(integrationType: IntegrationType): MandatoryFieldsMatrix;

  /** Returns all servlet logNames (excluding `_`-prefixed meta keys). */
  getServletLogNames(integrationType: IntegrationType): string[];

  /** Returns the full field spec for a servlet logName, or undefined. */
  getServletFieldSpec(integrationType: IntegrationType, logName: string): FieldSpec | undefined;

  /**
   * Returns the rule for a given servlet field on a given transaction+brand key.
   * Defaults to `N/A` when the field or the key is absent.
   */
  getServletFieldRule(
    integrationType: IntegrationType,
    transactionKey: TransactionKey,
    logName: string,
  ): FieldRule;

  /** Whether the product has non-empty rules for the given extra section. */
  hasExtraSection(integrationType: IntegrationType, section: ExtraSection): boolean;

  /** logNames for the given extra section. */
  getExtraLogNames(integrationType: IntegrationType, section: ExtraSection): string[];

  /** FieldSpec for a logName inside an extra section. */
  getExtraFieldSpec(
    integrationType: IntegrationType,
    section: ExtraSection,
    logName: string,
  ): FieldSpec | undefined;

  /** Rule for a logName under a given transaction+brand key inside an extra section. */
  getExtraFieldRule(
    integrationType: IntegrationType,
    section: ExtraSection,
    transactionKey: TransactionKey,
    logName: string,
  ): FieldRule;
}
