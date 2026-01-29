/**
 * Tipos específicos para el framework BIAN
 */

/**
 * Códigos de categorías BIAN
 */
export type BianCategoryCode = 
  | 'CE' // Customer Engagement
  | 'PD' // Product Development
  | 'OP' // Operations
  | 'RM' // Risk Management
  | 'FM' // Financial Management
  | 'CM' // Compliance Management
  | 'IT' // Information Technology
  | 'HR' // Human Resources
  | 'CS' // Customer Service
  | 'SA' // Sales
  | 'MK' // Marketing
  | 'LG' // Legal
  | 'AU' // Audit
  | 'TR' // Treasury
  | 'CR' // Credit
  | 'IN' // Investment
  | 'PM' // Payment
  | 'SE' // Settlement
  | 'CL' // Clearing
  | 'RC'; // Reconciliation

/**
 * Información de categoría BIAN
 */
export interface BianCategoryInfo {
  code: BianCategoryCode;
  description: string;
  color?: string;
  icon?: string;
}

/**
 * Niveles de complejidad
 */
export type ComplexityLevel = 'Low' | 'Medium' | 'High';

/**
 * Estados de proyecto
 */
export type ProjectStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';

/**
 * Datos de capacidad BIAN (formato JSON)
 */
export interface BianCapabilityData {
  id: string;
  name: string;
  description: string;
  category: BianCategoryCode;
  isActive: boolean;
  subCapabilities: BianSubCapabilityData[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos de subcapacidad BIAN (formato JSON)
 */
export interface BianSubCapabilityData {
  id: string;
  name: string;
  description: string;
  capabilityId: string;
  isActive: boolean;
  functionalities: BianFunctionalityData[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos de funcionalidad BIAN (formato JSON)
 */
export interface BianFunctionalityData {
  id: string;
  name: string;
  description: string;
  subCapabilityId: string;
  capabilityId: string;
  businessValue: string;
  technicalRequirements: string[];
  dependencies: string[];
  isActive: boolean;
  complexity: ComplexityLevel;
  estimatedEffort: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Metadatos del framework BIAN
 */
export interface BianMetadata {
  version: string;
  lastUpdated: string;
  totalCapabilities: number;
  totalSubCapabilities: number;
  totalFunctionalities: number;
}

/**
 * Estructura completa de datos BIAN
 */
export interface BianDataStructure {
  capabilities: BianCapabilityData[];
  categories: BianCategoryInfo[];
  metadata: BianMetadata;
}

/**
 * Configuración de visualización para categorías
 */
export interface CategoryDisplayConfig {
  showIcons: boolean;
  showColors: boolean;
  groupByCategory: boolean;
  sortOrder: 'alphabetical' | 'byCount' | 'custom';
}

/**
 * Configuración de filtros
 */
export interface FilterConfig {
  enableCategoryFilter: boolean;
  enableComplexityFilter: boolean;
  enableStatusFilter: boolean;
  enableDateRangeFilter: boolean;
  defaultFilters: {
    activeOnly: boolean;
    categories: BianCategoryCode[];
    complexity: ComplexityLevel[];
  };
}

/**
 * Configuración de búsqueda
 */
export interface SearchConfig {
  enableFuzzySearch: boolean;
  enableSemanticSearch: boolean;
  maxSuggestions: number;
  searchThreshold: number;
  highlightMatches: boolean;
}

/**
 * Configuración de exportación
 */
export interface ExportConfig {
  supportedFormats: ('csv' | 'json' | 'pdf' | 'xlsx')[];
  defaultFormat: 'csv' | 'json' | 'pdf' | 'xlsx';
  includeMetadata: boolean;
  compressFiles: boolean;
}

/**
 * Configuración general de la aplicación BIAN
 */
export interface BianAppConfig {
  display: CategoryDisplayConfig;
  filters: FilterConfig;
  search: SearchConfig;
  export: ExportConfig;
  features: {
    enableProjects: boolean;
    enableComparison: boolean;
    enableReports: boolean;
    enableCollaboration: boolean;
  };
}
