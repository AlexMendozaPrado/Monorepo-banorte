import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import { FieldRequirementValueObject } from '@/core/domain/value-objects/FieldRequirement';
import {
  FieldSpec,
  MandatoryFieldsMatrix,
  resolveSpecForBrand,
} from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { ProsaLogEntity } from '@/core/domain/entities/ProsaLog';
import { ThreeDSLogEntity } from '@/core/domain/entities/ThreeDSLog';
import { CybersourceLogEntity } from '@/core/domain/entities/CybersourceLog';
import { ValidationResultEntity, FieldValidationResult } from '@/core/domain/entities/ValidationResult';
import { An5822Flow } from '@/core/domain/value-objects/An5822Flow';
import { An5822FlowDetector } from '@/core/domain/services/An5822FlowDetector';
import { An5822Validator, An5822FieldFailure } from '@/core/domain/services/An5822Validator';
import { CrossFieldValidator } from '@/core/domain/services/CrossFieldValidator';
import { AnexoDValidator } from '@/core/domain/services/AnexoDValidator';

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
  /**
   * Matrix Token de Red (ADDENDUM I V1.2). Inyectada por el orquestador.
   * Sólo activa la validación cuando el log servlet contiene TAVV/TR_ID/AAV.
   */
  tokenizacionMatrix?: MandatoryFieldsMatrix;
  /**
   * Flujo AN5822 declarado por la matriz del comercio. `null` si la
   * matriz no trae columna o el valor es N/A. Se usa con prioridad
   * sobre la inferencia heurística por `PAYMENT_INFO`.
   */
  declaredAn5822Flow?: An5822Flow | null;
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
  cardBrand: CardBrand,
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
    const effectiveSpec = resolveSpecForBrand(spec, cardBrand);
    const result = new FieldRequirementValueObject(rule).evaluateDetailed(found, value, effectiveSpec);
    out.push({
      field: logName,
      manualName: spec.manualName,
      displayName: spec.displayName,
      rule,
      found,
      value,
      verdict: result.passes ? 'PASS' : 'FAIL',
      failReason: result.reason,
      failDetail: result.detail,
      source,
      layer,
    });
  }
  return out;
}

export class ValidateTransactionFieldsUseCase {
  constructor(
    private readonly mandatoryFields: MandatoryFieldsPort,
    private readonly an5822Detector?: An5822FlowDetector,
    private readonly an5822Validator?: An5822Validator,
    private readonly anexoDValidator?: AnexoDValidator,
  ) {}

  private buildCrossFieldResults(command: ValidateFieldsCommand): FieldValidationResult[] {
    // Instanciamos por transacción: el validator mantiene estado mutable
    // (`issues`) y su ciclo de vida es per-tx. Las reglas que requieren
    // correlación cross-tx (C7 unique, C8 PRE/POST, rate limit) viven en
    // un nivel superior (RunCertificationUseCase) — no aquí.
    const cross = new CrossFieldValidator();
    cross.validateXidCavvConditional(command.threeDSLog);
    cross.validatePostAuthRequiresAuthCode(
      command.transactionType,
      command.servletRequest,
      [],
    );
    // Adapter: `ProsaLogEntity` expone `campos` por número ISO; el
    // contrato `LogEntity` del validator espera `hasField/getField` por
    // string. Adaptamos inline (campo '37' es el único que C3 consume).
    const prosaAsLog = command.prosaResponse
      ? {
          hasField: (n: string) => command.prosaResponse!.campos.has(Number(n)),
          getField: (n: string) => command.prosaResponse!.getCampo(Number(n)),
        }
      : undefined;
    cross.validateProsaReferenceMatch(command.servletResponse, prosaAsLog);
    cross.validateCybersourceDecisionFlow(command.cybersourceLog);
    cross.validateShipToCountryMatch(command.cybersourceLog, command.servletRequest);
    cross.validateCybersourceIdAndBin(command.servletRequest, command.cybersourceLog);
    // Tokenización (ADDENDUM I V1.2): rechazar mensajería token cruzada
    // entre marcas (VISA con AAV/TR_ID o MC con TAVV).
    cross.validateTokenizacionBrandConsistency(command.cardBrand, command.servletRequest);
    // C12 — PinPad error codes (solo productos TP con errorCodes en su matriz).
    const productMatrix = this.mandatoryFields.getMatrix(command.integrationType);
    cross.validatePinPadErrorCode(command.servletRequest, productMatrix.errorCodes);
    return cross.toFieldValidationResults();
  }

  private buildAnexoDResults(command: ValidateFieldsCommand): FieldValidationResult[] {
    if (!this.anexoDValidator) return [];

    // Los campos candidato a Anexo D se leen del servlet request por su
    // logName. Si el log no los expone, `AnexoDValidator.validate` los
    // trata como ausentes (skip silencioso) — no inventa fallas.
    const observed: Record<string, string | undefined> = {
      SUB_MERCHANT: command.servletRequest.getField('SUB_MERCHANT'),
      ID_AGREGADOR: command.servletRequest.getField('ID_AGREGADOR'),
      CIUDAD_TERMINAL: command.servletRequest.getField('CIUDAD_TERMINAL'),
      ESTADO_TERMINAL: command.servletRequest.getField('ESTADO_TERMINAL'),
      PAIS_TERMINAL: command.servletRequest.getField('PAIS_TERMINAL'),
      DOMICILIO_COMERCIO: command.servletRequest.getField('DOMICILIO_COMERCIO'),
    };

    const failures = this.anexoDValidator.validate({
      product: command.integrationType,
      fields: observed,
    });

    return failures.map(f => ({
      field: f.field,
      manualName: f.field,
      displayName: f.field,
      rule: 'R',
      found: true,
      value: observed[f.field],
      verdict: 'FAIL',
      failReason: f.reason,
      failDetail: f.detail,
      source: 'SERVLET',
      layer: ValidationLayer.AGREGADOR,
    }));
  }

