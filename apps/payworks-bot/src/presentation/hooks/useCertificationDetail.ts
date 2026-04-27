'use client';

import { useEffect, useState } from 'react';
import { CertificationResponse } from '@/shared/types/api';
import { CertificationGatewayPort } from '@/presentation/gateways/CertificationGatewayPort';
import { httpCertificationGateway } from '@/presentation/gateways/httpCertificationGateway';

export type CertificationDetailState =
  | { kind: 'loading' }
  | { kind: 'data'; data: CertificationResponse }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

/**
 * ViewModel del detalle de certificacion. Recibe el gateway por argumento con
 * un default de produccion para que los tests puedan inyectar un fake sin
 * mockear `fetch`.
 */
export function useCertificationDetail(
  id: string | undefined,
  gateway: CertificationGatewayPort = httpCertificationGateway,
): CertificationDetailState {
  const [state, setState] = useState<CertificationDetailState>({ kind: 'loading' });

  useEffect(() => {
    if (!id) {
      setState({ kind: 'error', message: 'ID de certificacion ausente' });
      return;
    }

    let cancelled = false;
    setState({ kind: 'loading' });

    gateway.findById(id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setState({ kind: 'data', data: result.data });
        return;
      }
      if (result.kind === 'notFound') {
        setState({ kind: 'notFound' });
        return;
      }
      setState({ kind: 'error', message: result.message });
    });

    return () => {
      cancelled = true;
    };
  }, [id, gateway]);

  return state;
}
