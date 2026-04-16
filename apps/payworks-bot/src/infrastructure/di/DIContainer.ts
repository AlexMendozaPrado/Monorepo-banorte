import { OperationMode } from '@/core/domain/entities/CertificationSession';

import { ServletLogParserPort } from '@/core/domain/ports/ServletLogParserPort';
import { ProsaLogParserPort } from '@/core/domain/ports/ProsaLogParserPort';
import { CybersourceLogParserPort } from '@/core/domain/ports/CybersourceLogParserPort';
import { ThreeDSLogParserPort } from '@/core/domain/ports/ThreeDSLogParserPort';
import { MatrixParserPort } from '@/core/domain/ports/MatrixParserPort';
import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { TransactionRepositoryPort } from '@/core/domain/ports/TransactionRepositoryPort';
import { LogRetrievalPort } from '@/core/domain/ports/LogRetrievalPort';
import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { AfiliacionRepositoryPort } from '@/core/domain/ports/AfiliacionRepositoryPort';

import { PayworksServletLogParser } from '../log-parsers/PayworksServletLogParser';
import { PayworksProsaLogParser } from '../log-parsers/PayworksProsaLogParser';
import { CybersourceLogParser } from '../log-parsers/CybersourceLogParser';
import { ThreeDSLogParser } from '../log-parsers/ThreeDSLogParser';
import { MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import layer3ds from '@/config/mandatory-fields/layer-3ds.json';
import layerCybersource from '@/config/mandatory-fields/layer-cybersource.json';
import { ExcelMatrixParser } from '../matrix-parser/ExcelMatrixParser';
import { MandatoryFieldsConfig } from '../mandatory-rules/MandatoryFieldsConfig';
import { InMemoryTransactionRepository } from '../repositories/InMemoryTransactionRepository';
import { InMemoryCertificationRepository } from '../repositories/InMemoryCertificationRepository';
import { FileUploadLogRetrieval } from '../log-retrieval/FileUploadLogRetrieval';
import { InMemoryAfiliacionRepository } from '../repositories/InMemoryAfiliacionRepository';

import { ValidateTransactionFieldsUseCase } from '@/core/application/use-cases/ValidateTransactionFieldsUseCase';
import { RunCertificationUseCase } from '@/core/application/use-cases/RunCertificationUseCase';
import { GetCertificationHistoryUseCase } from '@/core/application/use-cases/GetCertificationHistoryUseCase';

export interface DIContainerConfig {
  operationMode: OperationMode;
}

type GlobalWithDI = typeof globalThis & { __banortePayworksDI?: DIContainer };

export class DIContainer {
  private config: DIContainerConfig;

  // Infraestructura
  private _servletLogParser?: ServletLogParserPort;
  private _prosaLogParser?: ProsaLogParserPort;
  private _cybersourceLogParser?: CybersourceLogParserPort;
  private _threeDSLogParser?: ThreeDSLogParserPort;
  private _afiliacionRepo?: AfiliacionRepositoryPort;
  private _matrixParser?: MatrixParserPort;
  private _mandatoryFields?: MandatoryFieldsPort;
  private _transactionRepo?: InMemoryTransactionRepository;
  private _certificationRepo?: CertificationRepositoryPort;
  private _logRetrieval?: FileUploadLogRetrieval;

  // Use Cases
  private _validateFieldsUseCase?: ValidateTransactionFieldsUseCase;
  private _runCertificationUseCase?: RunCertificationUseCase;
  private _getCertificationHistoryUseCase?: GetCertificationHistoryUseCase;

  private constructor(config: DIContainerConfig) {
    this.config = config;
  }

  static getInstance(config?: DIContainerConfig): DIContainer {
    const g = globalThis as GlobalWithDI;
    if (!g.__banortePayworksDI) {
      if (!config) {
        throw new Error('DIContainer requiere configuracion en la primera inicializacion');
      }
      g.__banortePayworksDI = new DIContainer(config);
    }
    return g.__banortePayworksDI;
  }

  static reset(): void {
    const g = globalThis as GlobalWithDI;
    g.__banortePayworksDI = undefined;
  }

  // --- Getters de Infraestructura ---

  get servletLogParser(): ServletLogParserPort {
    if (!this._servletLogParser) {
      this._servletLogParser = new PayworksServletLogParser();
    }
    return this._servletLogParser;
  }

  get prosaLogParser(): ProsaLogParserPort {
    if (!this._prosaLogParser) {
      this._prosaLogParser = new PayworksProsaLogParser();
    }
    return this._prosaLogParser;
  }

  get cybersourceLogParser(): CybersourceLogParserPort {
    if (!this._cybersourceLogParser) {
      this._cybersourceLogParser = new CybersourceLogParser();
    }
    return this._cybersourceLogParser;
  }

  get threeDSLogParser(): ThreeDSLogParserPort {
    if (!this._threeDSLogParser) {
      this._threeDSLogParser = new ThreeDSLogParser();
    }
    return this._threeDSLogParser;
  }

  get afiliacionRepository(): AfiliacionRepositoryPort {
    if (!this._afiliacionRepo) {
      this._afiliacionRepo = new InMemoryAfiliacionRepository();
    }
    return this._afiliacionRepo;
  }

  get matrixParser(): MatrixParserPort {
    if (!this._matrixParser) {
      this._matrixParser = new ExcelMatrixParser();
    }
    return this._matrixParser;
  }

  get mandatoryFields(): MandatoryFieldsPort {
    if (!this._mandatoryFields) {
      this._mandatoryFields = new MandatoryFieldsConfig();
    }
    return this._mandatoryFields;
  }

  get transactionRepository(): InMemoryTransactionRepository {
    if (!this._transactionRepo) {
      this._transactionRepo = new InMemoryTransactionRepository();
    }
    return this._transactionRepo;
  }

  get certificationRepository(): CertificationRepositoryPort {
    if (!this._certificationRepo) {
      this._certificationRepo = new InMemoryCertificationRepository();
    }
    return this._certificationRepo;
  }

  get logRetrieval(): FileUploadLogRetrieval {
    if (!this._logRetrieval) {
      this._logRetrieval = new FileUploadLogRetrieval();
    }
    return this._logRetrieval;
  }

  // --- Getters de Use Cases ---

  get validateFieldsUseCase(): ValidateTransactionFieldsUseCase {
    if (!this._validateFieldsUseCase) {
      this._validateFieldsUseCase = new ValidateTransactionFieldsUseCase(
        this.mandatoryFields,
      );
    }
    return this._validateFieldsUseCase;
  }

  get runCertificationUseCase(): RunCertificationUseCase {
    if (!this._runCertificationUseCase) {
      this._runCertificationUseCase = new RunCertificationUseCase(
        this.matrixParser,
        this.transactionRepository,
        this.logRetrieval,
        this.servletLogParser,
        this.prosaLogParser,
        this.validateFieldsUseCase,
        this.certificationRepository,
        this.threeDSLogParser,
        this.cybersourceLogParser,
        this.afiliacionRepository,
        layer3ds as unknown as MandatoryFieldsMatrix,
        layerCybersource as unknown as MandatoryFieldsMatrix,
      );
    }
    return this._runCertificationUseCase;
  }

  get getCertificationHistoryUseCase(): GetCertificationHistoryUseCase {
    if (!this._getCertificationHistoryUseCase) {
      this._getCertificationHistoryUseCase = new GetCertificationHistoryUseCase(
        this.certificationRepository,
      );
    }
    return this._getCertificationHistoryUseCase;
  }

  getConfiguration(): Readonly<DIContainerConfig> {
    return { ...this.config };
  }
}
