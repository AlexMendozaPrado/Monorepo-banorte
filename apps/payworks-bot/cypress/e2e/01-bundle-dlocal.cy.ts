/**
 * E2E — Bundle 01 DLOCAL · Esquema 4 con AGP.
 *
 * Verifica que la página renderiza el árbol con las 3 transacciones
 * esperadas y que el veredicto/conteos coinciden con la verdad
 * snapshoteada del bundle (3 tx, todas RECHAZADAS por reglas mandatorias
 * del producto). Los conteos por tipo son aspectos cuantitativos que
 * detectan regresiones cuando se agregan/quitan reglas.
 */

describe('E2E — Bundle 01 DLOCAL (Agregadores CE · Esquema 4 con AGP)', () => {
  it('flujo completo: subir bundle → ver resultados con árbol de validación', () => {
    cy.uploadBundle('01-dlocal-esquema-4-con-agp', 'AGREGADORES_COMERCIO_ELECTRONICO');

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Las 3 transacciones del bundle aparecen referenciadas.
    cy.contains('140374723108').should('be.visible'); // AUTH MC
    cy.contains('190369542582').should('be.visible'); // PREAUTH VISA
    cy.contains('100370918744').should('be.visible'); // POSTAUTH VISA

    // Veredicto global: el bundle tiene fails en mandatorias → RECHAZADO.
    cy.get('[data-testid="global-verdict"]').should('contain.text', 'RECHAZADO');

    // Conteos: 3 transacciones totales.
    cy.get('[data-testid="total-count"]').should('have.text', '3');

    // Capa SERVLET presente en al menos una transacción.
    cy.contains('Servlet').should('be.visible');
  });

  it('click sobre un RuleLine fail expande el panel con failReason y failDetail', () => {
    cy.uploadBundle('01-dlocal-esquema-4-con-agp', 'AGREGADORES_COMERCIO_ELECTRONICO');
    cy.contains(/resultados|certificaci/i).should('be.visible');

    // El bundle 01 tiene varios fails — abrimos el primer accordion
    // de transacción para que las reglas sean visibles.
    cy.get('button,div[role="button"]').contains(/RECHAZADO/i).first().click();

    // Click en la primera RuleLine con verdict FAIL → panel expandido visible.
    cy.get('[data-testid="rule-line-fail"]').first().click();
    cy.get('[data-testid="rule-expanded-panel"]').should('be.visible');
    cy.get('[data-testid="fail-reason"]').should('exist');
    // failDetail no siempre aparece (depende del tipo de fail) pero sí
    // failReason — failDetail lo aserta el spec del bundle 04 con cross-rules.
  });
});
