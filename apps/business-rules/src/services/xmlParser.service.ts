/**
 * @file XML Parser Service
 * @description Parses ISO 20022 XML files (pain.001) and detects operation type
 */

import { TIPOS_OPERACION_SISTEMA, type TipoOperacionSistema } from '../types/xmlValidation.types';

// Type definitions
export interface ParseResult {
  success: boolean;
  data: ProveedoresData | NominaData | null;
  error: string | null;
  tipoOperacion: TipoOperacionSistema | null;
}

export interface Ordenante {
  nombre: string;
  cuenta: string;
}

export interface Transaccion {
  id: string;
  importe: number;
  cuentaDestino: string;
  beneficiarioNombre: string;
  beneficiarioId: string;
  referencia: string;
  fechaEjecucion: string;
}

export interface ProveedoresData {
  ordenante: Ordenante;
  transacciones: Transaccion[];
  totalTransacciones: number;
  fechaProceso: string;
}

export interface EmpleadoXML {
  id: string;
  numEmpleado: string;
  nombre: string;
  salario: string;
  clabe: string;
  fechaPago: string;
  rfc: string;
  curp: string;
  tipoNomina: string;
}

export interface NominaData {
  empleados: EmpleadoXML[];
  totalEmpleados: number;
  totalImporte: number;
  fechaProceso: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class XMLParserService {
  /**
   * Parses an XML file
   */
  async parseXMLFile(file: File): Promise<ParseResult> {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('Error de parseo XML:', parserError.textContent);
        return {
          success: false,
          data: null,
          error: 'Error al parsear el archivo XML. Verifica que el formato sea correcto.',
          tipoOperacion: null
        };
      }

      const validation = this.validateXMLStructure(xmlDoc);
      if (!validation.isValid) {
        console.error('Errores de validación:', validation.errors);
        return {
          success: false,
          data: null,
          error: validation.errors.join(', '),
          tipoOperacion: null
        };
      }

      const tipoOperacion = this.detectarTipoOperacion(xmlDoc);
      console.log('Tipo de operación detectado:', tipoOperacion);

      const data = tipoOperacion === TIPOS_OPERACION_SISTEMA.NOMINA
        ? this.extractNominaData(xmlDoc)
        : this.extractProveedoresData(xmlDoc);

      console.log('Datos extraídos:', data);

      if (tipoOperacion === TIPOS_OPERACION_SISTEMA.NOMINA) {
        const nominaData = data as NominaData;
        if (!nominaData.empleados || nominaData.empleados.length === 0) {
          return {
            success: false,
            data: null,
            error: 'No se encontraron empleados en el archivo XML',
            tipoOperacion: null
          };
        }
      } else {
        const provData = data as ProveedoresData;
        if (!provData.transacciones || provData.transacciones.length === 0) {
          return {
            success: false,
            data: null,
            error: 'No se encontraron transacciones en el archivo XML',
            tipoOperacion: null
          };
        }
      }

      return {
        success: true,
        data,
        error: null,
        tipoOperacion
      };
    } catch (error) {
      console.error('Error al procesar XML:', error);
      return {
        success: false,
        data: null,
        error: `Error al procesar el archivo: ${(error as Error).message}`,
        tipoOperacion: null
      };
    }
  }

  /**
   * Detects the XML operation type
   */
  detectarTipoOperacion(xmlDoc: Document): TipoOperacionSistema {
    const tieneNomina = xmlDoc.querySelector('SalaryPayment, Payroll, Employee, CURP');
    const tieneCURP = xmlDoc.querySelector('[name*="CURP"], [tag*="CURP"]');

    const xmlText = new XMLSerializer().serializeToString(xmlDoc).toUpperCase();
    const indicadoresNomina = ['NOMINA', 'PAYROLL', 'SALARY', 'EMPLEADO', 'EMPLOYEE', 'CURP'];
    const esNomina = indicadoresNomina.some(indicador => xmlText.includes(indicador));

    return (tieneNomina || tieneCURP || esNomina)
      ? TIPOS_OPERACION_SISTEMA.NOMINA
      : TIPOS_OPERACION_SISTEMA.PROVEEDORES;
  }

  /**
   * Extracts provider XML data (pain.001)
   */
  extractProveedoresData(xmlDoc: Document): ProveedoresData {
    const transacciones: Transaccion[] = [];

    const creditTransfers = xmlDoc.getElementsByTagName('CdtTrfTxInf');

    for (let i = 0; i < creditTransfers.length; i++) {
      const tx = creditTransfers[i];

      const importeElement = this.getElementByTagNames(tx, ['InstdAmt', 'InstructedAmount', 'Amt']);
      const importe = importeElement ? importeElement.textContent?.trim() || '0' : '0';

      const ibanElement = this.getElementByTagNames(tx, ['IBAN']);
      const cuentaDestino = ibanElement ? ibanElement.textContent?.trim() || '' : '';

      const cdtrElement = this.getElementByTagNames(tx, ['Cdtr']);
      let beneficiarioNombre = '';
      if (cdtrElement) {
        const nmElement = this.getElementByTagNames(cdtrElement, ['Nm']);
        beneficiarioNombre = nmElement ? nmElement.textContent?.trim() || '' : '';
      }

      let beneficiarioId = '';
      if (cdtrElement) {
        const idElement = this.getElementByTagNames(cdtrElement, ['Id']);
        if (idElement) {
          const othrElement = this.getElementByTagNames(idElement, ['Othr']);
          if (othrElement) {
            const idValueElement = this.getElementByTagNames(othrElement, ['Id']);
            beneficiarioId = idValueElement ? idValueElement.textContent?.trim() || '' : '';
          }
        }
      }

      const rmtInfElement = this.getElementByTagNames(tx, ['RmtInf']);
      let referencia = '';
      if (rmtInfElement) {
        const ustrdElement = this.getElementByTagNames(rmtInfElement, ['Ustrd']);
        referencia = ustrdElement ? ustrdElement.textContent?.trim() || '' : '';
      }

      if (!referencia) {
        const pmtIdElement = this.getElementByTagNames(tx, ['PmtId']);
        if (pmtIdElement) {
          const endToEndIdElement = this.getElementByTagNames(pmtIdElement, ['EndToEndId']);
          referencia = endToEndIdElement ? endToEndIdElement.textContent?.trim() || '' : '';
        }
      }

      const transaccion: Transaccion = {
        id: `tx_${i + 1}`,
        importe: parseFloat(importe) || 0,
        cuentaDestino: cuentaDestino,
        beneficiarioNombre: beneficiarioNombre,
        beneficiarioId: beneficiarioId,
        referencia: referencia,
        fechaEjecucion: ''
      };

      transacciones.push(transaccion);
    }

    const pmtInfElements = xmlDoc.getElementsByTagName('PmtInf');
    let ordenanteNombre = '';
    let ordenanteCuenta = '';
    let fechaEjecucion = '';

    if (pmtInfElements.length > 0) {
      const pmtInf = pmtInfElements[0];

      const dbtrElement = this.getElementByTagNames(pmtInf, ['Dbtr']);
      if (dbtrElement) {
        const nmElement = this.getElementByTagNames(dbtrElement, ['Nm']);
        ordenanteNombre = nmElement ? nmElement.textContent?.trim() || '' : '';
      }

      const dbtrAcctElement = this.getElementByTagNames(pmtInf, ['DbtrAcct']);
      if (dbtrAcctElement) {
        const idElement = this.getElementByTagNames(dbtrAcctElement, ['Id']);
        if (idElement) {
          const ibanElement = this.getElementByTagNames(idElement, ['IBAN']);
          ordenanteCuenta = ibanElement ? ibanElement.textContent?.trim() || '' : '';
        }
      }

      const reqdExctnDtElement = this.getElementByTagNames(pmtInf, ['ReqdExctnDt']);
      if (reqdExctnDtElement) {
        const fechaISO = reqdExctnDtElement.textContent?.trim() || '';
        fechaEjecucion = this.convertirFechaISOaDDMMYYYY(fechaISO);
      }
    }

    if (!ordenanteNombre) {
      const initgPtyElement = this.getElementByTagNames(xmlDoc, ['InitgPty']);
      if (initgPtyElement) {
        const nmElement = this.getElementByTagNames(initgPtyElement, ['Nm']);
        ordenanteNombre = nmElement ? nmElement.textContent?.trim() || '' : '';
      }
    }

    transacciones.forEach(tx => {
      tx.fechaEjecucion = fechaEjecucion;
    });

    return {
      ordenante: {
        nombre: ordenanteNombre,
        cuenta: ordenanteCuenta
      },
      transacciones,
      totalTransacciones: transacciones.length,
      fechaProceso: new Date().toISOString()
    };
  }

  /**
   * Extracts payroll XML data
   */
  extractNominaData(xmlDoc: Document): NominaData {
    const empleados: EmpleadoXML[] = [];

    const empleadosNodes = xmlDoc.querySelectorAll(
      'Employee, SalaryPayment, Empleado, PaymentRecord'
    );

    empleadosNodes.forEach((emp, index) => {
      const empleado: EmpleadoXML = {
        id: `emp_${index + 1}`,
        numEmpleado: this.extractText(emp, 'Id, EmployeeId, NumEmpleado') || `${index + 1}`.padStart(10, '0'),
        nombre: this.extractText(emp, 'Nm, Name, Nombre') || '',
        salario: this.extractText(emp, 'Amt, Amount, Salario, Salary') || '0',
        clabe: this.extractText(emp, 'CLABE, AccountNumber, CuentaCLABE') || '',
        fechaPago: this.extractText(emp, 'PayDate, FechaPago, Date') || '',
        rfc: this.extractText(emp, 'RFC, TaxId') || '',
        curp: this.extractText(emp, 'CURP, PersonalId') || '',
        tipoNomina: '01'
      };

      empleados.push(empleado);
    });

    return {
      empleados,
      totalEmpleados: empleados.length,
      totalImporte: empleados.reduce((sum, emp) => sum + parseFloat(emp.salario || '0'), 0),
      fechaProceso: new Date().toISOString()
    };
  }

  /**
   * Extracts text from an XML node using multiple selectors
   */
  extractText(element: Element, selectors: string): string {
    const selectorList = selectors.split(',').map(s => s.trim());

    for (const selector of selectorList) {
      const node = element.querySelector(selector);
      if (node && node.textContent?.trim()) {
        return node.textContent.trim();
      }
    }

    return '';
  }

  /**
   * Gets an element by multiple tag names (works with namespaces)
   */
  getElementByTagNames(parent: Element | Document, tagNames: string[]): Element | null {
    for (const tagName of tagNames) {
      const elements = parent.getElementsByTagName(tagName);
      if (elements.length > 0) {
        return elements[0];
      }
    }
    return null;
  }

  /**
   * Converts ISO date (YYYY-MM-DD) to DDMMYYYY format
   */
  convertirFechaISOaDDMMYYYY(fechaISO: string): string {
    if (!fechaISO) return '';

    const fecha = fechaISO.split('T')[0];
    const partes = fecha.split('-');

    if (partes.length !== 3) return '';

    const [anio, mes, dia] = partes;
    return `${dia}${mes}${anio}`;
  }

  /**
   * Validates basic XML structure
   */
  validateXMLStructure(xmlDoc: Document): ValidationResult {
    const errors: string[] = [];

    if (!xmlDoc.documentElement) {
      errors.push('El XML no tiene un elemento raíz válido');
    }

    if (xmlDoc.documentElement && !xmlDoc.documentElement.childNodes.length) {
      errors.push('El XML está vacío');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const xmlParserService = new XMLParserService();
export default xmlParserService;
