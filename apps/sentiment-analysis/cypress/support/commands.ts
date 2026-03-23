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

/**
 * Mock the GET APIs that the app calls on load (recent analyses, history, trends)
 */
Cypress.Commands.add('mockAppAPIs', () => {
  cy.intercept('GET', '/api/analyses/recent*', {
    statusCode: 200,
    body: { success: true, data: [] },
  }).as('recentAPI');

  cy.intercept('GET', '/api/analyses/history*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        analyses: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
        statistics: {
          totalAnalyses: 0,
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
          averageConfidence: 0,
          mostCommonChannel: '',
        },
      },
    },
  }).as('historyAPI');

  cy.intercept('GET', '/sessions/trends*', {
    statusCode: 200,
    body: { success: true, data: [] },
  }).as('trendsAPI');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mockAnalyzeAPI(fixture?: string): Chainable<void>;
      mockAnalyzeAPIError(statusCode?: number, message?: string): Chainable<void>;
      mockAppAPIs(): Chainable<void>;
    }
  }
}

export {};
