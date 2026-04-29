import { TransactionType } from './TransactionType';
import { ValidationLayer } from './ValidationLayer';
import { AggregatorScheme } from './AggregatorScheme';

export enum IntegrationType {
  ECOMMERCE_TRADICIONAL = 'ECOMMERCE_TRADICIONAL',
  MOTO = 'MOTO',
  CARGOS_PERIODICOS_POST = 'CARGOS_PERIODICOS_POST',
  VENTANA_COMERCIO_ELECTRONICO = 'VENTANA_COMERCIO_ELECTRONICO',
  AGREGADORES_COMERCIO_ELECTRONICO = 'AGREGADORES_COMERCIO_ELECTRONICO',
  AGREGADORES_CARGOS_PERIODICOS = 'AGREGADORES_CARGOS_PERIODICOS',
  API_PW2_SEGURO = 'API_PW2_SEGURO',
  INTERREDES_REMOTO = 'INTERREDES_REMOTO',
}

interface IntegrationTypeMetadata {
  displayName: string;
  manualVersion: string;
  manualDate: string;
  configFileName: string;
  isTarjetaPresente: boolean;
  supportedTransactions: TransactionType[];
  supportedLayers: ValidationLayer[];
  supportsAggregatorSchemes: boolean;
}

const METADATA: Record<IntegrationType, IntegrationTypeMetadata> = {
  [IntegrationType.ECOMMERCE_TRADICIONAL]: {
    displayName: 'Comercio Electrónico Tradicional',
    manualVersion: '2.5',
    manualDate: '2025-06-19',
    configFileName: 'ecommerce-tradicional',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.POSTAUTH,
      TransactionType.REFUND, TransactionType.VOID, TransactionType.REVERSAL,
      TransactionType.VERIFY,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.THREEDS, ValidationLayer.CYBERSOURCE, ValidationLayer.AN5822, ValidationLayer.TOKENIZACION],
    supportsAggregatorSchemes: false,
  },
  [IntegrationType.MOTO]: {
    displayName: 'MOTO (Mail Order / Telephone Order)',
    manualVersion: '1.5',
    manualDate: '2025-06-19',
    configFileName: 'moto',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.POSTAUTH,
      TransactionType.REFUND, TransactionType.VOID, TransactionType.REVERSAL,
      TransactionType.VERIFY,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.AN5822],
    supportsAggregatorSchemes: false,
  },
  [IntegrationType.CARGOS_PERIODICOS_POST]: {
    displayName: 'Cargos Periódicos Post',
    manualVersion: '2.1',
    manualDate: '2025-06-19',
    configFileName: 'cargos-periodicos-post',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.REFUND, TransactionType.VOID,
      TransactionType.REVERSAL, TransactionType.VERIFY,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.AN5822],
    supportsAggregatorSchemes: false,
  },
  [IntegrationType.VENTANA_COMERCIO_ELECTRONICO]: {
    displayName: 'Ventana de Comercio Electrónico (Cifrada)',
    manualVersion: '1.8',
    manualDate: '2026-03-24',
    configFileName: 'ventana-comercio-electronico',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.POSTAUTH,
      TransactionType.REFUND, TransactionType.VOID, TransactionType.REVERSAL,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.THREEDS, ValidationLayer.CYBERSOURCE, ValidationLayer.AN5822, ValidationLayer.TOKENIZACION],
    supportsAggregatorSchemes: false,
  },
  [IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO]: {
    displayName: 'Agregadores - Comercio Electrónico',
    manualVersion: '2.6.4',
    manualDate: '2026-01-23',
    configFileName: 'agregadores-comercio-electronico',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.POSTAUTH,
      TransactionType.REFUND, TransactionType.VOID, TransactionType.REVERSAL,
    ],
    supportedLayers: [
      ValidationLayer.SERVLET,
      ValidationLayer.AGREGADOR,
      ValidationLayer.THREEDS,
      ValidationLayer.CYBERSOURCE,
      ValidationLayer.AN5822,
      ValidationLayer.TOKENIZACION,
    ],
    supportsAggregatorSchemes: true,
  },
  [IntegrationType.AGREGADORES_CARGOS_PERIODICOS]: {
    displayName: 'Agregadores - Cargos Periódicos',
    manualVersion: '2.6.4',
    manualDate: '2026-01-23',
    configFileName: 'agregadores-cargos-periodicos',
    isTarjetaPresente: false,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.REFUND, TransactionType.VOID, TransactionType.REVERSAL,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.AGREGADOR, ValidationLayer.AN5822],
    supportsAggregatorSchemes: true,
  },
  [IntegrationType.API_PW2_SEGURO]: {
    displayName: 'API PW2 Seguro (Tarjeta Presente)',
    manualVersion: '2.4',
    manualDate: '2023-03-01',
    configFileName: 'api-pw2-seguro',
    isTarjetaPresente: true,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.REAUTH,
      TransactionType.POSTAUTH, TransactionType.REFUND, TransactionType.VOID,
      TransactionType.REVERSAL, TransactionType.CASHBACK, TransactionType.VERIFY,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.EMV],
    supportsAggregatorSchemes: false,
  },
  [IntegrationType.INTERREDES_REMOTO]: {
    displayName: 'Interredes Remoto (PinPad WiFi/LAN)',
    manualVersion: '1.7',
    manualDate: '2025-07-01',
    configFileName: 'interredes-remoto',
    isTarjetaPresente: true,
    supportedTransactions: [
      TransactionType.AUTH, TransactionType.PREAUTH, TransactionType.REAUTH,
      TransactionType.POSTAUTH, TransactionType.REFUND, TransactionType.VOID,
      TransactionType.REVERSAL, TransactionType.CASHBACK, TransactionType.VERIFY,
    ],
    supportedLayers: [ValidationLayer.SERVLET, ValidationLayer.EMV],
    supportsAggregatorSchemes: false,
  },
};

