/**
 * E2E — Bundle 04 ECOMMERCE TRADICIONAL · 3DS + Cybersource.
 *
 * Bundle más complejo: ejercita las 3 capas transversales (servlet +
 * 3DS + Cybersource). 1 transacción.
 *
 * Tras el fix B.4 (may-2026): la capa Cybersource ahora debe aparecer
 * en el árbol porque el orquestador correla por ID_CYBERSOURCE del
 * servlet (no por la referencia de PROSA).
 *
 * Regresión Fase A.1: las reglas POSTAUT_* en `layer-3ds.json` antes
 * eran R y disparaban ~20 falsos negativos. Ahora son N/A.
 */

describe('E2E — Bundle 04 ECOMMERCE TRADICIONAL (3DS + Cybersource)', () => {
  it('flujo completo con capas 3DS y Cybersource activadas', () => {
    cy.uploadBundle(
      '04-ecommerce-3ds-cybersource',
      'ECOMMERCE_TRADICIONAL',
      { threeDS: true, cybersource: true },
    );

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Las 3 capas transversales activas en el árbol.
    cy.contains('Servlet').should('exist');
    cy.contains('3D Secure').should('exist');
    cy.contains('Cybersource').should('exist'); // Activada tras fix B.4.

    // Veredicto + conteos snapshot.
    cy.get('[data-testid="global-verdict"]').should('contain.text', 'RECHAZADO');
    cy.get('[data-testid="total-count"]').should('have.text', '1');
  });
});
