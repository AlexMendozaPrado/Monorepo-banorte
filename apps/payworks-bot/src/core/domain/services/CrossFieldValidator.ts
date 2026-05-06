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

  /**
   * C13 — `REFERENCE_3D` y `NUMERO_CONTROL` deben coincidir.
   *
   * Regla E5 de la revisión Ramsses (REVISIÓN DE REGLAS DE VALIDACIÓN BOT
   * DE CERTIFICACIÓN PAYWORKS, abr-2026):
   *   "Siempre deben de ser iguales los valores de las variables
   *   REFERENCE_3D y la variable NÚMERO DE CONTROL de Payworks"
   *
   * Aplica solo cuando la transacción incluye 3DS. La fuente de
   * `REFERENCE_3D` puede estar en el servlet (campo `REFERENCE3D` /
   * `REFERENCIA3D` enviado por el comercio) o en el log 3DS oficial
   * (campo `Reference3D`). Se prefiere el del servlet porque ése es el
   * que el comercio efectivamente envió a Payworks; el log 3DS sirve
   * como fallback.
   *
   * Si ninguno de los dos identifica los campos, la regla es N/A
   * (transacción sin 3DS).
   */
  validateReference3DEqualsControlNumber(
    servletRequest: LogEntity | undefined,
    threeDSLog: LogEntity | undefined,
  ): void {
    if (!servletRequest) return;

    const reference3D =
      servletRequest.getField('REFERENCE3D') ??
      servletRequest.getField('REFERENCIA3D') ??
      threeDSLog?.getField('Reference3D') ??
      threeDSLog?.getField('REFERENCE3D');
    const controlNumber =
      servletRequest.getField('CONTROL_NUMBER') ??
      servletRequest.getField('NUMERO_CONTROL');

    // N/A: transacción sin 3DS o servlet sin CONTROL_NUMBER (el segundo
    // caso lo cubren las reglas mandatorias del producto).
    if (!reference3D || !controlNumber) return;

    if (reference3D.trim() !== controlNumber.trim()) {
      this.issues.push({
        field: 'REFERENCE3D↔CONTROL_NUMBER',
        rule: 'C13: REFERENCE_3D y NUMERO_CONTROL deben coincidir (E5 revisión Ramsses 2026)',
        detail: `REFERENCE3D: "${reference3D.trim()}", CONTROL_NUMBER: "${controlNumber.trim()}"`,
        layer: ValidationLayer.THREEDS,
        source: 'THREEDS',
      });
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

  /**
   * Valida que la mensajería de Tokenización Token de Red (ADDENDUM I V1.2)
   * sea consistente con la marca: VISA usa TAVV, MC usa TR_ID + AAV. Una
   * mezcla cruzada (e.g. VISA enviando AAV) no es semánticamente válida.
   *
   * Sólo activa cuando hay marcadores de tokenización presentes — para
   * transacciones no-tokenizadas no produce issues.
   */
  validateTokenizacionBrandConsistency(
    cardBrand: string,
    servletRequest: LogEntity | undefined,
  ): void {
    if (!servletRequest) return;
    const hasTAVV = servletRequest.hasField('TAVV');
    const hasTRID = servletRequest.hasField('TR_ID');
    const hasAAV = servletRequest.hasField('AAV');

    if (!hasTAVV && !hasTRID && !hasAAV) return;

    if (cardBrand === 'VISA' && (hasTRID || hasAAV)) {
      this.issues.push({
        field: hasTRID ? 'TR_ID' : 'AAV',
        rule: 'Tokenización: VISA usa TAVV (no TR_ID/AAV — esos son MC)',
        detail: `Transacción VISA tokenizada no debe enviar ${hasTRID ? 'TR_ID' : 'AAV'} (criptograma exclusivo de MC). Manual ADDENDUM I V1.2 p.4.`,
        layer: ValidationLayer.TOKENIZACION,
        source: 'TOKENIZACION',
      });
    }
    if (cardBrand === 'MC' && hasTAVV) {
      this.issues.push({
        field: 'TAVV',
        rule: 'Tokenización: MC usa TR_ID + AAV (no TAVV — ese es VISA)',
        detail: 'Transacción MC tokenizada no debe enviar TAVV (criptograma exclusivo de VISA). Manual ADDENDUM I V1.2 p.4.',
        layer: ValidationLayer.TOKENIZACION,
        source: 'TOKENIZACION',
      });
    }
  }

  /**
   * C14 — Variables MIT/CIT no se mezclan entre productos.
   *
   * Regla F de la revisión Ramsses (REVISIÓN DE REGLAS DE VALIDACIÓN BOT
   * DE CERTIFICACIÓN PAYWORKS, abr-2026):
   *
   *   "Se tiene que validar que no se mezclen las variables de MIT/CIT
   *   entre los tipos de producto, (ejemplo en Comercio Electrónico no
   *   pueden enviar la variable IND_PAGO = 'R' ya que esta es solo para
   *   Cargos Recurrentes), otro ejemplo es que en Comercio Electrónico
   *   no deben de enviar la variable COF = 4 por que esto es solo para
   *   Cargos Recurrente, se rechazaría la certificación."
   *
   * Implementación: si el producto NO es de Cargos Recurrentes y el
   * servlet contiene `PAYMENT_IND='R'` o `COF='4'`, emite un issue.
   *
   * Aceptamos alias en español (`IND_PAGO`) por compatibilidad con
   * comercios que reusan nombres del manual en su mensajería.
   *
   * Productos de Cargos Recurrentes (whitelist):
   *   - CARGOS_PERIODICOS_POST
   *   - AGREGADORES_CARGOS_PERIODICOS
   *
   * No usamos el An5822FlowDetector aquí porque esto es prevención de
   * mezcla a nivel producto-variable, no detección de flujo. Si COF=4
   * aparece en CE, falla aunque el comercio "intentara" declarar un
   * flujo subseqMIT — el flujo no debería existir en ese producto.
   */
  validateMitCitProductMix(
    integrationType: string,
    servletRequest: LogEntity | undefined,
  ): void {
    if (!servletRequest) return;

    const recurringProducts = new Set([
      'CARGOS_PERIODICOS_POST',
      'AGREGADORES_CARGOS_PERIODICOS',
    ]);
    if (recurringProducts.has(integrationType)) return; // N/A: producto sí permite MIT/CIT recurrente.

    const indPago =
      servletRequest.getField('PAYMENT_IND') ??
      servletRequest.getField('IND_PAGO');
    if (indPago && indPago.trim() === 'R') {
      this.issues.push({
        field: 'PAYMENT_IND',
        rule: `C14: PAYMENT_IND='R' (Cargo Recurrente) no debe aparecer en producto ${integrationType}`,
        detail: `Valor 'R' es exclusivo de Cargos Recurrentes (CARGOS_PERIODICOS_POST / AGREGADORES_CARGOS_PERIODICOS). Revisión Ramsses regla F (abr-2026).`,
        layer: ValidationLayer.AN5822,
      });
    }

    const cof = servletRequest.getField('COF');
    if (cof && cof.trim() === '4') {
      this.issues.push({
        field: 'COF',
        rule: `C14: COF='4' (Cargo Recurrente subseqMIT) no debe aparecer en producto ${integrationType}`,
        detail: `Valor '4' es exclusivo de Cargos Recurrentes (CARGOS_PERIODICOS_POST / AGREGADORES_CARGOS_PERIODICOS). Revisión Ramsses regla F (abr-2026).`,
        layer: ValidationLayer.AN5822,
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
      // FIX (Fase F.1): los issues cross-field no tienen un valor de campo
      // observable (la falla es sobre la relación entre dos campos). Antes
      // poníamos `issue.detail` aquí, lo que mostraba el mensaje de error
      // como si fuera el valor del campo en el UI — confundía al usuario
      // (e.g. AUTH_CODE en POSTAUTH mostraba "No se encontró AUTH_CODE..."
      // como si ese fuera el valor real del campo). El detalle pertenece a
      // `failDetail`; el `value` queda undefined para indicar que no hay
      // valor observable atribuible.
      value: undefined,
      verdict: 'FAIL' as const,
      failReason: 'cross_field',
      // El detalle ahora combina la regla violada y el diagnóstico
      // específico del caso, en orden lógico para el lector.
      failDetail: `${issue.rule} — ${issue.detail}`,
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
