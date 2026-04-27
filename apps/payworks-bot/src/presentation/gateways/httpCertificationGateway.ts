import { ApiResponse, CertificationResponse } from '@/shared/types/api';
import {
  CertificationDetailResult,
  CertificationGatewayPort,
} from './CertificationGatewayPort';

/**
 * Adaptador HTTP del puerto. Unico lugar que conoce la URL del endpoint y
 * el shape `ApiResponse<T>`. Si manana cambia el transporte (Server Actions,
 * tRPC, RSC), solo se sustituye este modulo — el hook y los componentes no
 * se modifican.
 */
export const httpCertificationGateway: CertificationGatewayPort = {
  async findById(id: string): Promise<CertificationDetailResult> {
    try {
      const response = await fetch(`/api/certificacion/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        return { ok: false, kind: 'notFound' };
      }

      const body = (await response.json()) as ApiResponse<CertificationResponse>;

      if (!response.ok || !body.success || !body.data) {
        return {
          ok: false,
          kind: 'error',
          message: body.error || `HTTP ${response.status}`,
        };
      }

      return { ok: true, data: body.data };
    } catch (error) {
      return {
        ok: false,
        kind: 'error',
        message: error instanceof Error ? error.message : 'Error de red',
      };
    }
  },
};
