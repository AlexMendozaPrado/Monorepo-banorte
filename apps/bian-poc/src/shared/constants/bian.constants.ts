import { BianCategoryInfo, ComplexityLevel } from '../types/bian.types';

/**
 * Constantes específicas del framework BIAN
 */

/**
 * Información completa de categorías BIAN
 */
export const BIAN_CATEGORIES: BianCategoryInfo[] = [
  {
    code: 'CE',
    description: 'Customer Engagement',
    color: '#1976d2',
    icon: 'people'
  },
  {
    code: 'PD',
    description: 'Product Development',
    color: '#388e3c',
    icon: 'build'
  },
  {
    code: 'OP',
    description: 'Operations',
    color: '#f57c00',
    icon: 'settings'
  },
  {
    code: 'RM',
    description: 'Risk Management',
    color: '#d32f2f',
    icon: 'security'
  },
  {
    code: 'FM',
    description: 'Financial Management',
    color: '#7b1fa2',
    icon: 'account_balance'
  },
  {
    code: 'CM',
    description: 'Compliance Management',
    color: '#455a64',
    icon: 'gavel'
  },
  {
    code: 'IT',
    description: 'Information Technology',
    color: '#0277bd',
    icon: 'computer'
  },
  {
    code: 'HR',
    description: 'Human Resources',
    color: '#8bc34a',
    icon: 'person'
  },
  {
    code: 'CS',
    description: 'Customer Service',
    color: '#ff9800',
    icon: 'support_agent'
  },
  {
    code: 'SA',
    description: 'Sales',
    color: '#e91e63',
    icon: 'trending_up'
  },
  {
    code: 'MK',
    description: 'Marketing',
    color: '#9c27b0',
    icon: 'campaign'
  },
  {
    code: 'LG',
    description: 'Legal',
    color: '#795548',
    icon: 'balance'
  },
  {
    code: 'AU',
    description: 'Audit',
    color: '#607d8b',
    icon: 'fact_check'
  },
  {
    code: 'TR',
    description: 'Treasury',
    color: '#ffc107',
    icon: 'account_balance_wallet'
  },
  {
    code: 'CR',
    description: 'Credit',
    color: '#4caf50',
    icon: 'credit_card'
  },
  {
    code: 'IN',
    description: 'Investment',
    color: '#2196f3',
    icon: 'show_chart'
  },
  {
    code: 'PM',
    description: 'Payment',
    color: '#ff5722',
    icon: 'payment'
  },
  {
    code: 'SE',
    description: 'Settlement',
    color: '#009688',
    icon: 'done_all'
  },
  {
    code: 'CL',
    description: 'Clearing',
    color: '#cddc39',
    icon: 'clear_all'
  },
  {
    code: 'RC',
    description: 'Reconciliation',
    color: '#3f51b5',
    icon: 'compare_arrows'
  }
];

/**
 * Niveles de complejidad con información adicional
 */
export const COMPLEXITY_LEVELS: Array<{
  level: ComplexityLevel;
  description: string;
  color: string;
  icon: string;
  estimatedHours: { min: number; max: number };
}> = [
  {
    level: 'Low',
    description: 'Baja complejidad - Implementación directa',
    color: '#4caf50',
    icon: 'sentiment_satisfied',
    estimatedHours: { min: 8, max: 24 }
  },
  {
    level: 'Medium',
    description: 'Complejidad media - Requiere análisis moderado',
    color: '#ff9800',
    icon: 'sentiment_neutral',
    estimatedHours: { min: 24, max: 80 }
  },
  {
    level: 'High',
    description: 'Alta complejidad - Requiere análisis profundo',
    color: '#f44336',
    icon: 'sentiment_dissatisfied',
    estimatedHours: { min: 80, max: 200 }
  }
];

/**
 * Estados de proyecto con información adicional
 */
export const PROJECT_STATUSES = [
  {
    status: 'Draft',
    description: 'Proyecto en borrador',
    color: '#9e9e9e',
    icon: 'edit'
  },
  {
    status: 'Active',
    description: 'Proyecto activo',
    color: '#4caf50',
    icon: 'play_arrow'
  },
  {
    status: 'Completed',
    description: 'Proyecto completado',
    color: '#2196f3',
    icon: 'check_circle'
  },
  {
    status: 'Archived',
    description: 'Proyecto archivado',
    color: '#607d8b',
    icon: 'archive'
  }
] as const;

/**
 * Versiones soportadas del framework BIAN
 */
export const SUPPORTED_BIAN_VERSIONS = [
  '12.0.0',
  '11.1.0',
  '11.0.0',
  '10.0.0'
] as const;

/**
 * Versión actual del framework BIAN
 */
export const CURRENT_BIAN_VERSION = '12.0.0';

/**
 * Límites de la aplicación
 */
export const APP_LIMITS = {
  MAX_SEARCH_QUERY_LENGTH: 500,
  MAX_SUGGESTIONS: 50,
  MAX_PROJECT_NAME_LENGTH: 100,
  MAX_PROJECT_DESCRIPTION_LENGTH: 1000,
  MAX_CAPABILITIES_PER_PROJECT: 100,
  MAX_FUNCTIONALITIES_PER_PROJECT: 500,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;

/**
 * Configuración de búsqueda por defecto
 */
export const DEFAULT_SEARCH_CONFIG = {
  FUZZY_THRESHOLD: 0.6,
  MAX_SUGGESTIONS: 10,
  SEARCH_DEBOUNCE_MS: 300,
  HIGHLIGHT_CLASS: 'search-highlight'
} as const;

/**
 * Configuración de exportación por defecto
 */
export const DEFAULT_EXPORT_CONFIG = {
  SUPPORTED_FORMATS: ['csv', 'json', 'pdf', 'xlsx'] as const,
  DEFAULT_FORMAT: 'csv' as const,
  MAX_EXPORT_RECORDS: 10000,
  EXPORT_TIMEOUT_MS: 30000
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  CAPABILITY_NOT_FOUND: 'Capacidad no encontrada',
  FUNCTIONALITY_NOT_FOUND: 'Funcionalidad no encontrada',
  PROJECT_NOT_FOUND: 'Proyecto no encontrado',
  INVALID_CAPABILITY_ID: 'ID de capacidad inválido',
  INVALID_FUNCTIONALITY_ID: 'ID de funcionalidad inválido',
  SEARCH_QUERY_TOO_LONG: 'La consulta de búsqueda es demasiado larga',
  SEARCH_QUERY_EMPTY: 'La consulta de búsqueda no puede estar vacía',
  PROJECT_NAME_REQUIRED: 'El nombre del proyecto es requerido',
  PROJECT_NAME_TOO_LONG: 'El nombre del proyecto es demasiado largo',
  EXPORT_FAILED: 'Error al exportar datos',
  NETWORK_ERROR: 'Error de conexión',
  UNKNOWN_ERROR: 'Error desconocido'
} as const;

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  CAPABILITY_ADDED: 'Capacidad agregada exitosamente',
  FUNCTIONALITY_ADDED: 'Funcionalidad agregada exitosamente',
  PROJECT_CREATED: 'Proyecto creado exitosamente',
  PROJECT_UPDATED: 'Proyecto actualizado exitosamente',
  PROJECT_DELETED: 'Proyecto eliminado exitosamente',
  EXPORT_COMPLETED: 'Exportación completada exitosamente',
  SEARCH_COMPLETED: 'Búsqueda completada'
} as const;
