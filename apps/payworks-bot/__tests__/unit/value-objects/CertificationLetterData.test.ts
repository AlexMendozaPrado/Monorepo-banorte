import { buildCertificateCode } from '@/core/domain/value-objects/CertificationLetterData';

describe('buildCertificateCode', () => {
  it('produces a stable code for the same inputs', () => {
    const a = buildCertificateCode('ECOMMERCE_TRADICIONAL', 'session-123', '9885405');
    const b = buildCertificateCode('ECOMMERCE_TRADICIONAL', 'session-123', '9885405');
    expect(a).toBe(b);
  });

  it('uses the correct product prefix', () => {
    expect(buildCertificateCode('ECOMMERCE_TRADICIONAL', 's', 'X')).toMatch(/^CE3DS-/);
    expect(buildCertificateCode('MOTO', 's', 'X')).toMatch(/^CEMTO-/);
    expect(buildCertificateCode('API_PW2_SEGURO', 's', 'X')).toMatch(/^CEPW2-/);
    expect(buildCertificateCode('INTERREDES_REMOTO', 's', 'X')).toMatch(/^CEINT-/);
  });

  it('falls back to GEN for unknown products', () => {
    expect(buildCertificateCode('SOMETHING_ELSE', 's', '1')).toMatch(/^CEGEN-/);
  });

  it('embeds the affiliation id as suffix', () => {
    const code = buildCertificateCode('MOTO', 's-abc', '9885405');
    expect(code.endsWith('_9885405')).toBe(true);
  });

  it('pads the consecutivo to 7 digits', () => {
    const code = buildCertificateCode('MOTO', 'x', '9999');
    const match = code.match(/^CEMTO-(\d{7})_/);
    expect(match).not.toBeNull();
  });

  it('uses 0000000 suffix when no affiliation is provided', () => {
    const code = buildCertificateCode('MOTO', 'x', '');
    expect(code.endsWith('_0000000')).toBe(true);
  });
});
