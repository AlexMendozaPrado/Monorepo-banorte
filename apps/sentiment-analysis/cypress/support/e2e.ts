// ***********************************************************
// This support file runs before every test file.
// ***********************************************************

import 'cypress-file-upload';
import './commands';  // Import custom commands

// Add custom commands here
Cypress.Commands.add('getBySel', (selector: string, ...args) => {
  return cy.get(`[data-testid="${selector}"]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector: string, ...args) => {
  return cy.get(`[data-testid*="${selector}"]`, ...args);
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getBySel('greeting')
       */
      getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to select DOM element by partial data-testid attribute match.
       * @example cy.getBySelLike('submit')
       */
      getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Prevent TypeScript errors
export {};
