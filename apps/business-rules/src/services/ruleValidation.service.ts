/**
 * @file Rule Validation Service
 * @description Integrates XML mapping with existing business rules
 */

import type { RegistroValidacion, EmpleadoNomina } from '../types/xmlValidation.types';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface ValidationResult {
  compliance_status: string;
  risk_level: string;
  summary: string;
  total_records: number;
  compliant_records: number;
  non_compliant_records: number;
  recommendations?: string[];
  auto_corrections?: AutoCorrection[];
  validation_details?: ValidationDetail[];
}

export interface AutoCorrection {
  record_index: number;
  field: string;
  suggested_value: string | number | boolean;
}

export interface ValidationDetail {
  record_index: number;
  field: string;
  status: string;
  message: string;
}

export interface BusinessRule {
  id: number;
  nombre: string;
  descripcion: string;
  regla_estandarizada?: {
    rules?: RuleDefinition[];
  };
}

export interface RuleDefinition {
  conditions: string[];
  actions: string[];
}

export interface FormattedValidation {
  status: string;
  riskLevel: string;
  summary: string;
  totalRecords: number;
  compliantRecords: number;
  nonCompliantRecords: number;
  recommendations: string[];
  autoCorrections: AutoCorrection[];
  details: ValidationDetail[];
}

type TipoOperacion = 'proveedores' | 'nomina';

class RuleValidationService {
  /**
   * Validates mapping data against a business rule using Gemini
   */
  async validateDataWithRule(
    ruleId: number,
    data: RegistroValidacion[] | EmpleadoNomina[],
    tipoOperacion: TipoOperacion
  ): Promise<ValidationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/validate-with-rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule_id: ruleId,
          data: data,
          tipo_operacion: tipoOperacion
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.validation;
    } catch (error) {
      console.error('Error validando datos con regla:', error);
      throw error;
    }
  }

  /**
   * Gets relevant rules for an operation type
   */
  async getRelevantRules(tipoOperacion: TipoOperacion, userId: number): Promise<BusinessRule[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rules/relevant?tipo_operacion=${tipoOperacion}&user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.rules;
    } catch (error) {
      console.error('Error obteniendo reglas relevantes:', error);
      return [];
    }
  }

  /**
   * Applies rule transformations to data
   */
  applyRuleTransformations<T extends Record<string, unknown>>(rule: BusinessRule, data: T[]): T[] {
    if (!rule.regla_estandarizada?.rules) {
      return data;
    }

    const transformedData = data.map(registro => {
      let transformed = { ...registro };

      rule.regla_estandarizada!.rules!.forEach(businessRule => {
        if (this.evaluateConditions(businessRule.conditions, registro)) {
          transformed = this.applyActions(businessRule.actions, transformed);
        }
      });

      return transformed;
    });

    return transformedData;
  }

  /**
   * Evaluates if a record meets rule conditions
   */
  evaluateConditions(conditions: string[], registro: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      const parts = condition.match(/(\w+(?:\.\w+)?)\s*([><=!]+)\s*(.+)/);
      if (!parts) return true;

      const [, field, operator, value] = parts;
      const fieldValue = this.getNestedField(registro, field);

      let compareValue: string | number = value.trim().replace(/['"]/g, '');
      if (!isNaN(Number(compareValue))) {
        compareValue = parseFloat(compareValue);
      }

      switch (operator) {
        case '>': return Number(fieldValue) > Number(compareValue);
        case '<': return Number(fieldValue) < Number(compareValue);
        case '>=': return Number(fieldValue) >= Number(compareValue);
        case '<=': return Number(fieldValue) <= Number(compareValue);
        case '==':
        case '===': return String(fieldValue).toLowerCase() === String(compareValue).toLowerCase();
        case '!=':
        case '!==': return String(fieldValue).toLowerCase() !== String(compareValue).toLowerCase();
        default: return true;
      }
    });
  }

  /**
   * Applies transformation actions to a record
   */
  applyActions<T extends Record<string, unknown>>(actions: string[], registro: T): T {
    if (!actions || actions.length === 0) {
      return registro;
    }

    const transformed = { ...registro } as Record<string, unknown>;

    actions.forEach(action => {
      const assignMatch = action.match(/(\w+(?:\.\w+)?)\s*=\s*(.+)/);
      if (assignMatch) {
        const [, field, value] = assignMatch;

        let parsedValue: string | number | boolean = value.trim().replace(/['"]/g, '');
        if (parsedValue === 'true') parsedValue = true;
        else if (parsedValue === 'false') parsedValue = false;
        else if (!isNaN(Number(parsedValue))) parsedValue = parseFloat(parsedValue);

        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          transformed[parent] = transformed[parent] || {};
          (transformed[parent] as Record<string, unknown>)[child] = parsedValue;
        } else {
          transformed[field] = parsedValue;
        }
      }
    });

    return transformed as T;
  }

  /**
   * Gets nested field value (e.g., "beneficiario.nombre")
   */
  getNestedField(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      return (current as Record<string, unknown>)?.[key];
    }, obj);
  }

  /**
   * Applies automatic corrections suggested by validation
   */
  applyAutoCorrections<T extends Record<string, unknown>>(
    data: T[],
    corrections: AutoCorrection[]
  ): T[] {
    if (!corrections || corrections.length === 0) {
      return data;
    }

    const correctedData = JSON.parse(JSON.stringify(data)) as T[];

    corrections.forEach(correction => {
      const { record_index, field, suggested_value } = correction;

      if (correctedData[record_index]) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          (correctedData[record_index] as Record<string, unknown>)[parent] =
            (correctedData[record_index] as Record<string, unknown>)[parent] || {};
          ((correctedData[record_index] as Record<string, unknown>)[parent] as Record<string, unknown>)[child] = suggested_value;
        } else {
          (correctedData[record_index] as Record<string, unknown>)[field] = suggested_value;
        }
      }
    });

    return correctedData;
  }

  /**
   * Determines if a rule is relevant for the operation type
   */
  isRuleRelevantForOperation(rule: BusinessRule, tipoOperacion: TipoOperacion): boolean {
    if (!rule.regla_estandarizada) {
      return false;
    }

    const ruleText = JSON.stringify(rule).toLowerCase();

    if (tipoOperacion === 'proveedores') {
      return ruleText.includes('proveedor') ||
             ruleText.includes('pago') ||
             ruleText.includes('transferencia') ||
             ruleText.includes('spei') ||
             ruleText.includes('cuenta') ||
             ruleText.includes('beneficiario');
    } else if (tipoOperacion === 'nomina') {
      return ruleText.includes('nomina') ||
             ruleText.includes('nómina') ||
             ruleText.includes('empleado') ||
             ruleText.includes('salario') ||
             ruleText.includes('clabe') ||
             ruleText.includes('rfc') ||
             ruleText.includes('curp');
    }

    return true;
  }

  /**
   * Formats validation result for UI display
   */
  formatValidationForUI(validation: ValidationResult): FormattedValidation {
    return {
      status: validation.compliance_status,
      riskLevel: validation.risk_level,
      summary: validation.summary,
      totalRecords: validation.total_records,
      compliantRecords: validation.compliant_records,
      nonCompliantRecords: validation.non_compliant_records,
      recommendations: validation.recommendations || [],
      autoCorrections: validation.auto_corrections || [],
      details: validation.validation_details || []
    };
  }
}

const ruleValidationService = new RuleValidationService();
export default ruleValidationService;
