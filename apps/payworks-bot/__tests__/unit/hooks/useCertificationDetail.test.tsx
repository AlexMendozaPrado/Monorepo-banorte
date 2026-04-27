/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useCertificationDetail } from '@/presentation/hooks/useCertificationDetail';
import { CertificationGatewayPort } from '@/presentation/gateways/CertificationGatewayPort';
import { CertificationResponse } from '@/shared/types/api';

const fixture: CertificationResponse = {
  id: 'cert-1',
  merchantName: 'Liverpool',
  integrationType: 'ECOMMERCE_TRADICIONAL',
  operationMode: 'semi',
  verdict: 'APROBADO',
  totalTransactions: 1,
  approvedCount: 1,
  rejectedCount: 0,
  approvalRate: 100,
  results: [],
  createdAt: '2026-04-27T12:00:00.000Z',
};

function makeGateway(impl: CertificationGatewayPort['findById']): CertificationGatewayPort {
  return { findById: impl };
}

describe('useCertificationDetail', () => {
  it('expone state=loading inicial y luego state=data al resolver', async () => {
    const gateway = makeGateway(async () => ({ ok: true, data: fixture }));
    const { result } = renderHook(() => useCertificationDetail('cert-1', gateway));

    expect(result.current.kind).toBe('loading');

    await waitFor(() => expect(result.current.kind).toBe('data'));
    if (result.current.kind === 'data') {
      expect(result.current.data.id).toBe('cert-1');
    }
  });

  it('expone state=notFound si el gateway devuelve notFound', async () => {
    const gateway = makeGateway(async () => ({ ok: false, kind: 'notFound' }));
    const { result } = renderHook(() => useCertificationDetail('x', gateway));

    await waitFor(() => expect(result.current.kind).toBe('notFound'));
  });

  it('expone state=error si el gateway devuelve error', async () => {
    const gateway = makeGateway(async () => ({ ok: false, kind: 'error', message: 'boom' }));
    const { result } = renderHook(() => useCertificationDetail('x', gateway));

    await waitFor(() => expect(result.current.kind).toBe('error'));
    if (result.current.kind === 'error') {
      expect(result.current.message).toBe('boom');
    }
  });

  it('expone state=error inmediato si id es undefined', async () => {
    const gateway = makeGateway(async () => ({ ok: true, data: fixture }));
    const { result } = renderHook(() => useCertificationDetail(undefined, gateway));

    await waitFor(() => expect(result.current.kind).toBe('error'));
  });
});
