/**
 * E2E smoke — Bundle 02 OPENLINEA · Esquema 4 sin AGP.
 *
 * Regresión clave: este bundle disparaba un falso negativo previo por
 * `ENTRY_MODE = CONTACTLESSCHIP` rechazado en el config (Fase A.3 del
 * feedback del equipo lo agregó al `validValues`). Si la Fase A se
 * regresa, este test detecta el fallo.
 */

describe('E2E — Bundle 02 OPENLINEA (Agregadores CE · Esquema 4 sin AGP)', () => {
  it('flujo completo y CONTACTLESSCHIP ya no debe disparar falso negativo', () => {
    cy.uploadBundle('02-openlinea-esquema-4-sin-agp', 'AGREGADORES_COMERCIO_ELECTRONICO');

    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Verificar que no aparece el mensaje específico de falso negativo
    // antes resuelto en Fase A.3 (CONTACTLESSCHIP no debe ser inválido).
    cy.get('body').should(
      'not.contain.text',
      'Valor "CONTACTLESSCHIP" no está en [MANUAL]',
    );
  });
});
