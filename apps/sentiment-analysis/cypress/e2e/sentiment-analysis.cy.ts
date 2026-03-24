/**
 * Tests E2E para el Flujo de Análisis de Sentimiento
 *
 * Estos tests cubren el recorrido completo del usuario:
 * subir un PDF → llenar el formulario → analizar → ver resultados.
 *
 * A diferencia de los unit tests (que usan mocks de clase),
 * aquí los mocks son a nivel HTTP con cy.intercept().
 */

describe('Análisis de Sentimiento - Flujo Completo', () => {
  beforeEach(() => {
    // Interceptar todas las APIs GET que la app llama al cargar
    cy.mockAppAPIs();

    // Interceptar la API de análisis para NO llamar a OpenAI real
    cy.mockAnalyzeAPI();

    // Visitar la página de la app (no el landing page)
    cy.visit('/app');
  });

  it('debería mostrar la página correctamente', () => {
    // Verificar que los elementos principales son visibles
    cy.contains('Análisis de Sentimientos').should('be.visible');
    cy.contains('Analizar Documento').should('be.visible');

    // Verificar que el área de subida existe
    cy.get('input[type="file"]').should('exist');
  });

  it('debería permitir subir archivo y mostrar el formulario', () => {
    // Crear un archivo PDF dummy para testing
    const fileName = 'test-document.pdf';

    // Adjuntar archivo al input de subida
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: fileName,
      mimeType: 'application/pdf',
    });

    // Verificar que el nombre del archivo se muestra
    cy.contains(fileName).should('be.visible');

    // Verificar que los campos del formulario son visibles
    cy.contains('Nombre del Cliente').should('be.visible');
    cy.contains('Canal de Comunicación').should('be.visible');
  });

  it('debería validar campos requeridos antes de enviar', () => {
    // Subir un archivo
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    // Intentar enviar sin llenar campos — el botón debería estar deshabilitado
    cy.get('button.MuiButton-contained').contains(/analizar documento/i).should('be.disabled');
  });

  it('debería analizar un PDF exitosamente y mostrar resultados', () => {
    // Subir PDF
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test-document.pdf',
      mimeType: 'application/pdf',
    });

    // Llenar nombre del cliente (MUI TextField)
    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Cliente de Prueba');

    // Seleccionar canal (MUI Select)
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Correo Electrónico').click();

    // Enviar para análisis
    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();

    // Esperar la respuesta de la API (interceptada por el mock)
    cy.wait('@analyzeAPI');

    // Verificar que se muestran los resultados
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verificar que la información de sentimiento se muestra
    cy.contains('Sentimiento General').should('be.visible');
  });

  it('debería mostrar las métricas del análisis correctamente', () => {
    // Subir y analizar
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

    // Verificar que aparece la sección de resultados
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verificar que las métricas de texto se muestran
    cy.contains('Métricas del Texto').should('be.visible');
  });

  it('debería mostrar el desglose de emociones', () => {
    // Subir y analizar
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

    // Verificar que se muestran los resultados
    cy.contains('Resultados del Análisis', { timeout: 15000 }).should('be.visible');

    // Verificar que existe la sección de distribución de emociones
    cy.contains('Distribución de Emociones').should('be.visible');
  });
});

describe('Análisis de Sentimiento - Manejo de Errores', () => {
  beforeEach(() => {
    cy.mockAppAPIs();
    cy.visit('/app');
  });

  it('debería mostrar error cuando la API falla', () => {
    // Configurar el interceptor para devolver error (simula fallo del servidor)
    cy.mockAnalyzeAPIError(500, 'Error al procesar el documento');

    // Subir archivo
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test PDF content']),
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    });

    // Llenar campos requeridos
    cy.get('label').contains('Nombre del Cliente').parent().parent().find('input').type('Test Client');
    cy.get('label').contains('Canal de Comunicación').parent().parent().find('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Correo Electrónico').click();

    cy.get('button.MuiButton-contained').contains(/analizar documento/i).click();

    // Esperar la respuesta de error
    cy.wait('@analyzeAPIError');

    // Verificar que se muestra el mensaje de error
    cy.contains(/error/i).should('be.visible');
  });

  it('debería rechazar archivos que no son PDF', () => {
    // Intentar subir un archivo de texto (no PDF)
    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob(['test content']),
      fileName: 'test.txt',
      mimeType: 'text/plain',
    });

    // Debería mostrar error de validación
    cy.contains(/no válido|Solo se permiten archivos PDF/i).should('be.visible');
  });

  it('debería rechazar archivos demasiado grandes', () => {
    // Crear un archivo grande (> 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024);

    cy.get('input[type="file"]').attachFile({
      fileContent: new Blob([largeContent]),
      fileName: 'large.pdf',
      mimeType: 'application/pdf',
    });

    // Debería mostrar error de tamaño
    cy.contains(/demasiado grande/i).should('be.visible');
  });
});

describe('Análisis de Sentimiento - Navegación', () => {
  it('debería navegar a la pestaña de historial', () => {
    cy.mockAppAPIs();
    cy.visit('/app');

    // Buscar y hacer clic en la pestaña de historial (MUI Tab)
    cy.get('[role="tab"]').contains('Historial de Análisis').click();

    // Debería mostrar el contenido del panel de historial
    cy.get('#simple-tabpanel-1').should('not.have.attr', 'hidden');
    cy.contains('Historial de Análisis').should('be.visible');
    cy.contains(/No se encontraron análisis/).should('be.visible');
  });

  it('debería permitir regresar desde los resultados', () => {
    cy.mockAppAPIs();
    cy.mockAnalyzeAPI();
    cy.visit('/app');

    // Subir y analizar
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

    // Debería tener el botón de limpiar disponible para resetear
    cy.contains('button', /limpiar/i).should('be.visible');
  });
});

describe('Análisis de Sentimiento - Responsividad', () => {
  const viewports = [
    { device: 'iphone-6', width: 375, height: 667 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'desktop', width: 1280, height: 720 },
  ];

  viewports.forEach(({ device, width, height }) => {
    it(`debería mostrarse correctamente en ${device}`, () => {
      cy.viewport(width, height);
      cy.mockAppAPIs();
      cy.visit('/app');

      // Los elementos principales deben ser visibles
      cy.contains('Análisis de Sentimientos').should('be.visible');
      cy.get('input[type="file"]').should('exist');
    });
  });
});
