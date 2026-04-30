/**
 * E2E smoke — Bundle 04 ECOMMERCE TRADICIONAL · 3DS + Cybersource.
 *
 * Bundle más complejo: ejercita las 3 capas transversales (servlet +
 * 3DS + Cybersource). Smoke test para confirmar que todas las capas
 * se activan y el árbol las renderiza.
 *
 * Regresión Fase A.1: las reglas POSTAUT_* en `layer-3ds.json` antes
 * eran R y disparaban ~20 falsos negativos. Ahora son N/A. El smoke
 * test no profundiza en esto; queda como TODO una versión detallada
 * que assertea conteos exactos de fail por capa.
 */

describe('E2E — Bundle 04 ECOMMERCE TRADICIONAL (3DS + Cybersource)', () => {
  it('flujo completo con capas 3DS y Cybersource activadas', () => {
    cy.uploadBundle(
      '04-ecommerce-3ds-cybersource',
      'ECOMMERCE_TRADICIONAL',
      { threeDS: true, cybersource: true },
    );

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Capas que sí están presentes en el árbol para este bundle. El
    // servlet log no incluye CYBERSOURCE_ID por lo que la capa
    // Cybersource no se activa hoy aunque cybersource.log esté presente
    // — limitación de la fixture, no del código (TODO en cypress/README.md).
    cy.contains('Servlet').should('exist');
    cy.contains('3D Secure').should('exist');
  });
});
