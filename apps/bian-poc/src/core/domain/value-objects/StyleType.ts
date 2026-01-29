/**
 * Value Object que representa los tipos de estilo visual para los grupos de capacidades
 */
export class StyleType {
  private static readonly VALID_STYLES = ['success', 'warning', 'danger', 'info', 'light'] as const;

  constructor(private readonly value: string) {
    if (!StyleType.VALID_STYLES.includes(value as any)) {
      throw new Error(`Invalid style type: ${value}. Valid styles: ${StyleType.VALID_STYLES.join(', ')}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: StyleType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Obtiene el color asociado al estilo para uso en UI
   */
  getColor(): string {
    switch (this.value) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      case 'info': return '#17a2b8';
      case 'light': return '#f8f9fa';
      default: return '#6c757d';
    }
  }

  /**
   * Obtiene la variante de Material-UI correspondiente
   */
  getMuiVariant(): 'success' | 'warning' | 'error' | 'info' | undefined {
    switch (this.value) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'error';
      case 'info': return 'info';
      default: return undefined;
    }
  }

  static getAllStyles(): readonly string[] {
    return StyleType.VALID_STYLES;
  }
}