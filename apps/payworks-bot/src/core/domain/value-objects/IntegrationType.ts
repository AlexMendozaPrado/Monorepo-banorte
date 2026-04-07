export enum IntegrationType {
  ECOMMERCE_TRADICIONAL = 'ECOMMERCE_TRADICIONAL',
  ECOMMERCE_TOKENIZACION = 'ECOMMERCE_TOKENIZACION',
  VENTANA_COMERCIOS = 'VENTANA_COMERCIOS',
  CYBERSOURCE_DIRECTO = 'CYBERSOURCE_DIRECTO',
  AGREGADOR_ECOMM = 'AGREGADOR_ECOMM',
  AGREGADOR_CARGOS_AUTO = 'AGREGADOR_CARGOS_AUTO',
}

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
    const names: Record<IntegrationType, string> = {
      [IntegrationType.ECOMMERCE_TRADICIONAL]: 'Servlet - E-Commerce Tradicional',
      [IntegrationType.ECOMMERCE_TOKENIZACION]: '3D Secure + Servlet',
      [IntegrationType.VENTANA_COMERCIOS]: 'Servlet - Ventana de Comercios',
      [IntegrationType.CYBERSOURCE_DIRECTO]: 'Cybersource Direct',
      [IntegrationType.AGREGADOR_ECOMM]: 'Esquema 1 Tasa Natural',
      [IntegrationType.AGREGADOR_CARGOS_AUTO]: 'Esquema 4 Sin AGP',
    };
    return names[this.value];
  }

  requiresThreeDS(): boolean {
    return [
      IntegrationType.ECOMMERCE_TRADICIONAL,
      IntegrationType.ECOMMERCE_TOKENIZACION,
      IntegrationType.CYBERSOURCE_DIRECTO,
    ].includes(this.value);
  }

  requiresCybersourceFields(): boolean {
    return this.value === IntegrationType.CYBERSOURCE_DIRECTO;
  }

  requiresAgregadorFields(): boolean {
    return [
      IntegrationType.AGREGADOR_ECOMM,
      IntegrationType.AGREGADOR_CARGOS_AUTO,
    ].includes(this.value);
  }

  getConfigFileName(): string {
    const files: Record<IntegrationType, string> = {
      [IntegrationType.ECOMMERCE_TRADICIONAL]: 'ecommerce-tradicional',
      [IntegrationType.ECOMMERCE_TOKENIZACION]: 'ecommerce-tokenizacion',
      [IntegrationType.VENTANA_COMERCIOS]: 'ventana-comercios',
      [IntegrationType.CYBERSOURCE_DIRECTO]: 'cybersource-directo',
      [IntegrationType.AGREGADOR_ECOMM]: 'agregadores-ecomm',
      [IntegrationType.AGREGADOR_CARGOS_AUTO]: 'agregadores-cargos-auto',
    };
    return files[this.value];
  }
}
