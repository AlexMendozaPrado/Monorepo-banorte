/**
 * @jest-environment node
 */
import { GET } from '@/app/api/certificacion/[id]/route';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { CertificationSessionEntity } from '@/core/domain/entities/CertificationSession';
import { ValidationResultEntity } from '@/core/domain/entities/ValidationResult';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { ValidationLayer } from '@/core/domain/value-objects/ValidationLayer';
import { NextRequest } from 'next/server';

function buildSession(id: string): CertificationSessionEntity {
  return new CertificationSessionEntity(
    id,
    'Liverpool',
    IntegrationType.ECOMMERCE_TRADICIONAL,
    'semi',
    [
      new ValidationResultEntity('REF-1', TransactionType.AUTH, CardBrand.VISA, [
        {
          field: 'CARD_NUMBER',
          rule: 'R',
          found: true,
          value: 'X',
          verdict: 'PASS',
          source: 'SERVLET',
          layer: ValidationLayer.SERVLET,
        },
      ]),
    ],
    new Date('2026-04-27T12:00:00.000Z'),
  );
}

describe('GET /api/certificacion/[id]', () => {
  beforeEach(() => {
    DIContainer.reset();
    const container = DIContainer.getInstance({ operationMode: 'semi' });
    // limpiar cualquier sesion previa entre tests
    (container.certificationRepository as unknown as { clear: () => void }).clear();
  });

  it('devuelve 200 con el DTO cuando la sesion existe', async () => {
    const container = DIContainer.getInstance({ operationMode: 'semi' });
    await container.certificationRepository.save(buildSession('cert-ok'));

    const res = await GET({} as NextRequest, { params: { id: 'cert-ok' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('cert-ok');
    expect(body.data.merchantName).toBe('Liverpool');
    expect(body.data.results).toHaveLength(1);
  });

  it('devuelve 404 si la sesion no existe', async () => {
    const res = await GET({} as NextRequest, { params: { id: 'no-existe' } });
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/no encontrada/i);
  });

  it('devuelve 400 si el id viene vacio', async () => {
    const res = await GET({} as NextRequest, { params: { id: '' } });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
