/**
 * @file Tipos y constantes para validación de mapeo XML bancario
 * @description Define las estructuras de datos y constantes para el sistema de mapeo XML ISO 20022 a formato Altamira
 */

// ============ INTERFACES ============

export interface Beneficiario {
  /** ID del beneficiario (máx 13 caracteres) */
  id: string;
  /** Nombre del beneficiario */
  nombre: string;
  /** RFC del beneficiario (opcional) */
  rfc?: string;
}

export interface Validaciones {
  /** Validación de longitud de cuenta */
  longitudCuenta: boolean;
  /** Validación de formato de fecha */
  formatoFecha: boolean;
  /** Validación de rango de importe */
  rangoImporte: boolean;
  /** Validación de campos obligatorios */
  camposObligatorios: boolean;
}

export interface SugerenciaIA {
  /** Campo con problema */
  campo: string;
  /** Descripción del problema */
  problema: string;
  /** Sugerencia de corrección */
  sugerencia: string;
  /** Valor sugerido por la IA */
  valorSugerido: string;
}

export interface RegistroValidacion {
  /** ID único del registro */
  id: string;
  /** Tipo de operación (02=Terceros, 04=SPEI, 05=TEF) */
  tipoOperacion: '02' | '04' | '05';
  /** Cuenta ordenante (10 dígitos) */
  cuentaOrdenante: string;
  /** Cuenta destino (10 o 18 dígitos) */
  cuentaDestino: string;
  /** Importe (0.01 - 999,999,999.99) */
  importe: number;
  /** Referencia (10 caracteres) */
  referencia: string;
  /** Datos del beneficiario */
  beneficiario: Beneficiario;
  /** Fecha de ejecución (DDMMYYYY) */
  fechaEjecucion: string;
  /** Estado de validaciones */
  validaciones: Validaciones;
  /** Lista de advertencias */
  advertencias?: string[];
  /** Sugerencias de la IA */
  sugerenciasIA?: SugerenciaIA[];
}

export interface EmpleadoNomina {
  /** Número de empleado (10 dígitos) */
  numEmpleado: string;
  /** Nombre del empleado (40 caracteres) */
  nombre: string;
  /** Salario (12 dígitos) */
  salario: number;
  /** CLABE interbancaria (18 dígitos) */
  clabe: string;
  /** Fecha de pago (DDMMYYYY) */
  fechaPago: string;
  /** RFC del empleado (13 caracteres) */
  rfc: string;
  /** CURP del empleado (13 caracteres) */
  curp: string;
  /** Tipo de nómina (01=Quincenal, 02=Mensual) */
  tipoNomina: '01' | '02';
}

export interface RegistroNomina {
  /** ID único del registro */
  id: string;
  /** Lista de empleados */
  empleados: EmpleadoNomina[];
  /** Total de importes */
  totalImporte: number;
  /** Total de registros */
  totalRegistros: number;
  /** Fecha de procesamiento */
  fechaProceso: string;
  /** Estado de validaciones */
  validaciones: Validaciones;
  /** Lista de advertencias */
  advertencias?: string[];
}

// ============ TYPE ALIASES ============

export type TipoOperacion = '02' | '04' | '05';
export type TipoNomina = '01' | '02';
export type EstadoValidacion = 'valid' | 'warning' | 'error';
export type TipoOperacionSistema = 'proveedores' | 'nomina';

// ============ CONSTANTES ============

/**
 * Tipos de operación válidos
 */
export const TIPOS_OPERACION = {
  TERCEROS: '02',
  SPEI: '04',
  TEF: '05'
} as const;

/**
 * Tipos de nómina válidos
 */
export const TIPOS_NOMINA = {
  QUINCENAL: '01',
  MENSUAL: '02'
} as const;

/**
 * Longitudes de campos según formato Altamira
 */
export const LONGITUDES_CAMPOS = {
  TIPO_OPERACION: 1,
  IMPORTE: 12,
  CUENTA_ORDENANTE: 10,
  CUENTA_DESTINO_CORTA: 10,
  CUENTA_DESTINO_LARGA: 18,
  REFERENCIA: 10,
  BENEFICIARIO: 80,
  FECHA: 8,
  ID_PROVEEDOR: 13,
  RFC: 6,
  // Nómina
  NUM_EMPLEADO: 10,
  NOMBRE_EMPLEADO: 40,
  SALARIO: 12,
  CLABE: 18,
  RFC_COMPLETO: 13,
  CURP: 13,
  TIPO_NOMINA: 5
} as const;

/**
 * Longitudes totales de línea por tipo de archivo
 */
export const LONGITUDES_LINEA = {
  PROVEEDORES: 158,
  NOMINA: 120
} as const;

/**
 * Rangos de validación
 */
export const RANGOS_VALIDACION = {
  IMPORTE_MIN: 0.01,
  IMPORTE_MAX: 999999999.99
} as const;

/**
 * Expresiones regulares para validación
 */
export const REGEX_VALIDACION = {
  SOLO_NUMEROS: /^\d+$/,
  FECHA_DDMMYYYY: /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])\d{4}$/,
  RFC: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/,
  CURP: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
  ALFANUMERICO: /^[A-Za-z0-9\s]+$/
} as const;

/**
 * Estados de validación
 */
export const ESTADOS_VALIDACION = {
  VALIDO: 'valid',
  ADVERTENCIA: 'warning',
  ERROR: 'error'
} as const;

/**
 * Tipos de operación para el sistema
 */
export const TIPOS_OPERACION_SISTEMA = {
  PROVEEDORES: 'proveedores',
  NOMINA: 'nomina'
} as const;

/**
 * Mensajes de error comunes
 */
export const MENSAJES_ERROR = {
  LONGITUD_INVALIDA: 'La longitud del campo no es válida',
  FORMATO_INVALIDO: 'El formato del campo no es válido',
  CAMPO_REQUERIDO: 'Este campo es obligatorio',
  RANGO_INVALIDO: 'El valor está fuera del rango permitido',
  FECHA_INVALIDA: 'La fecha no es válida',
  CUENTA_INVALIDA: 'El número de cuenta no es válido',
  RFC_INVALIDO: 'El RFC no es válido',
  CURP_INVALIDO: 'El CURP no es válido'
} as const;

/**
 * Colores para estados de validación (Tailwind CSS)
 */
export const COLORES_VALIDACION = {
  VALIDO: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: 'text-green-500'
  },
  ADVERTENCIA: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    icon: 'text-yellow-500'
  },
  ERROR: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: 'text-red-500'
  },
  IA: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-500',
    text: 'text-indigo-700',
    icon: 'text-indigo-500'
  }
} as const;

// ============ TYPE HELPERS ============

export type ColoresValidacionKey = keyof typeof COLORES_VALIDACION;
export type MensajesErrorKey = keyof typeof MENSAJES_ERROR;
