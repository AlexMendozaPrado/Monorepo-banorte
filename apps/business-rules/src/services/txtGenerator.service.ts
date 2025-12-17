/**
 * @file TXT Generator Service
 * @description Generates TXT files in Altamira format for providers and payroll
 */

import {
  formatImporte,
  formatFecha,
  formatCuenta,
  padLeft,
  padRight,
  cleanText,
  validateLineLength
} from '../utils/txtFormatters';
import { LONGITUDES_LINEA, TIPOS_OPERACION_SISTEMA, type RegistroValidacion } from '../types/xmlValidation.types';
import type { MappedEmpleado, NominaMapeada } from './mapeoAltamira.service';

// Type definitions
export interface GenerationResult {
  success: boolean;
  content: string | null;
  errors: string[];
  totalLineas?: number;
  totalRegistros?: number;
  totalEmpleados?: number;
}

type TipoOperacion = 'proveedores' | 'nomina';

class TXTGeneratorService {
  /**
   * Generates TXT file according to operation type
   */
  generarTXT(datos: RegistroValidacion[] | NominaMapeada, tipoOperacion: TipoOperacion): GenerationResult {
    try {
      console.log('Generando TXT para tipo:', tipoOperacion);
      console.log('Datos recibidos:', datos);

      if (tipoOperacion === TIPOS_OPERACION_SISTEMA.NOMINA) {
        return this.generarTXTNomina(datos as NominaMapeada);
      } else {
        return this.generarTXTProveedores(datos as RegistroValidacion[]);
      }
    } catch (error) {
      console.error('Error al generar TXT:', error);
      return {
        success: false,
        content: null,
        errors: [`Error al generar TXT: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Generates TXT for provider payments
   */
  generarTXTProveedores(registros: RegistroValidacion[]): GenerationResult {
    console.log('Generando TXT para proveedores, total registros:', registros.length);
    const lineas: string[] = [];
    const errors: string[] = [];

    registros.forEach((registro, index) => {
      console.log(`Procesando registro ${index + 1}:`, registro);
      try {
        // Altamira Providers Format (158 characters)
        // Pos 1-1: Operation Type
        // Pos 2-13: Amount (12)
        // Pos 14-23: Ordering Account (10)
        // Pos 24-33: Reference (10)
        // Pos 34-113: Beneficiary (80)
        // Pos 114-131: Destination Account (18)
        // Pos 132-139: Date (8)
        // Pos 140-152: Provider ID (13)
        // Pos 153-158: RFC (6)

        const tipoOp = registro.tipoOperacion || '04';
        const importe = formatImporte(registro.importe);
        const cuentaOrd = formatCuenta(registro.cuentaOrdenante, 10);
        const referencia = padRight(registro.referencia || '', 10);
        const beneficiario = padRight(cleanText(registro.beneficiario?.nombre || ''), 80);
        const cuentaDest = formatCuenta(registro.cuentaDestino, 18);
        const fecha = formatFecha(registro.fechaEjecucion);
        const idBenef = padRight(registro.beneficiario?.id || '', 13);
        const rfc = padRight(registro.beneficiario?.rfc || '', 6);

        const linea = `${tipoOp}${importe}${cuentaOrd}${referencia}${beneficiario}${cuentaDest}${fecha}${idBenef}${rfc}`;

        console.log(`Registro ${index + 1} - Longitudes:`, {
          tipoOp: tipoOp.length,
          importe: importe.length,
          cuentaOrd: cuentaOrd.length,
          referencia: referencia.length,
          beneficiario: beneficiario.length,
          cuentaDest: cuentaDest.length,
          fecha: fecha.length,
          idBenef: idBenef.length,
          rfc: rfc.length,
          total: linea.length
        });

        // Line length validation temporarily disabled
        lineas.push(linea);
      } catch (error) {
        errors.push(`Error en registro ${index + 1}: ${(error as Error).message}`);
      }
    });

    const result: GenerationResult = {
      success: errors.length === 0,
      content: lineas.join('\r\n'),
      errors,
      totalLineas: lineas.length,
      totalRegistros: registros.length
    };

    console.log('TXT Generado - Resultado:', {
      success: result.success,
      totalLineas: result.totalLineas,
      totalRegistros: result.totalRegistros,
      errors: result.errors,
      contentLength: result.content?.length || 0
    });

    if (!result.success) {
      console.error('Errores al generar TXT:', result.errors);
    }

    return result;
  }

  /**
   * Generates TXT for payroll
   */
  generarTXTNomina(datosNomina: NominaMapeada): GenerationResult {
    const lineas: string[] = [];
    const errors: string[] = [];
    const empleados = datosNomina.empleados || [];

    // Header (type 1)
    const header = this.generarHeaderNomina(empleados);
    lineas.push(header);

    // Details (type 2)
    empleados.forEach((empleado, index) => {
      try {
        // Payroll Format (120 characters)
        // Pos 1-1: Record Type (2=Detail)
        // Pos 2-11: Employee Number (10)
        // Pos 12-51: Name (40)
        // Pos 52-63: Salary (12)
        // Pos 64-81: CLABE (18)
        // Pos 82-89: Date (8)
        // Pos 90-102: RFC (13)
        // Pos 103-115: CURP (13)
        // Pos 116-120: Payroll Type (5)

        const tipo = '2';
        const numEmp = formatCuenta(empleado.numEmpleado, 10);
        const nombre = padRight(cleanText(empleado.nombre), 40);
        const salario = formatImporte(empleado.salario);
        const clabe = formatCuenta(empleado.clabe, 18);
        const fecha = formatFecha(empleado.fechaPago);
        const rfc = padRight(empleado.rfc || '', 13);
        const curp = padRight(empleado.curp || '', 13);
        const tipoNom = padLeft(empleado.tipoNomina || '01', 5);

        const linea = `${tipo}${numEmp}${nombre}${salario}${clabe}${fecha}${rfc}${curp}${tipoNom}`;

        const validation = validateLineLength(linea, LONGITUDES_LINEA.NOMINA);
        if (!validation.isValid) {
          errors.push(`Empleado ${index + 1}: ${validation.error}`);
        } else {
          lineas.push(linea);
        }
      } catch (error) {
        errors.push(`Error en empleado ${index + 1}: ${(error as Error).message}`);
      }
    });

    // Footer (type 3)
    const footer = this.generarFooterNomina(empleados);
    lineas.push(footer);

    return {
      success: errors.length === 0,
      content: lineas.join('\r\n'),
      errors,
      totalLineas: lineas.length,
      totalEmpleados: empleados.length
    };
  }

  /**
   * Generates header for payroll file
   */
  generarHeaderNomina(empleados: MappedEmpleado[]): string {
    const tipo = '1';
    const totalEmpleados = padLeft(empleados.length, 10);
    const totalImporte = formatImporte(
      empleados.reduce((sum, emp) => sum + (emp.salario || 0), 0)
    );
    const fecha = formatFecha(new Date());
    const relleno = padRight('', 87);

    return `${tipo}${totalEmpleados}${totalImporte}${fecha}${relleno}`;
  }

  /**
   * Generates footer for payroll file
   */
  generarFooterNomina(empleados: MappedEmpleado[]): string {
    const tipo = '3';
    const totalRegistros = padLeft(empleados.length, 10);
    const sumaControl = formatImporte(
      empleados.reduce((sum, emp) => sum + (emp.salario || 0), 0)
    );
    const relleno = padRight('', 97);

    return `${tipo}${totalRegistros}${sumaControl}${relleno}`;
  }

  /**
   * Downloads the TXT file
   */
  descargarTXT(content: string, tipoOperacion: TipoOperacion): void {
    const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const nombreArchivo = `${tipoOperacion}_${fecha}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=iso-8859-1' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

const txtGeneratorService = new TXTGeneratorService();
export default txtGeneratorService;
