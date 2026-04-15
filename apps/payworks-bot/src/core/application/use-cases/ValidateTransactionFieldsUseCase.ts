import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { FieldRequirementValueObject } from '@/core/domain/value-objects/FieldRequirement';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { ProsaLogEntity } from '@/core/domain/entities/ProsaLog';
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
}

/**
 * Builds the `${TransactionType}_${CardBrand}` key used by the logName-indexed
 * matrices to lookup the rule for a given field.
 */
export function buildTransactionKey(type: TransactionType, brand: CardBrand): string {
  return `${type}_${brand}`;
}

export class ValidateTransactionFieldsUseCase {
  constructor(
    private readonly mandatoryFields: MandatoryFieldsPort,
  ) {}

  execute(command: ValidateFieldsCommand): ValidationResultEntity {
    const transactionKey = buildTransactionKey(command.transactionType, command.cardBrand);

    const logNames = this.mandatoryFields.getServletLogNames(command.integrationType);
    const fieldResults: FieldValidationResult[] = [];

    for (const logName of logNames) {
      const spec = this.mandatoryFields.getServletFieldSpec(command.integrationType, logName);
      const rule = spec?.rules[transactionKey] ?? 'N/A';

      const found = command.servletRequest.hasField(logName);
      const value = command.servletRequest.getField(logName);

      const requirement = new FieldRequirementValueObject(rule);
      const passes = requirement.evaluate(found, value);

      fieldResults.push({
        field: logName,
        manualName: spec?.manualName,
        displayName: spec?.displayName,
        rule,
        found,
        value,
        verdict: passes ? 'PASS' : 'FAIL',
        source: 'SERVLET',
      });
    }

    return new ValidationResultEntity(
      command.transactionRef,
      command.transactionType,
      command.cardBrand,
      fieldResults,
    );
  }
}
