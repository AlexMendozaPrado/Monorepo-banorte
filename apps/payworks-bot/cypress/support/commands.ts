/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

/**
 * Comandos personalizados para los tests E2E del bot Payworks.
 *
 * `cy.uploadBundle(slug, integrationType)` sube los archivos del bundle
 * canónico (`__tests__/fixtures/scenarios/<slug>/`) a la página
 * `/nueva-certificacion` y dispara la certificación, esperando a que
 * la URL cambie a `/resultados/<id>`.
 *
 * Los inputs file están ocultos (clase `hidden`) — usamos
 * `cypress-file-upload` con `force: true` para activar el upload sin
 * necesidad de simular el click sobre el dropzone padre.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface UploadBundleOptions {
      threeDS?: boolean;
      cybersource?: boolean;
    }

    interface Chainable {
      uploadBundle(
        slug: string,
        integration: string,
        options?: UploadBundleOptions,
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'uploadBundle',
  (
    slug: string,
    integration: string,
    options: Cypress.UploadBundleOptions = {},
  ) => {
    const base = `scenarios/${slug}`;

    cy.visit('/nueva-certificacion');

    // Selección del producto.
    cy.get(`[data-testid="integration-${integration}"]`).click();

    // Modo semi por defecto.

    // Archivos requeridos.
    cy.get('[data-testid="upload-matriz"]').attachFile(`${base}/matriz.xlsx`);
    cy.get('[data-testid="upload-csv"]').attachFile(`${base}/vtransacciones.csv`);
    cy.get('[data-testid="upload-servlet"]').attachFile(`${base}/servlet.log`);
    cy.get('[data-testid="upload-prosa"]').attachFile(`${base}/prosa.log`);

    // Logs transversales opcionales.
    if (options.threeDS) {
      cy.get('[data-testid="upload-3ds"]').attachFile(`${base}/threeds.log`);
    }
    if (options.cybersource) {
      cy.get('[data-testid="upload-cybersource"]').attachFile(`${base}/cybersource.log`);
    }

    // Afiliaciones (todos los bundles canónicos la incluyen).
    cy.get('[data-testid="upload-afiliaciones"]').attachFile(`${base}/afiliaciones.csv`);

    // Disparar certificación.
    cy.get('[data-testid="submit-certification"]').click();

    // Esperar a la página de resultados.
    cy.url({ timeout: 60000 }).should('match', /\/resultados\/[\w-]+/);
  },
);

export {};
