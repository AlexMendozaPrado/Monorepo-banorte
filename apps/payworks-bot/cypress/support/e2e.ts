// Soporte cargado antes de cada spec. Importa los comandos custom y
// `cypress-file-upload` para soportar `cy.attachFile()` sobre inputs
// hidden (los del UploadCard).

import './commands';
import 'cypress-file-upload';

/**
 * Por defecto Cypress falla el test ante cualquier excepción no
 * capturada en la app. En modo dev de Next.js es común ver warnings de
 * hydration mismatch que no representan un bug real (dev-only quirks,
 * extensiones del navegador, etc.). En E2E nos interesa el estado final
 * — no la pureza de la hydration. Suprimimos esos errores para que los
 * specs sigan corriendo.
 *
 * `return false` evita que Cypress falle el test. Devolver `undefined`
 * deja el comportamiento default.
 */
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Hydration failed') || err.message.includes('hydrating')) {
    return false;
  }
  // Cualquier otra excepción sí debe romper el test.
  return undefined;
});
