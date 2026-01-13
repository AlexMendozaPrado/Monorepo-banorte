/**
 * @file Mapeo Altamira Service
 * @description Maps extracted XML data to Altamira record format
 */

import { TIPOS_OPERACION, type RegistroValidacion, type Validaciones } from '../types/xmlValidation.types';
import { formatFecha, formatCuenta, cleanText } from '../utils/txtFormatters';

// Type definitions
export interface XMLTransaccion {
  importe: number | string;
  cuentaDestino: string;
  beneficiarioNombre?: string;
  beneficiarioId?: string;
  beneficiarioRFC?: string;
  referencia?: string;
  fechaEjecucion?: string | Date;
}

export interface XMLOrdenante {
  cuenta?: string;
}

export interface XMLProveedoresData {
  ordenante?: XMLOrdenante;
  transacciones: XMLTransaccion[];
}

export interface XMLEmpleado {
  numEmpleado?: string;
  nombre?: string;
  salario: number | string;
  clabe?: string;
  fechaPago?: string | Date;
  rfc?: string;
  curp?: string;
  tipoNomina?: string;
}

export interface XMLNominaData {
  empleados: XMLEmpleado[];
}

export interface MappedEmpleado {
  id: string;
  numEmpleado: string;
  nombre: string;
  salario: number;
  clabe: string;
  fechaPago: string;
  rfc: string;
  curp: string;
  tipoNomina: string;
  validaciones: Validaciones;
  advertencias: string[];
}

export interface NominaMapeada {
  empleados: MappedEmpleado[];
  totalImporte: number;
  totalRegistros: number;
  fechaProceso: string;
}

class MapeoAltamiraService {
  /**
   * Maps provider transactions to validation format
   */
  mapearProveedores(xmlData: XMLProveedoresData | null): RegistroValidacion[] {
    if (!xmlData || !xmlData.transacciones) {
      return [];
    }

    return xmlData.transacciones.map((tx, index): RegistroValidacion => {
      return {
        id: `prov_${index + 1}`,
        tipoOperacion: this.detectarTipoOperacion(tx),
        cuentaOrdenante: formatCuenta(xmlData.ordenante?.cuenta || '', 10),
        cuentaDestino: formatCuenta(tx.cuentaDestino, 18),
        importe: parseFloat(String(tx.importe)) || 0,
        referencia: this.formatReferencia(tx.referencia || `REF${index + 1}`),
        beneficiario: {
          id: this.formatBeneficiarioId(tx.beneficiarioId || `BEN${index + 1}`),
          nombre: cleanText(tx.beneficiarioNombre || 'BENEFICIARIO'),
          rfc: tx.beneficiarioRFC || ''
        },
        fechaEjecucion: formatFecha(tx.fechaEjecucion || new Date()),
        validaciones: {
          longitudCuenta: false,
          formatoFecha: false,
          rangoImporte: false,
          camposObligatorios: false
        },
        advertencias: [],
        sugerenciasIA: []
      };
    });
  }

  /**
   * Maps payroll employees to validation format
   */
  mapearNomina(xmlData: XMLNominaData | null): NominaMapeada {
    if (!xmlData || !xmlData.empleados) {
      return {
        empleados: [],
        totalImporte: 0,
        totalRegistros: 0,
        fechaProceso: formatFecha(new Date())
      };
    }

    const empleadosMapeados: MappedEmpleado[] = xmlData.empleados.map((emp, index) => {
      return {
        id: `emp_${index + 1}`,
        numEmpleado: formatCuenta(emp.numEmpleado || `${index + 1}`, 10),
        nombre: cleanText(emp.nombre || 'EMPLEADO'),
        salario: parseFloat(String(emp.salario)) || 0,
        clabe: formatCuenta(emp.clabe || '', 18),
        fechaPago: formatFecha(emp.fechaPago || new Date()),
        rfc: emp.rfc || '',
        curp: emp.curp || '',
        tipoNomina: emp.tipoNomina || '01',
        validaciones: {
          longitudCuenta: false,
          formatoFecha: false,
          rangoImporte: false,
          camposObligatorios: false
        },
        advertencias: []
      };
    });

    return {
      empleados: empleadosMapeados,
      totalImporte: empleadosMapeados.reduce((sum, emp) => sum + emp.salario, 0),
      totalRegistros: empleadosMapeados.length,
      fechaProceso: formatFecha(new Date())
    };
  }

  /**
   * Detects operation type based on data
   */
  detectarTipoOperacion(transaccion: XMLTransaccion): '02' | '04' | '05' {
    const cuenta = String(transaccion.cuentaDestino || '');

    if (cuenta.length === 18) {
      return TIPOS_OPERACION.SPEI as '04';
    } else if (cuenta.length === 10) {
      return TIPOS_OPERACION.TERCEROS as '02';
    }

    return TIPOS_OPERACION.SPEI as '04';
  }

  /**
   * Formats reference to 10 characters
   */
  formatReferencia(referencia: string): string {
    const cleaned = cleanText(referencia).substring(0, 10);
    return cleaned.padEnd(10, ' ');
  }

  /**
   * Formats beneficiary ID to 13 characters
   */
  formatBeneficiarioId(id: string): string {
    const cleaned = cleanText(id).substring(0, 13);
    return cleaned.padEnd(13, ' ');
  }
}

const mapeoAltamiraService = new MapeoAltamiraService();
export default mapeoAltamiraService;