  private buildAn5822Results(command: ValidateFieldsCommand): FieldValidationResult[] {
    if (!this.an5822Detector || !this.an5822Validator) return [];

    const observed = {
      PAYMENT_IND: command.servletRequest.getField('PAYMENT_IND'),
      AMOUNT_TYPE: command.servletRequest.getField('AMOUNT_TYPE'),
      PAYMENT_INFO: command.servletRequest.getField('PAYMENT_INFO'),
      COF: command.servletRequest.getField('COF'),
    };

    const detection = this.an5822Detector.detect({
      declaredFlow: command.declaredAn5822Flow ?? null,
      observedValues: observed,
      brand: command.cardBrand,
      transactionType: command.transactionType,
      product: command.integrationType,
    });

    const results: FieldValidationResult[] = [];

    detection.failures.forEach(detail => {
      results.push({
        field: '_an5822_flow',
        manualName: 'AN5822',
        displayName: 'AN5822 flujo',
        rule: 'R',
        found: true,
        value: observed.PAYMENT_INFO,
        verdict: 'FAIL',
        failReason: 'invalid_value',
        failDetail: detail,
        source: 'AN5822',
        layer: ValidationLayer.AN5822,
      });
    });

    if (detection.flow === An5822Flow.NOT_APPLICABLE) {
      return results;
    }

    const failures: An5822FieldFailure[] = this.an5822Validator.validate({
      product: command.integrationType,
      flow: detection.flow,
      brand: command.cardBrand,
      fields: observed,
    });

    failures.forEach(f => {
      results.push({
        field: f.field,
        manualName: f.manualName,
        displayName: f.displayName,
        rule: 'R',
        found: f.value !== undefined && (f.value ?? '').trim() !== '',
        value: f.value,
        verdict: 'FAIL',
        failReason: f.reason,
        failDetail: f.detail,
        source: 'AN5822',
        layer: ValidationLayer.AN5822,
      });
    });

    return results;
  }

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
      const effectiveSpec = spec ? resolveSpecForBrand(spec, command.cardBrand) : undefined;
      const result = new FieldRequirementValueObject(rule).evaluateDetailed(found, value, effectiveSpec);
      servletResults.push({
        field: logName,
        manualName: spec?.manualName,
        displayName: spec?.displayName,
        rule,
        found,
        value,
        verdict: result.passes ? 'PASS' : 'FAIL',
        failReason: result.reason,
        failDetail: result.detail,
        source: 'SERVLET',
        layer: ValidationLayer.SERVLET,
      });
    }

    // --- Transversal 3D Secure layer ---
    const threeDSResults = validateAgainstSpecMap(
      command.threeDSMatrix?.threeds,
      transactionKey,
      command.cardBrand,
      command.threeDSLog,
      ValidationLayer.THREEDS,
      'THREEDS',
    );

    // --- Transversal Cybersource layer ---
    const cybersourceResults = validateAgainstSpecMap(
      command.cybersourceMatrix?.cybersource,
      transactionKey,
      command.cardBrand,
      command.cybersourceLog,
      ValidationLayer.CYBERSOURCE,
      'CYBERSOURCE',
    );

    // --- Transversal Tokenización Token de Red (ADDENDUM I V1.2) ---
    // Activación condicional: sólo si el log servlet tiene marcadores de
    // tokenización (TAVV/TR_ID/AAV). Evita falsos negativos en transacciones
    // VENTA estándar no-tokenizadas.
    const tokenizacionResults = this.shouldActivateTokenizacion(command.servletRequest)
      ? validateAgainstSpecMap(
          command.tokenizacionMatrix?.tokenizacion,
          transactionKey,
          command.cardBrand,
          command.servletRequest,
          ValidationLayer.TOKENIZACION,
          'TOKENIZACION',
        )
      : [];

    // --- Transversal AN5822 layer (MC-only; no-op for other brands/products) ---
    const an5822Results = this.buildAn5822Results(command);

    // --- Reglas cruzadas per-tx (C3, C5, C11, decision, XID/CAVV, POSTAUTH) ---
    const crossResults = this.buildCrossFieldResults(command);

    // --- Anexo D (Agregadores only; no-op para otros productos) ---
    const anexoDResults = this.buildAnexoDResults(command);

    return new ValidationResultEntity(
      command.transactionRef,
      command.transactionType,
      command.cardBrand,
      [
        ...servletResults,
        ...threeDSResults,
        ...cybersourceResults,
        ...tokenizacionResults,
        ...an5822Results,
        ...crossResults,
        ...anexoDResults,
      ],
    );
  }

  /**
   * La capa Tokenización sólo se valida cuando el log servlet contiene al
   * menos uno de TAVV/TR_ID/AAV. Si ninguno está presente la transacción
   * no es tokenizada y la capa se salta — sin esto, una VENTA VISA estándar
   * fallaría TAVV (R) artificialmente.
   */
  private shouldActivateTokenizacion(servletRequest: ServletLogEntity): boolean {
    return servletRequest.hasField('TAVV')
      || servletRequest.hasField('TR_ID')
      || servletRequest.hasField('AAV');
  }
}
