// ***********************************************
// Custom commands for reusability
// ***********************************************

/**
 * Mock the analyze API endpoint with a predefined response
 */
Cypress.Commands.add('mockAnalyzeAPI', (fixture = 'analysis-success.json') => {
  cy.intercept('POST', '/api/analyze', {
    fixture,
  }).as('analyzeAPI');
});

/**
 * Mock the analyze API to return an error
 */
Cypress.Commands.add('mockAnalyzeAPIError', (statusCode = 500, message = 'Internal Server Error') => {
  cy.intercept('POST', '/api/analyze', {
    statusCode,
    body: { error: message },
  }).as('analyzeAPIError');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mockAnalyzeAPI(fixture?: string): Chainable<void>;
      mockAnalyzeAPIError(statusCode?: number, message?: string): Chainable<void>;
    }
  }
}

export {};
