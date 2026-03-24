// ***********************************************************
// Este archivo de soporte se ejecuta antes de cada archivo de prueba.
// ***********************************************************

import 'cypress-file-upload';
import './commands';  // Importar comandos personalizados

// Agregar comandos personalizados aquí
Cypress.Commands.add('getBySel', (selector: string, ...args) => {
  return cy.get(`[data-testid="${selector}"]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector: string, ...args) => {
  return cy.get(`[data-testid*="${selector}"]`, ...args);
});

// Declarar comandos personalizados para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando personalizado para seleccionar elemento DOM por atributo data-testid.
       * @example cy.getBySel('greeting')
       */
      getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;

      /**
       * Comando personalizado para seleccionar elemento DOM por coincidencia parcial de atributo data-testid.
       * @example cy.getBySelLike('submit')
       */
      getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Prevenir errores de TypeScript
export {};
