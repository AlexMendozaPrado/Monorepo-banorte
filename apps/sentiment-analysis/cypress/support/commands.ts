// ***********************************************
// Comandos personalizados de Cypress para reutilización
// ***********************************************

/**
 * Intercepta la API de análisis con una respuesta exitosa predefinida.
 * Esto evita llamar a OpenAI durante los tests E2E.
 * Es el equivalente a los mocks de clase, pero a nivel HTTP.
 */
Cypress.Commands.add('mockAnalyzeAPI', (fixture = 'analysis-success.json') => {
  cy.intercept('POST', '/api/analyze', {
    fixture,
  }).as('analyzeAPI');
});

/**
 * Intercepta la API de análisis para devolver un error.
 * Simula un fallo del servidor (equivalente a setShouldFail(true) en unit tests).
 */
Cypress.Commands.add('mockAnalyzeAPIError', (statusCode = 500, message = 'Internal Server Error') => {
  cy.intercept('POST', '/api/analyze', {
    statusCode,
    body: { error: message },
  }).as('analyzeAPIError');
});

/**
 * Intercepta todas las APIs GET que la app llama al cargar.
 * Sin estos interceptores, la app intentaría llamar al backend real.
 */
Cypress.Commands.add('mockAppAPIs', () => {
  // Mock de análisis recientes
  cy.intercept('GET', '/api/analyses/recent*', {
    statusCode: 200,
    body: { success: true, data: [] },
  }).as('recentAPI');

  // Mock del historial
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

  // Mock de tendencias
  cy.intercept('GET', '/sessions/trends*', {
    statusCode: 200,
    body: { success: true, data: [] },
  }).as('trendsAPI');
});

// Definiciones de tipos para los comandos personalizados
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
