/**
 * E2E — UI states del flow de certificación.
 *
 * Foco: estados de la UI durante el submit del form de
 * `/nueva-certificacion`, NO la lógica de validación. Cubre los 2 bugs
 * reportados en producción (loading state ausente + doble click) en
 * navegador real, donde jsdom no captura focus-stealing exacto.
 *
 * Usa `cy.intercept` para controlar latencia y respuestas del endpoint
 * `/api/certificacion/validar` sin depender de la matriz/logs reales.
 */

const BUNDLE = '01-dlocal-esquema-4-con-agp';
const INTEGRATION = 'AGREGADORES_COMERCIO_ELECTRONICO';

describe('E2E — UI states (loading + idempotencia primer click)', () => {
  it('Bug 1: spinner Loader2 visible durante el fetch en vuelo', () => {
    cy.intercept('POST', '/api/certificacion/validar', req => {
      // Delay artificial de 2.5s para asertar el estado intermedio.
      req.reply({
        delay: 2500,
        body: { success: true, data: { id: 'fake-loading-test' } },
      });
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);

    cy.get('[data-testid="submit-certification"]').click();

    // Estado intermedio durante el fetch:
    cy.get('[data-testid="submit-certification"]').should('be.disabled');
    cy.get('[data-testid="submit-certification"]').should(
      'contain.text',
      'Procesando',
    );
    // El spinner del componente Button (<Loader2 className="animate-spin"/>)
    // debe estar visible dentro del botón. Es la regresión del Bug 1
    // (commit 545b684 — UploadCard ahora pasa isLoading={isLoading}).
    cy.get('[data-testid="submit-certification"] svg.animate-spin').should(
      'be.visible',
    );

    cy.wait('@validar');
  });

  it('Bug 2: un solo click es suficiente para disparar el fetch', () => {
    let callCount = 0;
    cy.intercept('POST', '/api/certificacion/validar', req => {
      callCount += 1;
      req.reply({
        delay: 500,
        body: { success: true, data: { id: 'single-click-test' } },
      });
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);

    // Tipear en un input de coordinador antes del click — esto reproduce
    // el escenario del bug 2 (focus-stealing entre input y botón).
    cy.get('input[placeholder*="Fabio"]').type('Test User');

    // Un único click. Si el bug 2 estuviera activo, este click no
    // dispararía el fetch y la siguiente assertion fallaría con timeout.
    cy.get('[data-testid="submit-certification"]').click();

    // Espera corta (5s) — si requiriera un segundo click, este wait
    // expira porque callCount sigue en 0 y la response nunca llega.
    cy.wait('@validar', { timeout: 5000 }).then(() => {
      expect(callCount).to.eq(1);
    });
  });

  it('navega a /resultados/:id en éxito', () => {
    cy.intercept('POST', '/api/certificacion/validar', {
      body: { success: true, data: { id: 'success-nav-test' } },
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);
    cy.get('[data-testid="submit-certification"]').click();

    cy.wait('@validar');
    cy.url().should('match', /\/resultados\/success-nav-test$/);
  });

  it('renderiza banner de error si backend devuelve {success: false}', () => {
    cy.intercept('POST', '/api/certificacion/validar', {
      body: {
        success: false,
        error: 'Bundle inválido: matriz no parseable',
      },
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);
    cy.get('[data-testid="submit-certification"]').click();

    cy.wait('@validar');
    cy.contains(/Bundle inválido: matriz no parseable/i).should('be.visible');

    // Botón vuelve a estado idle (no disabled) para permitir reintento.
    cy.get('[data-testid="submit-certification"]').should('not.be.disabled');
    cy.get('[data-testid="submit-certification"]').should(
      'contain.text',
      'Iniciar Certificacion',
    );
  });

  it('renderiza banner de error si backend devuelve HTTP 500', () => {
    cy.intercept('POST', '/api/certificacion/validar', {
      statusCode: 500,
      body: { success: false, error: 'Internal server error' },
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);
    cy.get('[data-testid="submit-certification"]').click();

    cy.wait('@validar');
    cy.contains(/Internal server error/i).should('be.visible');
    cy.url().should('match', /\/nueva-certificacion$/);
  });

  it('selector de laboratorio (CAV/ECOMM/AGREG) actualiza el laboratoryType en el FormData', () => {
    cy.intercept('POST', '/api/certificacion/validar', req => {
      // Capturamos el FormData enviado para asertar el valor del lab.
      const body = req.body as string;
      expect(body).to.include('AGREGADORES_AGREGADOR');
      req.reply({
        body: { success: true, data: { id: 'lab-test' } },
      });
    }).as('validar');

    cy.fillCertificationForm(BUNDLE, INTEGRATION);

    // Cambiar lab a Agregadores → Agregador.
    cy.get('[data-testid="lab-AGREGADORES_AGREGADOR"]').click();

    cy.get('[data-testid="submit-certification"]').click();
    cy.wait('@validar');
  });
});
