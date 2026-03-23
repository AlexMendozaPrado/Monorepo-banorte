/**
 * E2E Tests for Sentiment Analysis Flow
 *
 * These tests cover the complete user journey from uploading a PDF
 * to viewing the sentiment analysis results.
 */

describe('Sentiment Analysis - Complete Flow', () => {
  beforeEach(() => {
    // Mock all GET APIs the app calls on load
    cy.mockAppAPIs();

    // Mock the API response to avoid calling OpenAI during tests
    cy.mockAnalyzeAPI();

    // Visit the app page (not the landing page)
    cy.visit('/app');
  });

  it('should display the app page correctly', () => {
    // Verify main elements are visible
    cy.contains('Análisis de Sentimientos').should('be.visible');
    cy.contains('Analizar Documento').should('be.visible');

    // Verify upload area is present
    cy.get('input[type="file"]').should('exist');
  });

  it('should allow file upload and show form', () => {
    // Create a dummy PDF file for testing
    const fileName = 'test-document.pdf';

    // Attach file to upload input
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: fileName,
      mimeType: 'application/pdf',
    });

    // Verify file name is displayed
    cy.contains(fileName).should('be.visible');

    // Verify form fields are visible (MUI TextField renders label text)
    cy.contains('Nombre del Cliente').should('be.visible');
    cy.contains('Canal de Comunicación').should('be.visible');
  });

  it('should validate required fields before submission', () => {
    // Upload a file
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    // Try to submit without filling required fields - button should be disabled
    cy.get('button.MuiButton-contained').contains(/analizar documento/i).should('be.disabled');
  });

  it('should successfully analyze a PDF and display results', () => {
    // Upload PDF
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test-document.pdf',
      mimeType: 'application/pdf',
    });

    // Fill in client name (MUI TextField)
    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Cliente de Prueba');

    // Fill in channel (MUI Select)
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Correo Electrónico').click();

    // Submit for analysis
    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();

    // Wait for API call
    cy.wait('@analyzeAPI');

    // Verify results card is displayed (dynamic import may take a moment)
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verify sentiment information is shown
    cy.contains('Sentimiento General').should('be.visible');
  });

  it('should display analysis metrics correctly', () => {
    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Test Client');
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Chat en Línea').click();

    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();
    cy.wait('@analyzeAPI');

    // Verify results section appears (dynamic import may take a moment)
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verify text metrics are shown
    cy.contains('Métricas del Texto').should('be.visible');
  });

  it('should show emotions breakdown', () => {
    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Test Client');
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Call Center').click();

    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();
    cy.wait('@analyzeAPI');

    // Verify results are displayed (dynamic import may take a moment)
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verify emotion distribution chart section exists
    cy.contains('Distribución de Emociones').should('be.visible');
  });
});

describe('Sentiment Analysis - Error Handling', () => {
  beforeEach(() => {
    cy.mockAppAPIs();
    cy.visit('/app');
  });

  it('should show error when API fails', () => {
    // Mock API error
    cy.mockAnalyzeAPIError(500, 'Error al procesar el documento');

    // Upload file
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    // Fill required fields
    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Test Client');
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Correo Electrónico').click();

    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();

    // Wait for error
    cy.wait('@analyzeAPIError');

    // Verify error message is shown
    cy.contains(/error/i).should('be.visible');
  });

  it('should reject non-PDF files', () => {
    // Try to upload a non-PDF file
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test content']),
      fileName: 'test.txt',
      mimeType: 'text/plain',
    });

    // Should show validation error
    cy.contains(/no válido|Solo se permiten archivos PDF/i).should('be.visible');
  });

  it('should reject files that are too large', () => {
    // Create a large file (> 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024);

    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob([largeContent]),
      fileName: 'large.pdf',
      mimeType: 'application/pdf',
    });

    // Should show size error
    cy.contains(/demasiado grande/i).should('be.visible');
  });
});

describe('Sentiment Analysis - Navigation', () => {
  it('should navigate to history tab', () => {
    cy.mockAppAPIs();
    cy.visit('/app');

    // Find and click the history tab (it's a MUI Tab button)
    cy.get('[role="tab"]').contains('Historial de Análisis').click();

    // Should show history panel content
    cy.get('#simple-tabpanel-1').should('not.have.attr', 'hidden');
    cy.contains('Historial de Análisis').should('be.visible');
    cy.contains(/No se encontraron análisis/).should('be.visible');
  });

  it('should allow navigating back from results', () => {
    cy.mockAppAPIs();
    cy.mockAnalyzeAPI();
    cy.visit('/app');

    // Upload and analyze
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Test Client');
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Correo Electrónico').click();

    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();
    cy.wait('@analyzeAPI');

    // Should still have the form area available (Limpiar button to reset)
    cy.contains('button', /limpiar/i).should('be.visible');
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
      cy.mockAppAPIs();
      cy.visit('/app');

      // Main elements should be visible
      cy.contains('Análisis de Sentimientos').should('be.visible');
      cy.get('input[type="file"]').should('exist');
    });
  });
});
