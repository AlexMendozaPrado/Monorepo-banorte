/**
 * Value Object que representa los tipos de categoría BIAN
 */
export class CategoryType {
  private readonly _value: string;
  private readonly _description: string;

  // Categorías BIAN predefinidas
  private static readonly VALID_CATEGORIES = {
    'CE': 'Customer Engagement',
    'PD': 'Product Development',
    'OP': 'Operations',
    'RM': 'Risk Management',
    'FM': 'Financial Management',
    'CM': 'Compliance Management',
    'IT': 'Information Technology',
    'HR': 'Human Resources',
    'CS': 'Customer Service',
    'SA': 'Sales',
    'MK': 'Marketing',
    'LG': 'Legal',
    'AU': 'Audit',
    'TR': 'Treasury',
    'CR': 'Credit',
    'IN': 'Investment',
    'PM': 'Payment',
    'SE': 'Settlement',
    'CL': 'Clearing',
    'RC': 'Reconciliation'
  } as const;

  constructor(value: string) {
    this.validateCategory(value);
    this._value = value.toUpperCase();
    this._description = CategoryType.VALID_CATEGORIES[this._value as keyof typeof CategoryType.VALID_CATEGORIES];
  }

  get value(): string {
    return this._value;
  }

  get description(): string {
    return this._description;
  }

  /**
   * Valida que la categoría sea válida
   */
  private validateCategory(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('CategoryType must be a non-empty string');
    }

    const upperValue = value.toUpperCase();
    if (!(upperValue in CategoryType.VALID_CATEGORIES)) {
      throw new Error(`Invalid category type: ${value}. Valid categories are: ${Object.keys(CategoryType.VALID_CATEGORIES).join(', ')}`);
    }
  }

  /**
   * Verifica si dos CategoryType son iguales
   */
  equals(other: CategoryType): boolean {
    return this._value === other._value;
  }

  /**
   * Convierte a string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Obtiene la descripción completa
   */
  getFullDescription(): string {
    return `${this._value} - ${this._description}`;
  }

  /**
   * Crea un CategoryType desde un string
   */
  static fromString(value: string): CategoryType {
    return new CategoryType(value);
  }

  /**
   * Verifica si un string es una categoría válida
   */
  static isValid(value: string): boolean {
    try {
      new CategoryType(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene todas las categorías válidas
   */
  static getAllCategories(): Array<{ code: string; description: string }> {
    return Object.entries(CategoryType.VALID_CATEGORIES).map(([code, description]) => ({
      code,
      description
    }));
  }

  /**
   * Busca categorías por descripción parcial
   */
  static searchByDescription(searchTerm: string): Array<{ code: string; description: string }> {
    const term = searchTerm.toLowerCase();
    return CategoryType.getAllCategories().filter(category =>
      category.description.toLowerCase().includes(term)
    );
  }
}