export class IntegrationTypeValueObject {
  constructor(private readonly value: IntegrationType) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(IntegrationType).includes(this.value)) {
      throw new Error(`Tipo de integracion invalido: ${this.value}`);
    }
  }

  getValue(): IntegrationType {
    return this.value;
  }

  getDisplayName(): string {
    return METADATA[this.value].displayName;
  }

  getManualVersion(): string {
    return METADATA[this.value].manualVersion;
  }

  getManualDate(): string {
    return METADATA[this.value].manualDate;
  }

  getConfigFileName(): string {
    return METADATA[this.value].configFileName;
  }

  isTarjetaPresente(): boolean {
    return METADATA[this.value].isTarjetaPresente;
  }

  getSupportedTransactions(): TransactionType[] {
    return [...METADATA[this.value].supportedTransactions];
  }

  supportsTransaction(tx: TransactionType): boolean {
    return METADATA[this.value].supportedTransactions.includes(tx);
  }

  getSupportedLayers(): ValidationLayer[] {
    return [...METADATA[this.value].supportedLayers];
  }

  supportsLayer(layer: ValidationLayer): boolean {
    return METADATA[this.value].supportedLayers.includes(layer);
  }

  supportsAggregatorSchemes(): boolean {
    return METADATA[this.value].supportsAggregatorSchemes;
  }

  getAvailableSchemes(): AggregatorScheme[] {
    if (!this.supportsAggregatorSchemes()) return [];
    return [
      AggregatorScheme.ESQ_1_TASA_NATURAL,
      AggregatorScheme.ESQ_4_SIN_AGP,
      AggregatorScheme.ESQ_4_CON_AGP,
    ];
  }

  // Deprecated helpers kept for callers; delegate to supportsLayer()
  requiresThreeDS(): boolean {
    return this.supportsLayer(ValidationLayer.THREEDS);
  }

  requiresCybersourceFields(): boolean {
    return this.supportsLayer(ValidationLayer.CYBERSOURCE);
  }

  requiresAgregadorFields(): boolean {
    return this.supportsLayer(ValidationLayer.AGREGADOR);
  }
}
