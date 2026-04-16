import { readFileSync } from 'fs';
import { join } from 'path';
import { CybersourceLogParser } from '@/infrastructure/log-parsers/CybersourceLogParser';

const FIXTURE = readFileSync(
  join(__dirname, '../../fixtures/cybersource_sample.log'),
  'utf-8',
);

describe('CybersourceLogParser', () => {
  const parser = new CybersourceLogParser();

  it('parses request + response for a given OrderId', () => {
    const result = parser.parseByOrderId(FIXTURE, 'ORD-9885405-001');

    expect(result.request.type).toBe('REQUEST');
    expect(result.response.type).toBe('RESPONSE');
    expect(result.request.getField('MerchantID')).toBe('liverpool_mx');
    expect(result.request.getField('BillTo_firstName')).toBe('Juan');
    expect(result.request.getField('BillTo_email')).toBe('juan.perez@example.com');
    expect(result.request.getField('Card_cardType')).toBe('001');
    expect(result.request.getField('PurchaseTotals_grandTotalAmount')).toBe('1500.00');
    expect(result.response.getField('decision')).toBe('ACCEPT');
    expect(result.response.getField('reasonCode')).toBe('100');
    expect(result.response.getField('Bnte_code')).toBe('00');
  });

  it('parses the second OrderId block (REJECT) independently', () => {
    const result = parser.parseByOrderId(FIXTURE, 'ORD-9885405-002');

    expect(result.request.getField('BillTo_firstName')).toBe('María');
    expect(result.request.getField('Card_cardType')).toBe('002');
    expect(result.response.getField('decision')).toBe('REJECT');
    expect(result.response.getField('reasonCode')).toBe('202');
  });

  it('throws when the OrderId is not found', () => {
    expect(() => parser.parseByOrderId(FIXTURE, 'ORD-DOES-NOT-EXIST')).toThrow(
      /No se encontró bloque Cybersource/,
    );
  });

  it('hasField returns false for empty or missing fields', () => {
    const result = parser.parseByOrderId(FIXTURE, 'ORD-9885405-001');
    expect(result.request.hasField('MerchantID')).toBe(true);
    expect(result.request.hasField('DOES_NOT_EXIST')).toBe(false);
  });

  it('exposes timestamps from the block header', () => {
    const result = parser.parseByOrderId(FIXTURE, 'ORD-9885405-001');
    expect(result.request.timestamp.getUTCFullYear()).toBe(2026);
    expect(result.request.timestamp.getUTCMonth()).toBe(2); // March (0-indexed)
  });

  it('tolerates a log without the password field (masked)', () => {
    const result = parser.parseByOrderId(FIXTURE, 'ORD-9885405-001');
    // Password line exists but with '********' — parser still records it
    expect(result.request.hasField('Password')).toBe(true);
    expect(result.request.getField('Password')).toBe('********');
  });
});
