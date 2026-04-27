import { CertificationSession } from '@/core/domain/entities/CertificationSession';
import { CertificationResponse } from '@/shared/types/api';

/**
 * Mapea una `CertificationSession` del dominio al DTO `CertificationResponse`
 * que consume la capa de presentación. Centralizar la serialización evita que
 * cada Route Handler la duplique y deja un único punto de cambio cuando crece
 * el contrato del DTO.
 */
export function toCertificationResponse(session: CertificationSession): CertificationResponse {
  const sessionWithMethods = session as CertificationSession & {
    getVerdict: () => string;
    getTotalTransactions: () => number;
    getApprovedCount: () => number;
    getRejectedCount: () => number;
    getApprovalRate: () => number;
  };

  return {
    id: session.id,
    merchantName: session.merchantName,
    integrationType: session.integrationType,
    operationMode: session.operationMode,
    verdict: sessionWithMethods.getVerdict(),
    totalTransactions: sessionWithMethods.getTotalTransactions(),
    approvedCount: sessionWithMethods.getApprovedCount(),
    rejectedCount: sessionWithMethods.getRejectedCount(),
    approvalRate: sessionWithMethods.getApprovalRate(),
    results: session.results.map((r) => {
      const resultWithMethods = r as typeof r & {
        getPassedCount?: () => number;
        getFailedCount?: () => number;
        getTotalValidated?: () => number;
      };
      return {
        transactionRef: r.transactionRef,
        transactionType: r.transactionType,
        cardBrand: r.cardBrand,
        verdict: r.verdict,
        passedCount: resultWithMethods.getPassedCount?.() ?? 0,
        failedCount: resultWithMethods.getFailedCount?.() ?? 0,
        totalValidated: resultWithMethods.getTotalValidated?.() ?? 0,
        fieldResults: r.fieldResults.map((f) => ({
          field: f.field,
          manualName: f.manualName,
          displayName: f.displayName,
          rule: f.rule,
          found: f.found,
          value: f.value,
          verdict: f.verdict,
          source: f.source,
          layer: f.layer,
        })),
      };
    }),
    createdAt: session.createdAt.toISOString(),
  };
}
