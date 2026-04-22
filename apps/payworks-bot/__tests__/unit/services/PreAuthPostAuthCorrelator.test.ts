import { PreAuthPostAuthCorrelator } from '@/core/domain/services/PreAuthPostAuthCorrelator';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';

describe('PreAuthPostAuthCorrelator (C8)', () => {
  const corr = new PreAuthPostAuthCorrelator();

  it('pasa cuando PREAUT y POSTAUT tienen el mismo CUSTOMER_REF2', () => {
    const issues = corr.correlate([
      { transactionRef: 'PRE-1', numeroControl: 'CTRL-A', transactionType: TransactionType.PREAUTH, customerRef2: 'ORDER-123' },
      { transactionRef: 'POST-1', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH, customerRef2: 'ORDER-123' },
    ]);
    expect(issues).toEqual([]);
  });

  it('falla cuando CUSTOMER_REF2 difiere entre par', () => {
    const issues = corr.correlate([
      { transactionRef: 'PRE-1', numeroControl: 'CTRL-A', transactionType: TransactionType.PREAUTH, customerRef2: 'ORDER-123' },
      { transactionRef: 'POST-1', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH, customerRef2: 'ORDER-999' },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].postAuthRef).toBe('POST-1');
    expect(issues[0].preAuthRef).toBe('PRE-1');
    expect(issues[0].reason).toBe('inconsistent_customer_ref2');
    expect(issues[0].detail).toContain('C8');
  });

  it('pasa cuando ambos CUSTOMER_REF2 están vacíos', () => {
    const issues = corr.correlate([
      { transactionRef: 'PRE-1', numeroControl: 'CTRL-A', transactionType: TransactionType.PREAUTH },
      { transactionRef: 'POST-1', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH },
    ]);
    expect(issues).toEqual([]);
  });

  it('falla cuando solo uno de los dos trae CUSTOMER_REF2', () => {
    const issues = corr.correlate([
      { transactionRef: 'PRE-1', numeroControl: 'CTRL-A', transactionType: TransactionType.PREAUTH, customerRef2: 'ORDER-123' },
      { transactionRef: 'POST-1', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].detail).toContain('(vacío)');
  });

  it('POSTAUT sin PREAUT con igual numeroControl no genera fallo aquí', () => {
    const issues = corr.correlate([
      { transactionRef: 'POST-1', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH, customerRef2: 'X' },
    ]);
    expect(issues).toEqual([]);
  });

  it('correlaciona múltiples pares independientes', () => {
    const issues = corr.correlate([
      { transactionRef: 'PRE-A', numeroControl: 'CTRL-A', transactionType: TransactionType.PREAUTH, customerRef2: 'AAA' },
      { transactionRef: 'POST-A', numeroControl: 'CTRL-A', transactionType: TransactionType.POSTAUTH, customerRef2: 'AAA' },
      { transactionRef: 'PRE-B', numeroControl: 'CTRL-B', transactionType: TransactionType.PREAUTH, customerRef2: 'BBB' },
      { transactionRef: 'POST-B', numeroControl: 'CTRL-B', transactionType: TransactionType.POSTAUTH, customerRef2: 'BBX' },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].postAuthRef).toBe('POST-B');
  });

  it('ignora VOID/REFUND/AUTH (solo PREAUT↔POSTAUT correlacionan)', () => {
    const issues = corr.correlate([
      { transactionRef: 'AUTH-1', numeroControl: 'CTRL-A', transactionType: TransactionType.AUTH, customerRef2: 'XXX' },
      { transactionRef: 'VOID-1', numeroControl: 'CTRL-A', transactionType: TransactionType.VOID, customerRef2: 'YYY' },
    ]);
    expect(issues).toEqual([]);
  });
});
