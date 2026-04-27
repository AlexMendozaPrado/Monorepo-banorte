import { CertificationResponse } from '@/shared/types/api';

export type CertificationDetailResult =
  | { ok: true; data: CertificationResponse }
  | { ok: false; kind: 'notFound' }
  | { ok: false; kind: 'error'; message: string };

/**
 * Puerto que el lado cliente (hooks, componentes) usa para obtener el detalle
 * de una certificacion. Esconde el transporte (HTTP, mock, in-memory) detras
 * de una interfaz tipada — equivalente al RemoteDataSource del lado mobile.
 */
export interface CertificationGatewayPort {
  findById(id: string): Promise<CertificationDetailResult>;
}
