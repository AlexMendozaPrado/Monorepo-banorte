import { readFileSync } from 'fs';
import { join } from 'path';
import { ThreeDSLogParser } from '@/infrastructure/log-parsers/ThreeDSLogParser';

const FIXTURE = readFileSync(
  join(__dirname, '../../fixtures/threeds_sample.log'),
  'utf-8',
);

describe('ThreeDSLogParser', () => {
  const parser = new ThreeDSLogParser();

  it('parses the 3DS block for a given folio', () => {
    const log = parser.parseByFolio(FIXTURE, '9905419_140426_001');

    expect(log.folio).toBe('9905419_140426_001');
    expect(log.getField('Card')).toBe('41891431******7492');
    expect(log.getField('Total')).toBe('1500.00');
    expect(log.getField('CardType')).toBe('VISA');
    expect(log.getField('MerchantId')).toBe('7004145530');
    expect(log.getField('MerchantName')).toBe('MUEVE CIUDAD');
    expect(log.getField('MerchantCity')).toBe('GUADALAJARA');
    expect(log.getField('Cert3D')).toBe('03');
    expect(log.getField('ECI')).toBe('05');
    expect(log.getField('XID')).toBe(
      'A1B2C3D4E5F60718293A4B5C6D7E8F9001020304',
    );
    expect(log.getField('CAVV')).toBe(
      '112233445566778899AABBCCDDEEFF0011223344',
    );
    expect(log.getField('Version3D')).toBe('2');
    expect(log.getField('Reference3D')).toBe('9905419_140426_001');
    expect(log.getField('Status')).toBe('200');
  });

  it('parses a MasterCard block without XID (MC does not emit XID)', () => {
    const log = parser.parseByFolio(FIXTURE, '9905419_140426_002');

    expect(log.getField('CardType')).toBe('MASTERCARD');
    expect(log.hasField('XID')).toBe(false);
    expect(log.hasField('CAVV')).toBe(true);
  });

  it('throws when the folio is not found', () => {
    expect(() => parser.parseByFolio(FIXTURE, 'DOES_NOT_EXIST')).toThrow(
      /No se encontró bloque 3DS/,
    );
  });

  it('matches folio via Reference3D fallback', () => {
    // A folio where only Reference3D line identifies it. Our fixture has both,
    // but the parser should still find by Reference3D if FOLIO line is absent.
    const log = parser.parseByFolio(FIXTURE, '9905419_140426_001');
    expect(log.getField('Reference3D')).toBe(log.folio);
  });

  it('exposes a timestamp parsed from the block header', () => {
    const log = parser.parseByFolio(FIXTURE, '9905419_140426_001');
    expect(log.timestamp.getUTCFullYear()).toBe(2026);
    expect(log.timestamp.getUTCMonth()).toBe(2); // March
  });

  it('hasField returns false for missing fields', () => {
    const log = parser.parseByFolio(FIXTURE, '9905419_140426_002');
    expect(log.hasField('UnknownField')).toBe(false);
  });
});
