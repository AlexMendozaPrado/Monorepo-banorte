/**
 * @file Utilidades para formateo de campos en archivo TXT
 * @description Helpers para formatear campos según especificaciones Altamira
 */

/**
 * Rellena un campo con ceros a la izquierda
 * @param valor - Valor a formatear
 * @param longitud - Longitud deseada
 * @returns String con ceros a la izquierda
 */
export function padLeft(valor: string | number, longitud: number): string {
  const str = String(valor || '');
  return str.padStart(longitud, '0');
}

/**
 * Rellena un campo con espacios a la derecha
 * @param valor - Valor a formatear
 * @param longitud - Longitud deseada
 * @returns String con espacios a la derecha
 */
export function padRight(valor: string, longitud: number): string {
  const str = String(valor || '');
  return str.substring(0, longitud).padEnd(longitud, ' ');
}

/**
 * Formatea un importe a formato 9999999999V99 (12 dígitos sin punto decimal)
 * @param importe - Importe a formatear
 * @returns Importe formateado (ej: 00000001050 para $10.50)
 */
export function formatImporte(importe: number | string): string {
  const importeNum = typeof importe === 'string' ? parseFloat(importe) : importe;
  const centavos = Math.round(importeNum * 100);
  return padLeft(centavos, 12);
}

/**
 * Formatea una fecha a DDMMYYYY
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada (ej: 31102025)
 */
export function formatFecha(fecha: string | Date): string {
  let fechaObj: Date;

  if (typeof fecha === 'string') {
    // Si ya está en formato DDMMYYYY, retornar
    if (/^\d{8}$/.test(fecha)) {
      return fecha;
    }
    // Intentar parsear otros formatos
    fechaObj = new Date(fecha);
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    fechaObj = new Date();
  }

  const dia = padLeft(fechaObj.getDate(), 2);
  const mes = padLeft(fechaObj.getMonth() + 1, 2);
  const anio = fechaObj.getFullYear();

  return `${dia}${mes}${anio}`;
}

/**
 * Formatea una cuenta, rellenando con ceros si es necesario
 * @param cuenta - Número de cuenta
 * @param longitud - Longitud deseada (10 o 18)
 * @returns Cuenta formateada
 */
export function formatCuenta(cuenta: string, longitud: number = 10): string {
  const cuentaLimpia = String(cuenta || '').replace(/\D/g, '');
  return padLeft(cuentaLimpia, longitud);
}

/**
 * Limpia y formatea un texto alfanumérico
 * @param texto - Texto a limpiar
 * @returns Texto limpio (sin acentos, solo ASCII)
 */
export function cleanText(texto: string): string {
  if (!texto) return '';

  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\x20-\x7E]/g, '') // Solo caracteres ASCII imprimibles
    .trim();
}

/**
 * Resultado de validación de longitud de línea
 */
export interface ValidateLineLengthResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Valida la longitud de una línea generada
 * @param linea - Línea a validar
 * @param longitudEsperada - Longitud esperada
 * @returns Objeto con resultado de validación
 */
export function validateLineLength(linea: string, longitudEsperada: number): ValidateLineLengthResult {
  if (linea.length !== longitudEsperada) {
    return {
      isValid: false,
      error: `Longitud incorrecta: esperada ${longitudEsperada}, actual ${linea.length}`
    };
  }
  return { isValid: true, error: null };
}
