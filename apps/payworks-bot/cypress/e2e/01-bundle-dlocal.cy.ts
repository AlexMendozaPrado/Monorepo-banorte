/**
 * E2E smoke — Bundle 01 DLOCAL · Esquema 4 con AGP.
 *
 * Verifica el happy path UI completo: subir el bundle, esperar
 * resultados y assertear que el árbol de validación se renderiza
 * con la cantidad esperada de transacciones (3) y que aparece la
 * capa SERVLET. No assertea verdicts específicos por ahora — eso
 * queda como TODO de cobertura detallada.
 */

describe('E2E — Bundle 01 DLOCAL (Agregadores CE · Esquema 4 con AGP)', () => {
  it('flujo completo: subir bundle → ver resultados con árbol de validación', () => {
    cy.uploadBundle('01-dlocal-esquema-4-con-agp', 'AGREGADORES_COMERCIO_ELECTRONICO');

    // Página de resultados visible.
    cy.contains(/resultados|certificaci/i).should('be.visible');

    // Las 3 transacciones del bundle aparecen referenciadas.
    cy.contains('140374723108').should('be.visible'); // AUTH MC
    cy.contains('190369542582').should('be.visible'); // PREAUTH VISA
    cy.contains('100370918744').should('be.visible'); // POSTAUTH VISA

    // Capa SERVLET presente en al menos una transacción.
    cy.contains('Servlet').should('be.visible');
  });
});
