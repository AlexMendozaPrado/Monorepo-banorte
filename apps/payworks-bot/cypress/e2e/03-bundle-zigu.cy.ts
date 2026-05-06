/**
 * E2E — Bundle 03 ZIGU · Esquema 1 (Tasa Natural).
 *
 * Producto: Agregadores Comercio Electrónico bajo esquema 1 (sin
 * SUB_MERCHANT/AGGREGATOR_ID). 2 transacciones, RECHAZADO por reglas
 * mandatorias.
 */

describe('E2E — Bundle 03 ZIGU (Agregadores CE · Esquema 1 Tasa Natural)', () => {
  it('flujo completo con esquema natural', () => {
    cy.uploadBundle('03-zigu-esquema-1', 'AGREGADORES_COMERCIO_ELECTRONICO');

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Capa SERVLET debe estar presente.
    cy.contains('Servlet').should('be.visible');

    // Veredicto + conteos snapshot.
    cy.get('[data-testid="global-verdict"]').should('contain.text', 'RECHAZADO');
    cy.get('[data-testid="total-count"]').should('have.text', '2');
  });
});
