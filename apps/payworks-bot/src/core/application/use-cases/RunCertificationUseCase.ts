import { v4 as uuidv4 } from 'uuid';
import { MatrixParserPort } from '@/core/domain/ports/MatrixParserPort';
import { TransactionRepositoryPort } from '@/core/domain/ports/TransactionRepositoryPort';
import { LogRetrievalPort } from '@/core/domain/ports/LogRetrievalPort';
import { ServletLogParserPort } from '@/core/domain/ports/ServletLogParserPort';
import { ProsaLogParserPort } from '@/core/domain/ports/ProsaLogParserPort';
import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { ValidateTransactionFieldsUseCase } from './ValidateTransactionFieldsUseCase';
import { CertificationSessionEntity, OperationMode } from '@/core/domain/entities/CertificationSession';
import { ValidationResult } from '@/core/domain/entities/ValidationResult';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';

export interface RunCertificationCommand {
  matrixBuffer: Buffer;
  integrationType: IntegrationType;
  operationMode: OperationMode;
  merchantName?: string;
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
  ) {}

  async execute(command: RunCertificationCommand): Promise<CertificationSessionEntity> {
    const matrixTransactions = await this.matrixParser.parse(command.matrixBuffer);

    if (matrixTransactions.length === 0) {
      throw new Error('La Matriz de Pruebas no contiene transacciones');
    }

    const results: ValidationResult[] = [];
    let merchantName = command.merchantName || '';

    for (const txn of matrixTransactions) {
      try {
        const dbRecord = await this.transactionRepo.findByReferencia(txn.referencia);

        if (!dbRecord) {
          throw new Error(`Transaccion con REFERENCIA ${txn.referencia} no encontrada en BD`);
        }

        if (!merchantName) {
          merchantName = dbRecord.nombre;
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

        const validation = this.fieldValidator.execute({
          integrationType: command.integrationType,
          transactionType: txn.tipoTransaccion,
          cardBrand: txn.cardBrand,
          transactionRef: txn.referencia,
          servletRequest: servletLogs.request,
          servletResponse: servletLogs.response,
          prosaRequest: prosaLogs.request,
          prosaResponse: prosaLogs.response,
        });

        results.push(validation);
      } catch (error) {
        console.error(`Error validando transaccion ${txn.referencia}:`, error);
        throw error;
      }
    }

    const session = new CertificationSessionEntity(
      uuidv4(),
      merchantName || 'Comercio desconocido',
      command.integrationType,
      command.operationMode,
      results,
      new Date(),
    );

    await this.certificationRepo.save(session);

    return session;
  }
}
