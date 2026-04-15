import { readFileSync } from 'fs';
import { join } from 'path';
import { AfiliacionFileParser } from '@/infrastructure/parsers/AfiliacionFileParser';
import { InMemoryAfiliacionRepository } from '@/infrastructure/repositories/InMemoryAfiliacionRepository';

const CSV_BUFFER = readFileSync(
  join(__dirname, '../../fixtures/afiliaciones_sample.csv'),
);

describe('AfiliacionFileParser', () => {
  const parser = new AfiliacionFileParser();

  it('parses CSV rows and maps canonical fields', () => {
    const rows = parser.parse(CSV_BUFFER, 'afiliaciones.csv');

    expect(rows).toHaveLength(3);
    const muevecdx = rows[0];
    expect(muevecdx.idAfiliacion).toBe('7004145530');
    expect(muevecdx.nombreComercio).toBe('MUEVE CIUDAD');
    expect(muevecdx.razonSocial).toBe('Mueve Ciudad SA de CV');
    expect(muevecdx.rfc).toBe('MCC101010AAA');
    expect(muevecdx.numeroCliente).toBe('9885405');
    expect(muevecdx.esquema).toBe('ESQ_4_CON_AGP');
    expect(muevecdx.ciudad).toBe('Ciudad de México');
    expect(muevecdx.codigoPostal).toBe('06600');
    expect(muevecdx.email).toBe('soporte@mueveciudad.mx');
    expect(muevecdx.status).toBe('A');
  });

  it('captures unmapped columns under extras', () => {
    const rows = parser.parse(CSV_BUFFER, 'afiliaciones.csv');
    expect(rows[0].extras).toEqual({ CUSTOM_FIELD: 'valor-extra' });
    // Row 2 has an empty CUSTOM_FIELD — extras should be undefined
    expect(rows[1].extras).toBeUndefined();
  });

  it('leaves missing optional fields undefined', () => {
    const rows = parser.parse(CSV_BUFFER, 'afiliaciones.csv');
    const amazon = rows[2];
    expect(amazon.telefono).toBeUndefined(); // empty cell
    expect(amazon.giro).toBe('Ecommerce');
  });

  it('auto-detects semicolon separator', () => {
    const semiBuf = Buffer.from(
      'ID_AFILIACION;NOMBRE_COMERCIO;RFC\n12345;Test Merchant;TST010101XXX\n',
      'utf-8',
    );
    const rows = parser.parse(semiBuf, 'afiliaciones.csv');
    expect(rows).toHaveLength(1);
    expect(rows[0].idAfiliacion).toBe('12345');
    expect(rows[0].nombreComercio).toBe('Test Merchant');
  });

  it('auto-detects pipe separator for .txt files', () => {
    const pipeBuf = Buffer.from(
      'AFILIACION|NOMBRE|RFC\n99999|Comercio Pipe|PIP010101YYY\n',
      'utf-8',
    );
    const rows = parser.parse(pipeBuf, 'export.txt');
    expect(rows).toHaveLength(1);
    expect(rows[0].idAfiliacion).toBe('99999');
    expect(rows[0].nombreComercio).toBe('Comercio Pipe');
  });

  it('gives a useful displayLabel when nombreComercio missing', () => {
    const buf = Buffer.from(
      'ID_AFILIACION,RAZON_SOCIAL\n77777,"Sólo Razón Social SA"\n',
      'utf-8',
    );
    const rows = parser.parse(buf, 'x.csv');
    expect(rows[0].getDisplayLabel()).toBe('Sólo Razón Social SA');
  });
});

describe('InMemoryAfiliacionRepository', () => {
  it('hydrates from a CSV buffer and indexes by idAfiliacion', () => {
    const repo = new InMemoryAfiliacionRepository();
    const count = repo.loadFromFile(CSV_BUFFER, 'afiliaciones.csv');

    expect(count).toBe(3);
    expect(repo.existsById('7004145530')).toBe(true);
    expect(repo.findByIdAfiliacion('7004145530')?.nombreComercio).toBe('MUEVE CIUDAD');
    expect(repo.findByIdAfiliacion('does-not-exist')).toBeUndefined();
  });

  it('replaces previous data on subsequent loadFromFile', () => {
    const repo = new InMemoryAfiliacionRepository();
    repo.loadFromFile(CSV_BUFFER, 'afiliaciones.csv');

    const small = Buffer.from('ID_AFILIACION,NOMBRE_COMERCIO\nABC,"Uno solo"\n', 'utf-8');
    const count = repo.loadFromFile(small, 'nuevo.csv');

    expect(count).toBe(1);
    expect(repo.existsById('7004145530')).toBe(false);
    expect(repo.findByIdAfiliacion('ABC')?.nombreComercio).toBe('Uno solo');
  });

  it('clear() empties the repository', () => {
    const repo = new InMemoryAfiliacionRepository();
    repo.loadFromFile(CSV_BUFFER, 'afiliaciones.csv');
    repo.clear();
    expect(repo.listAll()).toHaveLength(0);
  });
});
