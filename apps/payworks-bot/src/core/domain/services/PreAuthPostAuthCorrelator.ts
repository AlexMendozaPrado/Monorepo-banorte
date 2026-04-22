import { TransactionType } from '../value-objects/TransactionType';

/**
 * Snapshot mínimo por transacción que el correlador necesita. La
 * aplicación lo construye a partir de la matriz + `servletRequest`.
 */
export interface CorrelationInput {
  transactionRef: string;
  numeroControl: string;
  transactionType: TransactionType;
  customerRef2?: string;
}

export interface CorrelationIssue {
  /** Referencia de la transacción POSTAUT donde se reporta la falla. */
  postAuthRef: string;
  /** Referencia de la PREAUT emparejada. */
  preAuthRef: string;
  reason: 'inconsistent_customer_ref2';
  detail: string;
}

/**
 * Regla cruzada **C8** (Manual Ecommerce Tradicional v2.5 pág. 10):
 * *"Si se usa en operativa de PRE y POSTAUTORIZACION, el valor que
 * envíe en ambas transacciones debe ser igual."*
 *
 * Correlador puro: recibe la lista de transacciones validadas en la
 * sesión, empareja PREAUT↔POSTAUT por `numeroControl` (la clave interna
 * del comercio que ata ambos movimientos a la misma orden), y emite un
 * issue si `CUSTOMER_REF2` difiere entre el par.
 *
 * Política:
 *   - Si ambos valores son vacíos → se considera consistente (no falla).
 *   - Si solo uno está presente → falla con detalle explícito.
 *   - Si ambos presentes y distintos → falla.
 *   - POSTAUT sin PREAUT par → no falla aquí (lo cubre otra regla de
 *     integridad si aplica).
 */
export class PreAuthPostAuthCorrelator {
  correlate(transactions: CorrelationInput[]): CorrelationIssue[] {
    const preauthsByNumControl = new Map<string, CorrelationInput>();
    for (const t of transactions) {
      if (t.transactionType === TransactionType.PREAUTH && t.numeroControl) {
        preauthsByNumControl.set(t.numeroControl, t);
      }
    }

    const issues: CorrelationIssue[] = [];
    for (const t of transactions) {
      if (t.transactionType !== TransactionType.POSTAUTH) continue;
      if (!t.numeroControl) continue;
      const pre = preauthsByNumControl.get(t.numeroControl);
      if (!pre) continue;

      const preRef = (pre.customerRef2 ?? '').trim();
      const postRef = (t.customerRef2 ?? '').trim();
      if (preRef === postRef) continue;

      issues.push({
        postAuthRef: t.transactionRef,
        preAuthRef: pre.transactionRef,
        reason: 'inconsistent_customer_ref2',
        detail:
          `C8: CUSTOMER_REF2 difiere entre PREAUT (ref="${pre.transactionRef}", valor="${preRef || '(vacío)'}") ` +
          `y POSTAUT (ref="${t.transactionRef}", valor="${postRef || '(vacío)'}"). ` +
          'El manual exige valores idénticos.',
      });
    }

    return issues;
  }
}
