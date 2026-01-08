/**
 * @file Validation Rules Service
 * @description Centralizes all business rules for field validation according to Altamira format
 */

import {
  LONGITUDES_CAMPOS,
  RANGOS_VALIDACION,
  REGEX_VALIDACION,
  TIPOS_OPERACION,
  MENSAJES_ERROR,
  ESTADOS_VALIDACION,
  type RegistroValidacion,
  type EmpleadoNomina
} from '../types/xmlValidation.types';

// Type definitions for validation results
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  estado: string;
  warnings?: string[];
}

export interface CompleteValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  camposConError: string[];
}

class ValidationRulesService {
  /**
   * Validates operation type
   */
  validateTipoOperacion(tipoOperacion: string): ValidationResult {
    if (!tipoOperacion) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    const tiposValidos = Object.values(TIPOS_OPERACION) as string[];
    if (!tiposValidos.includes(tipoOperacion)) {
      return {
        isValid: false,
        error: `Tipo de operación inválido. Debe ser: ${tiposValidos.join(', ')}`,
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    return {
      isValid: true,
      error: null,
      estado: ESTADOS_VALIDACION.VALIDO
    };
  }

  /**
   * Validates account number
   */
  validateCuenta(cuenta: string, longitudEsperada: number = LONGITUDES_CAMPOS.CUENTA_ORDENANTE): ValidationResult {
    const warnings: string[] = [];

    if (!cuenta) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const cuentaLimpia = cuenta.trim();

    if (!REGEX_VALIDACION.SOLO_NUMEROS.test(cuentaLimpia)) {
      return {
        isValid: false,
        error: 'La cuenta debe contener solo números',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (cuentaLimpia.length !== longitudEsperada) {
      if (longitudEsperada === LONGITUDES_CAMPOS.CUENTA_DESTINO_LARGA) {
        if (cuentaLimpia.length !== 10 && cuentaLimpia.length !== 18) {
          return {
            isValid: false,
            error: `La cuenta debe tener 10 o 18 dígitos. Actual: ${cuentaLimpia.length}`,
            estado: ESTADOS_VALIDACION.ERROR,
            warnings
          };
        }
      } else {
        return {
          isValid: false,
          error: `La cuenta debe tener ${longitudEsperada} dígitos. Actual: ${cuentaLimpia.length}`,
          estado: ESTADOS_VALIDACION.ERROR,
          warnings
        };
      }
    }

    if (cuentaLimpia.startsWith('0000')) {
      warnings.push('La cuenta tiene muchos ceros al inicio, verifica que sea correcta');
    }

    return {
      isValid: true,
      error: null,
      estado: warnings.length > 0 ? ESTADOS_VALIDACION.ADVERTENCIA : ESTADOS_VALIDACION.VALIDO,
      warnings
    };
  }

  /**
   * Validates CLABE (18 digits with check digit)
   */
  validateCLABE(clabe: string): ValidationResult {
    const warnings: string[] = [];

    if (!clabe) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const clabeLimpia = clabe.trim();

    if (!REGEX_VALIDACION.SOLO_NUMEROS.test(clabeLimpia)) {
      return {
        isValid: false,
        error: 'La CLABE debe contener solo números',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (clabeLimpia.length !== LONGITUDES_CAMPOS.CLABE) {
      return {
        isValid: false,
        error: `La CLABE debe tener ${LONGITUDES_CAMPOS.CLABE} dígitos. Actual: ${clabeLimpia.length}`,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (!this.validarDigitoVerificadorCLABE(clabeLimpia)) {
      warnings.push('El dígito verificador de la CLABE podría no ser correcto');
    }

    return {
      isValid: true,
      error: null,
      estado: warnings.length > 0 ? ESTADOS_VALIDACION.ADVERTENCIA : ESTADOS_VALIDACION.VALIDO,
      warnings
    };
  }

  /**
   * Validates CLABE check digit
   */
  validarDigitoVerificadorCLABE(clabe: string): boolean {
    if (clabe.length !== 18) return false;

    const pesos = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    let suma = 0;

    for (let i = 0; i < 17; i++) {
      suma += parseInt(clabe[i]) * pesos[i];
    }

    const digitoCalculado = (10 - (suma % 10)) % 10;
    const digitoEsperado = parseInt(clabe[17]);

    return digitoCalculado === digitoEsperado;
  }

  /**
   * Validates amount
   */
  validateImporte(importe: number | string | null | undefined): ValidationResult {
    const warnings: string[] = [];

    if (importe === null || importe === undefined || importe === '') {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const importeNum = typeof importe === 'string' ? parseFloat(importe) : importe;

    if (isNaN(importeNum)) {
      return {
        isValid: false,
        error: 'El importe debe ser un número válido',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (importeNum < RANGOS_VALIDACION.IMPORTE_MIN) {
      return {
        isValid: false,
        error: `El importe debe ser mayor o igual a ${RANGOS_VALIDACION.IMPORTE_MIN}`,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (importeNum > RANGOS_VALIDACION.IMPORTE_MAX) {
      return {
        isValid: false,
        error: `El importe no puede exceder ${RANGOS_VALIDACION.IMPORTE_MAX.toLocaleString('es-MX')}`,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (importeNum > 100000) {
      warnings.push('Importe mayor a $100,000 - verifica que sea correcto');
    }

    const decimales = (importeNum.toString().split('.')[1] || '').length;
    if (decimales > 2) {
      warnings.push('El importe tiene más de 2 decimales, se redondeará');
    }

    return {
      isValid: true,
      error: null,
      estado: warnings.length > 0 ? ESTADOS_VALIDACION.ADVERTENCIA : ESTADOS_VALIDACION.VALIDO,
      warnings
    };
  }

  /**
   * Validates reference
   */
  validateReferencia(referencia: string): ValidationResult {
    if (!referencia) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    const referenciaLimpia = referencia.trim();

    if (referenciaLimpia.length > LONGITUDES_CAMPOS.REFERENCIA) {
      return {
        isValid: false,
        error: `La referencia no puede exceder ${LONGITUDES_CAMPOS.REFERENCIA} caracteres. Actual: ${referenciaLimpia.length}`,
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    if (!REGEX_VALIDACION.ALFANUMERICO.test(referenciaLimpia)) {
      return {
        isValid: false,
        error: 'La referencia solo puede contener letras, números y espacios',
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    return {
      isValid: true,
      error: null,
      estado: ESTADOS_VALIDACION.VALIDO
    };
  }

  /**
   * Validates date in DDMMYYYY format
   */
  validateFecha(fecha: string): ValidationResult {
    const warnings: string[] = [];

    if (!fecha) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const fechaLimpia = fecha.trim();

    if (!REGEX_VALIDACION.FECHA_DDMMYYYY.test(fechaLimpia)) {
      return {
        isValid: false,
        error: 'La fecha debe tener formato DDMMYYYY (ej: 31102025)',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const dia = parseInt(fechaLimpia.substring(0, 2));
    const mes = parseInt(fechaLimpia.substring(2, 4));
    const anio = parseInt(fechaLimpia.substring(4, 8));

    const fechaObj = new Date(anio, mes - 1, dia);

    if (
      fechaObj.getDate() !== dia ||
      fechaObj.getMonth() !== mes - 1 ||
      fechaObj.getFullYear() !== anio
    ) {
      return {
        isValid: false,
        error: 'La fecha no es válida (día o mes fuera de rango)',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaObj < hoy) {
      warnings.push('La fecha de ejecución está en el pasado');
    }

    const unAnioFuturo = new Date();
    unAnioFuturo.setFullYear(unAnioFuturo.getFullYear() + 1);
    if (fechaObj > unAnioFuturo) {
      warnings.push('La fecha de ejecución está muy lejana (más de 1 año)');
    }

    return {
      isValid: true,
      error: null,
      estado: warnings.length > 0 ? ESTADOS_VALIDACION.ADVERTENCIA : ESTADOS_VALIDACION.VALIDO,
      warnings
    };
  }

  /**
   * Validates RFC
   */
  validateRFC(rfc: string, requerido: boolean = false): ValidationResult {
    if (!rfc || rfc.trim() === '') {
      if (requerido) {
        return {
          isValid: false,
          error: MENSAJES_ERROR.CAMPO_REQUERIDO,
          estado: ESTADOS_VALIDACION.ERROR
        };
      }
      return {
        isValid: true,
        error: null,
        estado: ESTADOS_VALIDACION.VALIDO
      };
    }

    const rfcLimpio = rfc.trim().toUpperCase();

    if (!REGEX_VALIDACION.RFC.test(rfcLimpio)) {
      return {
        isValid: false,
        error: 'El RFC no tiene un formato válido',
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      return {
        isValid: false,
        error: 'El RFC debe tener 12 o 13 caracteres',
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    return {
      isValid: true,
      error: null,
      estado: ESTADOS_VALIDACION.VALIDO
    };
  }

  /**
   * Validates CURP
   */
  validateCURP(curp: string, requerido: boolean = false): ValidationResult {
    if (!curp || curp.trim() === '') {
      if (requerido) {
        return {
          isValid: false,
          error: MENSAJES_ERROR.CAMPO_REQUERIDO,
          estado: ESTADOS_VALIDACION.ERROR
        };
      }
      return {
        isValid: true,
        error: null,
        estado: ESTADOS_VALIDACION.VALIDO
      };
    }

    const curpLimpio = curp.trim().toUpperCase();

    if (curpLimpio.length !== LONGITUDES_CAMPOS.CURP) {
      return {
        isValid: false,
        error: `El CURP debe tener ${LONGITUDES_CAMPOS.CURP} caracteres`,
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    if (!REGEX_VALIDACION.CURP.test(curpLimpio)) {
      return {
        isValid: false,
        error: 'El CURP no tiene un formato válido',
        estado: ESTADOS_VALIDACION.ERROR
      };
    }

    return {
      isValid: true,
      error: null,
      estado: ESTADOS_VALIDACION.VALIDO
    };
  }

  /**
   * Validates beneficiary or employee name
   */
  validateNombre(nombre: string, longitudMaxima: number = LONGITUDES_CAMPOS.BENEFICIARIO): ValidationResult {
    const warnings: string[] = [];

    if (!nombre) {
      return {
        isValid: false,
        error: MENSAJES_ERROR.CAMPO_REQUERIDO,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length > longitudMaxima) {
      return {
        isValid: false,
        error: `El nombre no puede exceder ${longitudMaxima} caracteres. Actual: ${nombreLimpio.length}`,
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (nombreLimpio.length < 3) {
      return {
        isValid: false,
        error: 'El nombre debe tener al menos 3 caracteres',
        estado: ESTADOS_VALIDACION.ERROR,
        warnings
      };
    }

    if (!/^[A-Za-zÀ-ÿ\s'\-.]+$/.test(nombreLimpio)) {
      warnings.push('El nombre contiene caracteres especiales que podrían causar problemas');
    }

    return {
      isValid: true,
      error: null,
      estado: warnings.length > 0 ? ESTADOS_VALIDACION.ADVERTENCIA : ESTADOS_VALIDACION.VALIDO,
      warnings
    };
  }

  /**
   * Validates a complete provider payment record
   */
  validateRegistroCompleto(registro: RegistroValidacion | EmpleadoNomina): CompleteValidationResult {
    if ('numEmpleado' in registro) {
      return this.validateEmpleadoCompleto(registro);
    }

    const errors: Record<string, string> = {};
    const warnings: string[] = [];
    const camposConError: string[] = [];

    const tipoOpResult = this.validateTipoOperacion(registro.tipoOperacion);
    if (!tipoOpResult.isValid && tipoOpResult.error) {
      errors.tipoOperacion = tipoOpResult.error;
      camposConError.push('tipoOperacion');
    }

    const cuentaOrdenanteResult = this.validateCuenta(
      registro.cuentaOrdenante,
      LONGITUDES_CAMPOS.CUENTA_ORDENANTE
    );
    if (!cuentaOrdenanteResult.isValid && cuentaOrdenanteResult.error) {
      errors.cuentaOrdenante = cuentaOrdenanteResult.error;
      camposConError.push('cuentaOrdenante');
    }
    warnings.push(...(cuentaOrdenanteResult.warnings || []));

    const cuentaDestinoResult = this.validateCuenta(
      registro.cuentaDestino,
      LONGITUDES_CAMPOS.CUENTA_DESTINO_LARGA
    );
    if (!cuentaDestinoResult.isValid && cuentaDestinoResult.error) {
      errors.cuentaDestino = cuentaDestinoResult.error;
      camposConError.push('cuentaDestino');
    }
    warnings.push(...(cuentaDestinoResult.warnings || []));

    const importeResult = this.validateImporte(registro.importe);
    if (!importeResult.isValid && importeResult.error) {
      errors.importe = importeResult.error;
      camposConError.push('importe');
    }
    warnings.push(...(importeResult.warnings || []));

    const referenciaResult = this.validateReferencia(registro.referencia);
    if (!referenciaResult.isValid && referenciaResult.error) {
      errors.referencia = referenciaResult.error;
      camposConError.push('referencia');
    }

    const fechaResult = this.validateFecha(registro.fechaEjecucion);
    if (!fechaResult.isValid && fechaResult.error) {
      errors.fechaEjecucion = fechaResult.error;
      camposConError.push('fechaEjecucion');
    }
    warnings.push(...(fechaResult.warnings || []));

    if (registro.beneficiario) {
      const nombreResult = this.validateNombre(registro.beneficiario.nombre);
      if (!nombreResult.isValid && nombreResult.error) {
        errors.beneficiarioNombre = nombreResult.error;
        camposConError.push('beneficiario.nombre');
      }
      warnings.push(...(nombreResult.warnings || []));

      if (registro.beneficiario.rfc) {
        const rfcResult = this.validateRFC(registro.beneficiario.rfc);
        if (!rfcResult.isValid && rfcResult.error) {
          errors.beneficiarioRFC = rfcResult.error;
          camposConError.push('beneficiario.rfc');
        }
      }
    } else {
      errors.beneficiario = 'Los datos del beneficiario son requeridos';
      camposConError.push('beneficiario');
    }

    return {
      isValid: camposConError.length === 0,
      errors,
      warnings,
      camposConError
    };
  }

  /**
   * Validates a complete payroll employee record
   */
  validateEmpleadoCompleto(empleado: EmpleadoNomina): CompleteValidationResult {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];
    const camposConError: string[] = [];

    const numEmpleadoResult = this.validateCuenta(
      empleado.numEmpleado,
      LONGITUDES_CAMPOS.NUM_EMPLEADO
    );
    if (!numEmpleadoResult.isValid && numEmpleadoResult.error) {
      errors.numEmpleado = numEmpleadoResult.error;
      camposConError.push('numEmpleado');
    }
    warnings.push(...(numEmpleadoResult.warnings || []));

    const nombreResult = this.validateNombre(
      empleado.nombre,
      LONGITUDES_CAMPOS.NOMBRE_EMPLEADO
    );
    if (!nombreResult.isValid && nombreResult.error) {
      errors.nombre = nombreResult.error;
      camposConError.push('nombre');
    }
    warnings.push(...(nombreResult.warnings || []));

    const salarioResult = this.validateImporte(empleado.salario);
    if (!salarioResult.isValid && salarioResult.error) {
      errors.salario = salarioResult.error;
      camposConError.push('salario');
    }
    warnings.push(...(salarioResult.warnings || []));

    const clabeResult = this.validateCLABE(empleado.clabe);
    if (!clabeResult.isValid && clabeResult.error) {
      errors.clabe = clabeResult.error;
      camposConError.push('clabe');
    }
    warnings.push(...(clabeResult.warnings || []));

    const fechaResult = this.validateFecha(empleado.fechaPago);
    if (!fechaResult.isValid && fechaResult.error) {
      errors.fechaPago = fechaResult.error;
      camposConError.push('fechaPago');
    }
    warnings.push(...(fechaResult.warnings || []));

    const rfcResult = this.validateRFC(empleado.rfc, true);
    if (!rfcResult.isValid && rfcResult.error) {
      errors.rfc = rfcResult.error;
      camposConError.push('rfc');
    }

    const curpResult = this.validateCURP(empleado.curp, true);
    if (!curpResult.isValid && curpResult.error) {
      errors.curp = curpResult.error;
      camposConError.push('curp');
    }

    return {
      isValid: camposConError.length === 0,
      errors,
      warnings,
      camposConError
    };
  }
}

const validationRulesService = new ValidationRulesService();
export default validationRulesService;
