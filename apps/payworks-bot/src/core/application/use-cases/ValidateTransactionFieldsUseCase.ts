import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import { FieldRequirementValueObject } from '@/core/domain/value-objects/FieldRequirement';
import { FieldSpec, MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { ProsaLogEntity } from '@/core/domain/entities/ProsaLog';
import { ThreeDSLogEntity } from '@/core/domain/entities/ThreeDSLog';
import { CybersourceLogEntity } from '@/core/domain/entities/CybersourceLog';
import { ValidationResultEntity, FieldValidationResult } from '@/core/domain/entities/ValidationResult';

export interface ValidateFieldsCommand {
  integrationType: IntegrationType;
  transactionType: TransactionType;
  cardBrand: CardBrand;
  transactionRef: string;
  servletRequest: ServletLogEntity;
  servletResponse: ServletLogEntity;
  prosaRequest?: ProsaLogEntity;
  prosaResponse?: ProsaLogEntity;
  /** Optional transversal-layer log entities. Validated only when
   *  the product supports the corresponding layer AND the entity is
   *  present. */
  threeDSLog?: ThreeDSLogEntity;
  cybersourceLog?: CybersourceLogEntity;
  /**
   * Optional transversal matrices. Injected by the orchestrator from
   * the `layer-*.json` files so the use case can validate layer
   * fields without re-opening JSONs.
   */
  threeDSMatrix?: MandatoryFieldsMatrix;
  cybersourceMatrix?: MandatoryFieldsMatrix;
}

/**
 * Builds the `${TransactionType}_${CardBrand}` key used by the logName-indexed
 * matrices to lookup the rule for a given field.
 */
export function buildTransactionKey(type: TransactionType, brand: CardBrand): string {
  return `${type}_${brand}`;
}

/**
 * Generic helper: given a FieldSpec map and a key/value entity, produce
 * one FieldValidationResult per field with the given `layer` and `source`.
 */
function validateAgainstSpecMap(
  specMap: Record<string, FieldSpec> | undefined,
  transactionKey: string,
  entity: { hasField(n: string): boolean; getField(n: string): string | undefined } | undefined,
  layer: ValidationLayer,
  source: FieldValidationResult['source'],
): FieldValidationResult[] {
  if (!specMap || !entity) return [];
  const out: FieldValidationResult[] = [];
  for (const [logName, spec] of Object.entries(specMap)) {
    if (logName.startsWith('_')) continue;
    const rule = spec.rules[transactionKey] ?? 'N/A';
    const found = entity.hasField(logName);
    const value = entity.getField(logName);
    const passes = new FieldRequirementValueObject(rule).evaluate(found, value);
    out.push({
      field: logName,
      manualName: spec.manualName,
      displayName: spec.displayName,
      rule,
      found,
      value,
      verdict: passes ? 'PASS' : 'FAIL',
      source,
      layer,
    });
  }
  return out;
}

export class ValidateTransactionFieldsUseCase {
  constructor(
    private readonly mandatoryFields: MandatoryFieldsPort,
  ) {}

  execute(command: ValidateFieldsCommand): ValidationResultEntity {
    const transactionKey = buildTransactionKey(command.transactionType, command.cardBrand);

    // --- Servlet layer (always validated) ---
    const logNames = this.mandatoryFields.getServletLogNames(command.integrationType);
    const servletResults: FieldValidationResult[] = [];
    for (const logName of logNames) {
      const spec = this.mandatoryFields.getServletFieldSpec(command.integrationType, logName);
      const rule = spec?.rules[transactionKey] ?? 'N/A';
      const found = command.servletRequest.hasField(logName);
      const value = command.servletRequest.getField(logName);
      const passes = new FieldRequirementValueObject(rule).evaluate(found, value);
      servletResults.push({
        field: logName,
        manualName: spec?.manualName,
        displayName: spec?.displayName,
        rule,
        found,
        value,
        verdict: passes ? 'PASS' : 'FAIL',
        source: 'SERVLET',
        layer: ValidationLayer.SERVLET,
      });
    }

    // --- Transversal 3D Secure layer ---
    const threeDSResults = validateAgainstSpecMap(
      command.threeDSMatrix?.threeds,
      transactionKey,
      command.threeDSLog,
      ValidationLayer.THREEDS,
      'THREEDS',
    );

    // --- Transversal Cybersource layer ---
    const cybersourceResults = validateAgainstSpecMap(
      command.cybersourceMatrix?.cybersource,
      transactionKey,
      command.cybersourceLog,
      ValidationLayer.CYBERSOURCE,
      'CYBERSOURCE',
    );

    return new ValidationResultEntity(
      command.transactionRef,
      command.transactionType,
      command.cardBrand,
      [...servletResults, ...threeDSResults, ...cybersourceResults],
    );
  }
}
