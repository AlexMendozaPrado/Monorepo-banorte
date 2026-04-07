import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { FieldRequirementValueObject, FieldRule } from '@/core/domain/value-objects/FieldRequirement';
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

export class ValidateTransactionFieldsUseCase {
  constructor(
    private readonly mandatoryFields: MandatoryFieldsPort,
  ) {}

  execute(command: ValidateFieldsCommand): ValidationResultEntity {
    const typeMap: Record<string, string> = {
      [TransactionType.AUTH]: 'VENTA',
      [TransactionType.VOID]: 'CANCELACION',
      [TransactionType.REFUND]: 'DEVOLUCION',
      [TransactionType.PREAUTH]: 'PREAUTH',
      [TransactionType.POSTAUTH]: 'POSTAUTH',
      [TransactionType.VERIFY]: 'VERIFY',
    };

    const typeName = typeMap[command.transactionType] || command.transactionType;
    const transactionKey = `${typeName}_${command.cardBrand}`;

    const fieldNames = this.mandatoryFields.getServletFieldNames(command.integrationType);
    const fieldResults: FieldValidationResult[] = [];

    for (const fieldName of fieldNames) {
      const rule = this.mandatoryFields.getFieldRule(
        command.integrationType,
        transactionKey,
        fieldName,
      );

      const found = command.servletRequest.hasField(fieldName);
      const value = command.servletRequest.getField(fieldName);

      const requirement = new FieldRequirementValueObject(rule);
      const passes = requirement.evaluate(found, value);

      fieldResults.push({
        field: fieldName,
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
