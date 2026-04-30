/**
 * E2E smoke — Bundle 03 ZIGU · Esquema 1 (Tasa Natural).
 *
 * Producto: Agregadores Comercio Electrónico bajo esquema 1 (sin
 * SUB_MERCHANT/AGGREGATOR_ID). Smoke test para confirmar que la página
 * de resultados se renderiza con el árbol de capas.
 */

describe('E2E — Bundle 03 ZIGU (Agregadores CE · Esquema 1 Tasa Natural)', () => {
  it('flujo completo con esquema natural', () => {
    cy.uploadBundle('03-zigu-esquema-1', 'AGREGADORES_COMERCIO_ELECTRONICO');

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Capa SERVLET debe estar presente en el árbol.
    cy.contains('Servlet').should('be.visible');
  });
});
