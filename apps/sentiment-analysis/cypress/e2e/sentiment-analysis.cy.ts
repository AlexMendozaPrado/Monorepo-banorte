/**
 * E2E Tests for Sentiment Analysis Flow
 *
 * These tests cover the complete user journey from uploading a PDF
 * to viewing the sentiment analysis results.
 */

describe('Sentiment Analysis - Complete Flow', () => {
  beforeEach(() => {
    // Mock the API response to avoid calling OpenAI during tests
    cy.mockAnalyzeAPI();

    // Visit the home page
    cy.visit('/');
  });

  it('should display the landing page correctly', () => {
    // Verify main elements are visible
    cy.contains('Banorte').should('be.visible');
    cy.contains('Análisis de Sentimiento').should('be.visible');

    // Verify upload area is present
    cy.get('[data-testid="upload-zone"]').should('exist');
  });

  it('should allow file upload and show form', () => {
    // Create a dummy PDF file for testing
    const fileName = 'test-document.pdf';

    // Attach file to upload input
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: fileName,
      mimeType: 'application/pdf',
    });

    // Verify file name is displayed
    cy.contains(fileName).should('be.visible');

    // Verify form fields are visible
    cy.get('input[name="clientName"]').should('be.visible');
    cy.get('select[name="channel"]').should('be.visible');
  });

  it('should validate required fields before submission', () => {
    // Upload a file
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    // Try to submit without filling required fields
    cy.contains('button', /analizar/i).click();

    // Should show validation error
    cy.contains(/requerido/i).should('be.visible');
  });

  it('should successfully analyze a PDF and display results', () => {
    // Upload PDF
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test-document.pdf',
      mimeType: 'application/pdf',
    });

    // Fill in required fields
    cy.get('input[name="clientName"]').type('Cliente de Prueba');
    cy.get('select[name="channel"]').select('Email');

    // Submit for analysis
    cy.contains('button', /analizar/i).click();

    // Wait for API call
    cy.wait('@analyzeAPI');

    // Verify loading indicator appeared
    cy.get('[data-testid="loading"]').should('be.visible');

    // Verify results are displayed
    cy.contains('Resultado del Análisis', { timeout: 10000 }).should('be.visible');

    // Verify sentiment is shown
    cy.contains(/positivo|negativo|neutral/i).should('be.visible');

    // Verify confidence score is displayed
    cy.contains(/confianza/i).should('be.visible');
    cy.contains('92%').should('be.visible');

    // Verify emotions chart is rendered
    cy.get('.recharts-wrapper').should('be.visible');
  });

  it('should display analysis metrics correctly', () => {
    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('input[name="clientName"]').type('Test Client');
    cy.get('select[name="channel"]').select('Chat');
    cy.contains('button', /analizar/i).click();
    cy.wait('@analyzeAPI');

    // Verify metrics are shown
    cy.contains(/palabras/i).should('be.visible');
    cy.contains('250').should('be.visible'); // wordCount from fixture

    cy.contains(/oraciones/i).should('be.visible');
    cy.contains('15').should('be.visible'); // sentenceCount from fixture
  });

  it('should show emotions breakdown', () => {
    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('input[name="clientName"]').type('Test Client');
    cy.get('select[name="channel"]').select('Phone');
    cy.contains('button', /analizar/i).click();
    cy.wait('@analyzeAPI');

    // Verify emotions are displayed
    cy.contains(/alegr[ií]a|joy/i).should('be.visible');
    cy.contains(/tristeza|sadness/i).should('be.visible');
    cy.contains(/enojo|anger/i).should('be.visible');
    cy.contains(/miedo|fear/i).should('be.visible');
  });
});

describe('Sentiment Analysis - Error Handling', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show error when API fails', () => {
    // Mock API error
    cy.mockAnalyzeAPIError(500, 'Error al procesar el documento');

    // Upload and try to analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('input[name="clientName"]').type('Test Client');
    cy.get('select[name="channel"]').select('Email');
    cy.contains('button', /analizar/i).click();

    // Wait for error
    cy.wait('@analyzeAPIError');

    // Verify error message is shown
    cy.contains(/error/i).should('be.visible');
    cy.contains(/procesar/i).should('be.visible');
  });

  it('should reject non-PDF files', () => {
    // Try to upload a non-PDF file
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test content',
      fileName: 'test.txt',
      mimeType: 'text/plain',
    });

    // Should show validation error
    cy.contains(/solo.*pdf/i).should('be.visible');
  });

  it('should reject files that are too large', () => {
    // Create a large file (> 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024);

    cy.get('input[type="file"]').attachFile({
      fileContent: largeContent,
      fileName: 'large.pdf',
      mimeType: 'application/pdf',
    });

    // Should show size error
    cy.contains(/tamaño.*excede/i).should('be.visible');
  });
});

describe('Sentiment Analysis - Navigation', () => {
  it('should navigate to history page', () => {
    cy.visit('/');

    // Find and click history/historial link
    cy.get('nav a[href*="histor"]').first().click();

    // Should be on history page
    cy.url().should('include', 'histor');
    cy.contains(/historial|history/i).should('be.visible');
  });

  it('should allow navigating back from results', () => {
    cy.mockAnalyzeAPI();
    cy.visit('/');

    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: 'test PDF content',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('input[name="clientName"]').type('Test Client');
    cy.get('select[name="channel"]').select('Email');
    cy.contains('button', /analizar/i).click();
    cy.wait('@analyzeAPI');

    // Should have a way to go back or analyze another document
    cy.contains(/nuevo.*análisis|analizar.*otro/i).should('be.visible');
  });
});

describe('Sentiment Analysis - Responsiveness', () => {
  const viewports = [
    { device: 'iphone-6', width: 375, height: 667 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'desktop', width: 1280, height: 720 },
  ];

  viewports.forEach(({ device, width, height }) => {
    it(`should display correctly on ${device}`, () => {
      cy.viewport(width, height);
      cy.visit('/');

      // Main elements should be visible
      cy.contains('Banorte').should('be.visible');
      cy.get('input[type="file"]').should('exist');
    });
  });
});
