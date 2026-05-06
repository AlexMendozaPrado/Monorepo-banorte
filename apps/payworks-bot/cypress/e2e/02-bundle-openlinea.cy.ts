/**
 * E2E — Bundle 02 OPENLINEA · Esquema 4 sin AGP.
 *
 * Regresión clave: este bundle disparaba un falso negativo previo por
 * `ENTRY_MODE = CONTACTLESSCHIP` rechazado en el config (Fase A.3 del
 * feedback del equipo lo agregó al `validValues`). Si la Fase A se
 * regresa, este test detecta el fallo.
 *
 * Veredicto: RECHAZADO por reglas mandatorias (1 tx, varios fails).
 */

describe('E2E — Bundle 02 OPENLINEA (Agregadores CE · Esquema 4 sin AGP)', () => {
  it('flujo completo y CONTACTLESSCHIP ya no debe disparar falso negativo', () => {
    cy.uploadBundle('02-openlinea-esquema-4-sin-agp', 'AGREGADORES_COMERCIO_ELECTRONICO');

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // No falso negativo de Fase A.3.
    cy.get('body').should(
      'not.contain.text',
      'Valor "CONTACTLESSCHIP" no está en [MANUAL]',
    );

    // Veredicto + conteos snapshot.
    cy.get('[data-testid="global-verdict"]').should('contain.text', 'RECHAZADO');
    cy.get('[data-testid="total-count"]').should('have.text', '1');
  });
});
