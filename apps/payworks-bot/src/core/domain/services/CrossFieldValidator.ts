import { FieldValidationResult } from '../entities/ValidationResult';
import { ValidationLayer } from '../value-objects/ValidationLayer';

interface LogEntity {
  hasField(name: string): boolean;
  getField(name: string): string | undefined;
}

export interface CrossValidationIssue {
  field: string;
  rule: string;
  detail: string;
  layer: ValidationLayer;
}

export class CrossFieldValidator {
  private issues: CrossValidationIssue[] = [];

  validateXidCavvConditional(threeDSLog: LogEntity | undefined): void {
    if (!threeDSLog) return;
    for (const field of ['XID', 'CAVV']) {
      if (threeDSLog.hasField(field)) {
        const val = threeDSLog.getField(field);
        if (val !== undefined && val.trim() === '') {
          this.issues.push({
            field,
            rule: 'XID/CAVV no deben enviarse vacíos (manual 3DS v1.4)',
            detail: `${field} está presente pero vacío — no debe enviarse`,
            layer: ValidationLayer.THREEDS,
          });
        }
      }
    }
  }

  validatePostAuthRequiresAuthCode(
    transactionType: string,
    servletRequest: LogEntity,
    previousResponses: LogEntity[],
  ): void {
    if (transactionType !== 'POSTAUTH') return;
    const authCode = servletRequest.getField('AUTH_CODE') ?? servletRequest.getField('CODIGO_AUT');
    if (!authCode || authCode.trim() === '') {
      const foundInPrevious = previousResponses.some(r =>
        r.hasField('AUTH_CODE') || r.hasField('CODIGO_AUT'),
      );
      if (!foundInPrevious) {
        this.issues.push({
          field: 'AUTH_CODE',
          rule: 'POSTAUTH requiere AUTH_CODE de PREAUTH previo',
          detail: 'No se encontró AUTH_CODE en request ni en respuestas previas de la sesión',
          layer: ValidationLayer.SERVLET,
        });
      }
    }
  }

  validateProsaReferenceMatch(
    servletResponse: LogEntity | undefined,
    prosaResponse: LogEntity | undefined,
  ): void {
    if (!servletResponse || !prosaResponse) return;
    const servletRef = servletResponse.getField('REFERENCE') ?? servletResponse.getField('REFERENCIA');
    const prosaField37 = prosaResponse.getField('37');
    if (servletRef && prosaField37 && servletRef.trim() !== prosaField37.trim()) {
      this.issues.push({
        field: 'REFERENCE↔Campo37',
        rule: 'REFERENCIA del servlet debe coincidir con Campo 37 de PROSA',
        detail: `Servlet: "${servletRef}", PROSA Campo 37: "${prosaField37}"`,
        layer: ValidationLayer.SERVLET,
      });
    }
  }

  validateCybersourceDecisionFlow(cybersourceLog: LogEntity | undefined): void {
    if (!cybersourceLog) return;
    const decision = cybersourceLog.getField('decision');
    if (decision && !['ACCEPT', 'REVIEW', 'REJECT', 'ERROR'].includes(decision)) {
      this.issues.push({
        field: 'decision',
        rule: 'Decision Cybersource debe ser ACCEPT|REVIEW|REJECT|ERROR',
        detail: `Valor recibido: "${decision}"`,
        layer: ValidationLayer.CYBERSOURCE,
      });
    }
  }

  validateShipToCountryMatch(
    cybersourceLog: LogEntity | undefined,
    servletRequest: LogEntity | undefined,
  ): void {
    if (!cybersourceLog || !servletRequest) return;
    const shipCountry = cybersourceLog.getField('ShipTo_country');
    const terminalCountry = servletRequest.getField('TERMINAL_COUNTRY');
    if (shipCountry && terminalCountry && shipCountry.trim() !== terminalCountry.trim()) {
      this.issues.push({
        field: 'ShipTo_country↔TERMINAL_COUNTRY',
        rule: 'País de envío Cybersource debe coincidir con país del terminal',
        detail: `ShipTo_country: "${shipCountry}", TERMINAL_COUNTRY: "${terminalCountry}"`,
        layer: ValidationLayer.CYBERSOURCE,
      });
    }
  }

  validateResponseFields(
    servletResponse: LogEntity | undefined,
    expectedResults: { field: string; validValues: string[] }[],
  ): void {
    if (!servletResponse) return;
    for (const { field, validValues } of expectedResults) {
      const value = servletResponse.getField(field);
      if (value && !validValues.includes(value.trim())) {
        this.issues.push({
          field,
          rule: `Campo de respuesta ${field} debe estar en [${validValues.join(', ')}]`,
          detail: `Valor recibido: "${value.trim()}"`,
          layer: ValidationLayer.SERVLET,
        });
      }
    }
  }

  getIssues(): CrossValidationIssue[] {
    return [...this.issues];
  }

  toFieldValidationResults(): FieldValidationResult[] {
    return this.issues.map(issue => ({
      field: issue.field,
      rule: 'R',
      found: true,
      value: issue.detail,
      verdict: 'FAIL' as const,
      failReason: 'cross_field',
      failDetail: issue.rule,
      source: 'SERVLET' as const,
      layer: issue.layer,
    }));
  }
}

export class UniqueValidator {
  private seen = new Map<string, number>();
  private duplicates: Array<{ key: string; occurrences: number }> = [];

  addTransaction(controlNumber: string, merchantId: string): void {
    const key = `${merchantId}:${controlNumber}`;
    const count = (this.seen.get(key) ?? 0) + 1;
    this.seen.set(key, count);
    if (count === 2) {
      this.duplicates.push({ key, occurrences: count });
    }
  }

  getDuplicates(): Array<{ key: string; occurrences: number }> {
    return this.duplicates.map(d => ({
      ...d,
      occurrences: this.seen.get(d.key) ?? d.occurrences,
    }));
  }

  hasDuplicates(): boolean {
    return this.duplicates.length > 0;
  }

  toFieldValidationResults(): FieldValidationResult[] {
    return this.getDuplicates().map(dup => ({
      field: 'CONTROL_NUMBER+MERCHANT_ID',
      rule: 'R' as const,
      found: true,
      value: dup.key,
      verdict: 'FAIL' as const,
      failReason: 'duplicate',
      failDetail: `Combinación ${dup.key} aparece ${dup.occurrences} veces — debe ser única`,
      source: 'SERVLET' as const,
      layer: ValidationLayer.SERVLET,
    }));
  }
}
