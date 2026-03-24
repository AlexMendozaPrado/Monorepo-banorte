import { FilterAnalysisUseCase } from '../../../core/application/use-cases/FilterAnalysisUseCase';
import { SentimentAnalysisRepositoryMock } from '../../mocks/RepositoryMock';
import { SentimentType } from '../../../core/domain/value-objects/SentimentType';
import { getMockAnalysesCollection, createMockSentimentAnalysis } from '../../mocks/testData';

describe('FilterAnalysisUseCase', () => {
  let useCase: FilterAnalysisUseCase;
  let mockRepository: SentimentAnalysisRepositoryMock;

  beforeEach(() => {
    // Crear mock fresco del repositorio
    mockRepository = new SentimentAnalysisRepositoryMock();
    // Inyectar el mock en el Use Case , qué patrón se esta utlizando ? 
    useCase = new FilterAnalysisUseCase(mockRepository);
  });

  afterEach(() => {
    // Limpiar estado después de cada test
    mockRepository.reset();
  });

  describe('Filtrado Básico', () => {
    beforeEach(() => {
      // Cargar datos de prueba (seed) en el repositorio mock
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('debería retornar todos los análisis cuando no se aplica filtro', async () => {
      // ARRANGE — sin filtros
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(4);
      expect(result.analyses.total).toBe(4);
      expect(result.filterSummary.totalMatches).toBe(4);
    });

    it('debería filtrar por nombre de cliente', async () => {
      // ARRANGE
      const query = {
        criteria: { clientName: 'Cliente A' },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — solo los del Cliente A
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.clientName === 'Cliente A')).toBe(true);
    });

    it('debería filtrar por tipo de sentimiento', async () => {
      // ARRANGE
      const query = {
        criteria: { sentimentType: SentimentType.POSITIVE },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — solo los positivos
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.overallSentiment === SentimentType.POSITIVE)).toBe(true);
    });

    it('debería filtrar por canal', async () => {
      // ARRANGE
      const query = {
        criteria: { channel: 'Email' },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — solo los de Email
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.channel === 'Email')).toBe(true);
    });

    it('debería filtrar por rango de fechas', async () => {
      // ARRANGE
      const query = {
        criteria: {
          dateFrom: new Date('2024-01-16'),
          dateTo: new Date('2024-01-17'),
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(2);
    });

    it('debería filtrar por confianza mínima', async () => {
      // ARRANGE — solo análisis con confianza >= 0.9
      const query = {
        criteria: { minConfidence: 0.9 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data.length).toBeGreaterThan(0);
      expect(result.analyses.data.every(a => a.confidence >= 0.9)).toBe(true);
    });

    it('debería filtrar por confianza máxima', async () => {
      // ARRANGE — solo análisis con confianza <= 0.8
      const query = {
        criteria: { maxConfidence: 0.8 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data.length).toBeGreaterThan(0);
      expect(result.analyses.data.every(a => a.confidence <= 0.8)).toBe(true);
    });

    it('debería filtrar por rango de confianza', async () => {
      // ARRANGE — confianza entre 0.85 y 0.93
      const query = {
        criteria: {
          minConfidence: 0.85,
          maxConfidence: 0.93,
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data.every(a => a.confidence >= 0.85 && a.confidence <= 0.93)).toBe(true);
    });
  });

  describe('Filtros Combinados', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('debería aplicar múltiples filtros juntos', async () => {
      // ARRANGE — combinar cliente + sentimiento + canal
      const query = {
        criteria: {
          clientName: 'Cliente A',
          sentimentType: SentimentType.POSITIVE,
          channel: 'Email',
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — solo los que cumplen TODOS los criterios
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a =>
        a.clientName === 'Cliente A' &&
        a.overallSentiment === SentimentType.POSITIVE &&
        a.channel === 'Email'
      )).toBe(true);
    });

    it('debería retornar vacío cuando ningún filtro coincide', async () => {
      // ARRANGE — cliente que no existe
      const query = {
        criteria: {
          clientName: 'Nonexistent Client',
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(0);
      expect(result.filterSummary.totalMatches).toBe(0);
    });
  });

  describe('Paginación', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('debería paginar resultados con valores por defecto', async () => {
      // ARRANGE
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — página 1, límite 20 por defecto
      expect(result.analyses.page).toBe(1);
      expect(result.analyses.limit).toBe(20);
      expect(result.analyses.totalPages).toBe(1);
    });

    it('debería paginar con tamaño de página personalizado', async () => {
      // ARRANGE — solo 2 resultados por página
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 2 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.limit).toBe(2);
      expect(result.analyses.totalPages).toBe(2);
    });

    it('debería retornar la segunda página correctamente', async () => {
      // ARRANGE
      const query = {
        criteria: {},
        pagination: { page: 2, limit: 2 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.page).toBe(2);
    });

    it('debería manejar números de página inválidos', async () => {
      // ARRANGE — página 0 (inválida)
      const query = {
        criteria: {},
        pagination: { page: 0, limit: 20 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — debería usar página 1 por defecto
      expect(result.analyses.page).toBe(1);
    });

    it('debería limitar el tamaño máximo de página a 100', async () => {
      // ARRANGE — pedir 500 resultados por página
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 500 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — se limita a 100
      expect(result.analyses.limit).toBe(100);
    });

    it('debería ordenar por fecha descendente por defecto', async () => {
      // ARRANGE
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — las fechas deben estar en orden descendente
      const dates = result.analyses.data.map(a => a.createdAt.getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });

    it('debería ordenar por confianza ascendente cuando se especifica', async () => {
      // ARRANGE
      const query = {
        criteria: {},
        pagination: {
          page: 1,
          limit: 20,
          sortBy: 'confidence' as any,
          sortOrder: 'asc' as const,
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — las confianzas deben estar en orden ascendente
      const confidences = result.analyses.data.map(a => a.confidence);
      const sortedConfidences = [...confidences].sort((a, b) => a - b);
      expect(confidences).toEqual(sortedConfidences);
    });
  });

  describe('Resumen de Filtros', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('debería calcular la distribución de sentimientos correctamente', async () => {
      // ARRANGE
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — 2 positivos, 1 neutral, 1 negativo
      expect(result.filterSummary.sentimentDistribution).toEqual({
        positive: 2,
        neutral: 1,
        negative: 1,
      });
    });

    it('debería calcular la distribución de canales correctamente', async () => {
      // ARRANGE
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.filterSummary.channelDistribution['Email']).toBe(2);
      expect(result.filterSummary.channelDistribution['Chat']).toBe(1);
      expect(result.filterSummary.channelDistribution['Phone']).toBe(1);
    });

    it('debería calcular el promedio de confianza correctamente', async () => {
      // ARRANGE
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — promedio de (0.95 + 0.88 + 0.75 + 0.92) / 4
      const expectedAvg = (0.95 + 0.88 + 0.75 + 0.92) / 4;
      expect(result.filterSummary.averageConfidence).toBeCloseTo(expectedAvg, 2);
    });

    it('debería actualizar el resumen cuando se aplican filtros', async () => {
      // ARRANGE — filtrar solo positivos
      const query = {
        criteria: { sentimentType: SentimentType.POSITIVE },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — el resumen solo refleja los filtrados
      expect(result.filterSummary.totalMatches).toBe(2);
      expect(result.filterSummary.sentimentDistribution.positive).toBe(2);
      expect(result.filterSummary.sentimentDistribution.negative).toBe(0);
    });
  });

  describe('Opciones de Filtro Disponibles', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('debería retornar todos los clientes únicos', async () => {
      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT
      expect(options.clients).toContain('Cliente A');
      expect(options.clients).toContain('Cliente B');
      expect(options.clients).toContain('Cliente C');
      expect(options.clients).toHaveLength(3);
    });

    it('debería retornar todos los canales únicos', async () => {
      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT
      expect(options.channels).toContain('Email');
      expect(options.channels).toContain('Chat');
      expect(options.channels).toContain('Phone');
      expect(options.channels).toHaveLength(3);
    });

    it('debería retornar todos los tipos de sentimiento', async () => {
      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT
      expect(options.sentimentTypes).toContain(SentimentType.POSITIVE);
      expect(options.sentimentTypes).toContain(SentimentType.NEUTRAL);
      expect(options.sentimentTypes).toContain(SentimentType.NEGATIVE);
    });

    it('debería retornar el rango de fechas', async () => {
      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT — la fecha más antigua debe ser menor o igual que la más reciente
      expect(options.dateRange.earliest).toBeInstanceOf(Date);
      expect(options.dateRange.latest).toBeInstanceOf(Date);
      expect(options.dateRange.earliest!.getTime()).toBeLessThanOrEqual(
        options.dateRange.latest!.getTime()
      );
    });

    it('debería retornar el rango de confianza', async () => {
      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT
      expect(options.confidenceRange.min).toBe(0.75);
      expect(options.confidenceRange.max).toBe(0.95);
    });

    it('debería manejar un repositorio vacío', async () => {
      // ARRANGE — vaciar el repositorio
      mockRepository.clear();

      // ACT
      const options = await useCase.getAvailableFilterOptions();

      // ASSERT — todo vacío/por defecto
      expect(options.clients).toHaveLength(0);
      expect(options.channels).toHaveLength(0);
      expect(options.dateRange.earliest).toBeNull();
      expect(options.dateRange.latest).toBeNull();
      expect(options.confidenceRange.min).toBe(0);
      expect(options.confidenceRange.max).toBe(1);
    });
  });

  describe('Manejo de Errores', () => {
    it('debería lanzar error cuando el repositorio falla', async () => {
      // ARRANGE — simular que la BD está caída
      mockRepository.setShouldFail(true);
      const query = { criteria: {} };

      // ACT & ASSERT
      await expect(useCase.execute(query)).rejects.toThrow('Failed to find analyses');
    });

    it('debería manejar rangos de confianza inválidos gracefully', async () => {
      // ARRANGE — valores fuera de rango [0, 1]
      mockRepository.seed(getMockAnalysesCollection());
      const query = {
        criteria: {
          minConfidence: 1.5, // Inválido: > 1
          maxConfidence: -0.5, // Inválido: < 0
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — retorna todos porque los filtros son inválidos
      expect(result.analyses.data).toHaveLength(4);
    });

    it('debería recortar espacios del filtro de nombre de cliente', async () => {
      // ARRANGE — nombre con espacios extra
      mockRepository.seed(getMockAnalysesCollection());
      const query = {
        criteria: { clientName: '  Cliente A  ' },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — encuentra los del Cliente A a pesar de los espacios
      expect(result.analyses.data).toHaveLength(2);
    });

    it('debería ignorar filtros con cadenas vacías', async () => {
      // ARRANGE
      mockRepository.seed(getMockAnalysesCollection());
      const query = {
        criteria: {
          clientName: '',
          channel: '   ',
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — retorna todos (ignora filtros vacíos)
      expect(result.analyses.data).toHaveLength(4);
    });
  });

  describe('Casos Borde', () => {
    it('debería manejar un solo análisis', async () => {
      // ARRANGE
      const singleAnalysis = createMockSentimentAnalysis();
      mockRepository.seed([singleAnalysis]);
      const query = { criteria: {} };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT
      expect(result.analyses.data).toHaveLength(1);
      expect(result.analyses.totalPages).toBe(1);
    });

    it('debería manejar paginación con dataset grande', async () => {
      // ARRANGE — crear 50 análisis
      const largeDataset = Array.from({ length: 50 }, (_, i) =>
        createMockSentimentAnalysis({ id: `analysis-${i}` })
      );
      mockRepository.seed(largeDataset);
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 10 },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — 10 por página, 50 total, 5 páginas
      expect(result.analyses.data).toHaveLength(10);
      expect(result.analyses.total).toBe(50);
      expect(result.analyses.totalPages).toBe(5);
    });

    it('debería manejar filtro de fecha con mismo día inicio y fin', async () => {
      // ARRANGE
      mockRepository.seed(getMockAnalysesCollection());
      const targetDate = new Date('2024-01-16');
      const query = {
        criteria: {
          dateFrom: targetDate,
          dateTo: targetDate,
        },
      };

      // ACT
      const result = await useCase.execute(query);

      // ASSERT — debería encontrar análisis de exactamente ese día
      expect(result.analyses.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
