import { v4 as uuidv4 } from 'uuid';
import { MatrixParserPort } from '@/core/domain/ports/MatrixParserPort';
import { TransactionRepositoryPort } from '@/core/domain/ports/TransactionRepositoryPort';
import { LogRetrievalPort } from '@/core/domain/ports/LogRetrievalPort';
import { ServletLogParserPort } from '@/core/domain/ports/ServletLogParserPort';
import { ProsaLogParserPort } from '@/core/domain/ports/ProsaLogParserPort';
import { ThreeDSLogParserPort } from '@/core/domain/ports/ThreeDSLogParserPort';
import { CybersourceLogParserPort } from '@/core/domain/ports/CybersourceLogParserPort';
import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { AfiliacionRepositoryPort } from '@/core/domain/ports/AfiliacionRepositoryPort';
import { ValidateTransactionFieldsUseCase } from './ValidateTransactionFieldsUseCase';
import { CertificationSessionEntity, OperationMode } from '@/core/domain/entities/CertificationSession';
import { ValidationResult, FieldValidationResult } from '@/core/domain/entities/ValidationResult';
import { PreAuthPostAuthCorrelator, CorrelationInput } from '@/core/domain/services/PreAuthPostAuthCorrelator';
import { RateLimitValidator } from '@/core/domain/services/RateLimitValidator';
import { FolioGenerator } from '@/core/domain/services/FolioGenerator';
import { ThreeDSLogEntity } from '@/core/domain/entities/ThreeDSLog';
import { CybersourceLogEntity } from '@/core/domain/entities/CybersourceLog';
import { IntegrationType, IntegrationTypeValueObject } from '@/core/domain/value-objects/IntegrationType';
import { LaboratoryType, LaboratoryTypeValueObject } from '@/core/domain/value-objects/LaboratoryType';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';
import { MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';

export interface RunCertificationCommand {
  matrixBuffer: Buffer;
  integrationType: IntegrationType;
  operationMode: OperationMode;
  merchantName?: string;
  coordinadorCertificacion?: string;
  responsableNombre?: string;
  responsableEmail?: string;
  responsableTelefono?: string;
  lenguaje?: string;
  versionAplicacion?: string;
  urlSubdominio?: string;
  /**
   * Banderas opcionales que afectan el folio generado. `isVIP` distingue
   * Comercios Alto Valor; `isRecertification` aplica el sufijo `R`.
   *
   * NOTA (Fase C.4 may-2026): preferir `laboratoryType` cuando esté
   * disponible — deriva `isVIP` y modifier de forma canónica. `isVIP`
   * legacy se mantiene para retrocompatibilidad de tests/scripts.
   */
  isVIP?: boolean;
  isRecertification?: boolean;
  /**
   * Laboratorio seleccionado por el usuario en el form de nueva
   * certificación. Determina la nomenclatura del folio (ver
   * `LaboratoryType.toFolioParams`). Cuando está presente sobrescribe
   * `isVIP` y agrega `modifier` cuando aplique.
   */
  laboratoryType?: LaboratoryType;
}

export class RunCertificationUseCase {
  constructor(
    private readonly matrixParser: MatrixParserPort,
    private readonly transactionRepo: TransactionRepositoryPort,
    private readonly logRetrieval: LogRetrievalPort,
    private readonly servletLogParser: ServletLogParserPort,
    private readonly prosaLogParser: ProsaLogParserPort,
    private readonly fieldValidator: ValidateTransactionFieldsUseCase,
    private readonly certificationRepo: CertificationRepositoryPort,
    private readonly threeDSLogParser: ThreeDSLogParserPort,
    private readonly cybersourceLogParser: CybersourceLogParserPort,
    private readonly afiliacionRepo: AfiliacionRepositoryPort,
    private readonly threeDSMatrix?: MandatoryFieldsMatrix,
    private readonly cybersourceMatrix?: MandatoryFieldsMatrix,
    private readonly preAuthPostAuthCorrelator?: PreAuthPostAuthCorrelator,
    private readonly rateLimitValidator?: RateLimitValidator,
    private readonly tokenizacionMatrix?: MandatoryFieldsMatrix,
    private readonly folioGenerator?: FolioGenerator,
  ) {}

  async execute(command: RunCertificationCommand): Promise<CertificationSessionEntity> {
    const matrixTransactions = await this.matrixParser.parse(command.matrixBuffer);

    if (matrixTransactions.length === 0) {
      throw new Error('La Matriz de Pruebas no contiene transacciones');
    }

    const integrationVO = new IntegrationTypeValueObject(command.integrationType);
    const supports3DS = integrationVO.supportsLayer(ValidationLayer.THREEDS);
    const supportsCS = integrationVO.supportsLayer(ValidationLayer.CYBERSOURCE);

    const results: ValidationResult[] = [];
    let merchantName = command.merchantName || '';

    // Inputs para validaciones cross-tx (C8, rate limit). Se llenan dentro
    // del loop per-tx con datos crudos observados en la matriz + servlet.
    const correlationInputs: CorrelationInput[] = [];
    const rateLimitInputs: { transactionRef: string; timestamp: Date }[] = [];

    for (const txn of matrixTransactions) {
      try {
        const dbRecord = await this.transactionRepo.findByReferencia(txn.referencia);

        if (!dbRecord) {
          throw new Error(`Transaccion con REFERENCIA ${txn.referencia} no encontrada en BD`);
        }

        // Fill merchantName from affiliation file first, then DB record as fallback.
        // The Transaction's `numero` field holds the merchant affiliation id
        // (ID_AFILIACION) — same key used by the affiliations CSV.
        if (!merchantName) {
          const fromAfiliacion = this.afiliacionRepo
            .findByIdAfiliacion(dbRecord.numero ?? '')
            ?.getDisplayLabel();
          merchantName = fromAfiliacion ?? dbRecord.nombre;
        }

        const servletLogContent = await this.logRetrieval.getServletLog(
          dbRecord.paywEntrada,
          dbRecord.fechaRecepCte,
        );

        const prosaLogContent = await this.logRetrieval.getProsaLog(
          dbRecord.paywAutorizador,
          dbRecord.fechaRecepCte,
        );

        const servletLogs = this.servletLogParser.parseByControlNumber(
          servletLogContent,
          dbRecord.numeroControl,
        );

        const typeVO = new TransactionTypeValueObject(txn.tipoTransaccion);
        const prosaLogs = this.prosaLogParser.parseByReferencia(
          prosaLogContent,
          txn.referencia,
          typeVO.getProsaMessagePair(),
        );

        // --- Optional 3DS parsing ---
        let threeDSLog: ThreeDSLogEntity | undefined;
        if (supports3DS && this.logRetrieval.getThreeDSLog) {
          const content = await this.logRetrieval.getThreeDSLog(dbRecord.fechaRecepCte);
          if (content.trim().length > 0) {
            try {
              threeDSLog = this.threeDSLogParser.parseByFolio(content, txn.referencia);
            } catch {
              // Folio not found in 3DS log — treat as missing layer for this txn
              threeDSLog = undefined;
            }
          }
        }

        // --- Optional Cybersource parsing ---
        let cybersourceLog: CybersourceLogEntity | undefined;
        if (supportsCS && this.logRetrieval.getCybersourceLog) {
          const content = await this.logRetrieval.getCybersourceLog(dbRecord.fechaRecepCte);
          if (content.trim().length > 0) {
            try {
              const parsed = this.cybersourceLogParser.parseByOrderId(content, txn.referencia);
              cybersourceLog = parsed.request;
            } catch {
              cybersourceLog = undefined;
            }
          }
        }

        const validation = this.fieldValidator.execute({
          integrationType: command.integrationType,
          transactionType: txn.tipoTransaccion,
          cardBrand: txn.cardBrand,
          transactionRef: txn.referencia,
          servletRequest: servletLogs.request,
          servletResponse: servletLogs.response,
          prosaRequest: prosaLogs.request,
          prosaResponse: prosaLogs.response,
          threeDSLog,
          cybersourceLog,
          threeDSMatrix: this.threeDSMatrix,
          cybersourceMatrix: this.cybersourceMatrix,
          tokenizacionMatrix: this.tokenizacionMatrix,
          declaredAn5822Flow: txn.flujoAn5822 ?? null,
        });

        results.push(validation);

        // Recopilar inputs para las reglas cross-tx que corren al final.
        correlationInputs.push({
          transactionRef: txn.referencia,
          numeroControl: txn.numeroControl,
          transactionType: txn.tipoTransaccion,
          customerRef2: servletLogs.request.getField('CUSTOMER_REF2'),
        });
        rateLimitInputs.push({
          transactionRef: txn.referencia,
          timestamp: servletLogs.request.timestamp,
        });
      } catch (error) {
        console.error(`Error validando transaccion ${txn.referencia}:`, error);
        throw error;
      }
    }

    // --- Cross-tx: C8 CUSTOMER_REF2 PREAUT↔POSTAUT ---
    if (this.preAuthPostAuthCorrelator) {
      const c8Issues = this.preAuthPostAuthCorrelator.correlate(correlationInputs);
      for (const issue of c8Issues) {
        const target = results.find(r => r.transactionRef === issue.postAuthRef);
        if (!target) continue;
        target.fieldResults.push({
          field: 'CUSTOMER_REF2↔PRE/POST',
          rule: 'R',
          found: true,
          value: issue.detail,
          verdict: 'FAIL',
          failReason: 'cross_field',
          failDetail: issue.detail,
          source: 'SERVLET',
          layer: ValidationLayer.SERVLET,
        });
      }
    }

    // --- Cross-tx: Rate limit 200 tx/min (solo Cargos Periódicos) ---
    if (this.rateLimitValidator) {
      const violations = this.rateLimitValidator.validate({
        product: command.integrationType,
        transactions: rateLimitInputs,
      });
      for (const v of violations) {
        // Adjuntar a todas las transacciones que caen en la ventana
        // violada. La UI puede así mostrar "esta tx forma parte del
        // clúster X que excedió 200/min".
        for (const ref of v.transactionRefs) {
          const target = results.find(r => r.transactionRef === ref);
          if (!target) continue;
          target.fieldResults.push({
            field: '_rate_limit',
            rule: 'R',
            found: true,
            value: v.detail,
            verdict: 'FAIL',
            failReason: 'rate_limit_exceeded',
            failDetail: v.detail,
            source: 'SERVLET',
            layer: ValidationLayer.SERVLET,
          });
        }
      }
    }

    const folio = await this.generateFolioForSession(command, results);

    const session = new CertificationSessionEntity(
      uuidv4(),
      merchantName || 'Comercio desconocido',
      command.integrationType,
      command.operationMode,
      results,
      new Date(),
      command.coordinadorCertificacion,
      command.responsableNombre,
      command.responsableEmail,
      command.responsableTelefono,
      command.lenguaje,
      command.versionAplicacion,
      command.urlSubdominio,
      folio,
      command.laboratoryType,
    );

    await this.certificationRepo.save(session);

    return session;
  }

  /**
   * Genera el folio oficial usando NOMENCLATURAS FOLIOS LABS. Se ejecuta
   * antes de crear la sesión para que el folio quede persistido. El
   * secuencial usa el conteo de sesiones previas + 1 — limitación conocida
   * para in-memory; un backend real usaría una secuencia DB atómica.
   */
  private async generateFolioForSession(
    command: RunCertificationCommand,
    results: ValidationResult[],
  ): Promise<string | undefined> {
    if (!this.folioGenerator) return undefined;

    const has3DS = results.some(r =>
      r.fieldResults?.some(f => f.layer === ValidationLayer.THREEDS),
    );
    const hasCybersource = results.some(r =>
      r.fieldResults?.some(f => f.layer === ValidationLayer.CYBERSOURCE),
    );
    const previousSessions = await this.certificationRepo.findAll();
    const sequential = previousSessions.length + 1;

    // ID afiliación: tomar la del primer resultado disponible — todas las
    // tx de una sesión son del mismo comercio (mismo MERCHANT_ID).
    const idAfiliacion = results[0]?.fieldResults?.find(
      f => f.field === 'MERCHANT_ID' || f.field === 'ID_AFILIACION',
    )?.value;

    // Si el comando trae laboratoryType (Fase C.4), deriva isVIP/modifier
    // desde el VO; si no, cae al legacy command.isVIP. Esto preserva los
    // tests/scripts que aún usan isVIP directo.
    const labParams = command.laboratoryType
      ? new LaboratoryTypeValueObject(command.laboratoryType).toFolioParams()
      : { isVIP: command.isVIP, modifier: undefined as string | undefined };

    const result = this.folioGenerator.generate({
      integrationType: command.integrationType,
      has3DS,
      hasCybersource,
      isVIP: labParams.isVIP,
      modifier: labParams.modifier,
      isRecertification: command.isRecertification,
      sequential,
      idAfiliacion,
    });

    return result.folio;
  }
}
