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
  /**
   * Fuente a reportar en el `FieldValidationResult`. Opcional para
   * mantener retrocompatibilidad — si no se especifica, se asume
   * `'SERVLET'` (el default histórico).
   */
  source?: FieldValidationResult['source'];
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

  /**
   * C11 — Consistencia Cybersource:
   *   C11a: `ID_CYBERSOURCE` del servlet debe coincidir con `requestID`
   *         del retorno Cybersource.
   *   C11b: El BIN (primeros 6 dígitos de `Card_accountNumber` o
   *         `CARD_NUMBER` antes del masking) debe ser consistente con
   *         `Card_cardType` (001 VISA → prefijo 4; 002 MC → rangos
   *         51-55 o 2221-2720). AMEX no aplica porque Cybersource
   *         Banorte no soporta cardType 003.
   *
   * Se reporta con `source: 'CYBERSOURCE'` / `layer: CYBERSOURCE`.
   */
  validateCybersourceIdAndBin(
    servletRequest: LogEntity | undefined,
    cybersourceLog: LogEntity | undefined,
  ): void {
    if (!cybersourceLog) return;

    // --- C11a ---
    if (servletRequest) {
      const idCyber = servletRequest.getField('ID_CYBERSOURCE') ?? servletRequest.getField('CYBERSOURCE_ID');
      const requestID = cybersourceLog.getField('requestID');
      if (idCyber && requestID && idCyber.trim() !== requestID.trim()) {
        this.issues.push({
          field: 'ID_CYBERSOURCE↔requestID',
          rule: 'C11a: ID_CYBERSOURCE del servlet debe coincidir con requestID de Cybersource',
          detail: `Servlet: "${idCyber.trim()}", Cybersource requestID: "${requestID.trim()}"`,
          layer: ValidationLayer.CYBERSOURCE,
          source: 'CYBERSOURCE',
        });
      }
    }

    // --- C11b ---
    const cardNum = cybersourceLog.getField('Card_accountNumber') ?? '';
    const cardType = cybersourceLog.getField('Card_cardType');
    const bin = cardNum.replace(/\D/g, '').substring(0, 6);

    if (bin.length === 6 && cardType) {
      const trimmedType = cardType.trim();
      const isVisaBin = bin.startsWith('4');
      const isMcBin =
        (bin >= '510000' && bin <= '559999') ||
        (bin >= '222100' && bin <= '272099');

      if (trimmedType === '001' && !isVisaBin) {
        this.issues.push({
          field: 'Card_cardType↔BIN',
          rule: 'C11b: Card_cardType=001 (VISA) requiere BIN con prefijo 4',
          detail: `BIN observado: "${bin}"`,
          layer: ValidationLayer.CYBERSOURCE,
          source: 'CYBERSOURCE',
        });
      }
      if (trimmedType === '002' && !isMcBin) {
        this.issues.push({
          field: 'Card_cardType↔BIN',
          rule: 'C11b: Card_cardType=002 (MC) requiere BIN en rangos 51-55 o 2221-2720',
          detail: `BIN observado: "${bin}"`,
          layer: ValidationLayer.CYBERSOURCE,
          source: 'CYBERSOURCE',
        });
      }
    }
  }

  /**
   * C12 — Códigos de error PinPad válidos (Interredes Remoto Anexo VI,
   * API PW2 Seguro §error codes). Si el servlet log expone un campo
   * `ERROR_CODE` (o alias) con un valor no-vacío distinto de `"0"` /
   * `"00"`, comprueba que el código esté documentado en el
   * `errorCodes` del producto. Si no está, emite un issue — señal de
   * que el SDK está devolviendo algo fuera de catálogo.
   *
   * Si `knownErrorCodes` es `undefined` o vacío (producto sin tabla de
   * errores documentada), la regla no corre.
   */
  validatePinPadErrorCode(
    servletRequest: LogEntity | undefined,
    knownErrorCodes: Record<string, string> | undefined,
  ): void {
    if (!servletRequest) return;
    if (!knownErrorCodes || Object.keys(knownErrorCodes).length === 0) return;

    const observed =
      servletRequest.getField('ERROR_CODE') ??
      servletRequest.getField('CODIGO_ERROR') ??
      servletRequest.getField('PINPAD_ERROR');
    if (!observed) return;
    const trimmed = observed.trim();
    if (trimmed === '' || trimmed === '0' || trimmed === '00') return;

    if (!(trimmed in knownErrorCodes)) {
      this.issues.push({
        field: 'ERROR_CODE',
        rule: 'C12: código de error PinPad debe estar documentado en el manual del producto',
        detail: `Código observado: "${trimmed}" no aparece en la tabla del producto.`,
        layer: ValidationLayer.EMV,
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
      source: issue.source ?? 'SERVLET',
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
