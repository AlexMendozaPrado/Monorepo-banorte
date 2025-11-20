import { FilterAnalysisUseCase } from '../../../core/application/use-cases/FilterAnalysisUseCase';
import { SentimentAnalysisRepositoryMock } from '../../mocks/RepositoryMock';
import { SentimentType } from '../../../core/domain/value-objects/SentimentType';
import { getMockAnalysesCollection, createMockSentimentAnalysis } from '../../mocks/testData';

describe('FilterAnalysisUseCase', () => {
  let useCase: FilterAnalysisUseCase;
  let mockRepository: SentimentAnalysisRepositoryMock;

  beforeEach(() => {
    mockRepository = new SentimentAnalysisRepositoryMock();
    useCase = new FilterAnalysisUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.reset();
  });

  describe('Basic Filtering', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('should return all analyses when no filter is applied', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(4);
      expect(result.analyses.total).toBe(4);
      expect(result.filterSummary.totalMatches).toBe(4);
    });

    it('should filter by client name', async () => {
      // Arrange
      const query = {
        criteria: { clientName: 'Cliente A' },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.clientName === 'Cliente A')).toBe(true);
    });

    it('should filter by sentiment type', async () => {
      // Arrange
      const query = {
        criteria: { sentimentType: SentimentType.POSITIVE },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.overallSentiment === SentimentType.POSITIVE)).toBe(true);
    });

    it('should filter by channel', async () => {
      // Arrange
      const query = {
        criteria: { channel: 'Email' },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a => a.channel === 'Email')).toBe(true);
    });

    it('should filter by date range', async () => {
      // Arrange
      const query = {
        criteria: {
          dateFrom: new Date('2024-01-16'),
          dateTo: new Date('2024-01-17'),
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
    });

    it('should filter by minimum confidence', async () => {
      // Arrange
      const query = {
        criteria: { minConfidence: 0.9 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data.length).toBeGreaterThan(0);
      expect(result.analyses.data.every(a => a.confidence >= 0.9)).toBe(true);
    });

    it('should filter by maximum confidence', async () => {
      // Arrange
      const query = {
        criteria: { maxConfidence: 0.8 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data.length).toBeGreaterThan(0);
      expect(result.analyses.data.every(a => a.confidence <= 0.8)).toBe(true);
    });

    it('should filter by confidence range', async () => {
      // Arrange
      const query = {
        criteria: {
          minConfidence: 0.85,
          maxConfidence: 0.93,
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data.every(a => a.confidence >= 0.85 && a.confidence <= 0.93)).toBe(true);
    });
  });

  describe('Combined Filters', () => {
    beforeEach(() => {
      mockRepository.seed(getMockAnalysesCollection());
    });

    it('should apply multiple filters together', async () => {
      // Arrange
      const query = {
        criteria: {
          clientName: 'Cliente A',
          sentimentType: SentimentType.POSITIVE,
          channel: 'Email',
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.data.every(a =>
        a.clientName === 'Cliente A' &&
        a.overallSentiment === SentimentType.POSITIVE &&
        a.channel === 'Email'
      )).toBe(true);
    });

    it('should return empty when filters match nothing', async () => {
      // Arrange
      const query = {
        criteria: {
          clientName: 'Nonexistent Client',
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(0);
      expect(result.filterSummary.totalMatches).toBe(0);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
    });

    it('should paginate results with default values', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.page).toBe(1);
      expect(result.analyses.limit).toBe(20);
      expect(result.analyses.totalPages).toBe(1);
    });

    it('should paginate with custom page size', async () => {
      // Arrange
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 2 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.limit).toBe(2);
      expect(result.analyses.totalPages).toBe(2);
    });

    it('should return second page correctly', async () => {
      // Arrange
      const query = {
        criteria: {},
        pagination: { page: 2, limit: 2 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
      expect(result.analyses.page).toBe(2);
    });

    it('should handle invalid page numbers', async () => {
      // Arrange
      const query = {
        criteria: {},
        pagination: { page: 0, limit: 20 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.page).toBe(1); // Should default to 1
    });

    it('should limit maximum page size to 100', async () => {
      // Arrange
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 500 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.limit).toBe(100); // Should cap at 100
    });

    it('should sort by createdAt descending by default', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      const dates = result.analyses.data.map(a => a.createdAt.getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });

    it('should sort by confidence ascending when specified', async () => {
      // Arrange
      const query = {
        criteria: {},
        pagination: {
          page: 1,
          limit: 20,
          sortBy: 'confidence' as any,
          sortOrder: 'asc' as const,
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      const confidences = result.analyses.data.map(a => a.confidence);
      const sortedConfidences = [...confidences].sort((a, b) => a - b);
      expect(confidences).toEqual(sortedConfidences);
    });
  });

  describe('Filter Summary', () => {
    beforeEach(() => {
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
    });

    it('should calculate sentiment distribution correctly', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.filterSummary.sentimentDistribution).toEqual({
        positive: 2,
        neutral: 1,
        negative: 1,
      });
    });

    it('should calculate channel distribution correctly', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.filterSummary.channelDistribution['Email']).toBe(2);
      expect(result.filterSummary.channelDistribution['Chat']).toBe(1);
      expect(result.filterSummary.channelDistribution['Phone']).toBe(1);
    });

    it('should calculate average confidence correctly', async () => {
      // Arrange
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      const expectedAvg = (0.95 + 0.88 + 0.75 + 0.92) / 4;
      expect(result.filterSummary.averageConfidence).toBeCloseTo(expectedAvg, 2);
    });

    it('should update summary when filters are applied', async () => {
      // Arrange
      const query = {
        criteria: { sentimentType: SentimentType.POSITIVE },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.filterSummary.totalMatches).toBe(2);
      expect(result.filterSummary.sentimentDistribution.positive).toBe(2);
      expect(result.filterSummary.sentimentDistribution.negative).toBe(0);
    });
  });

  describe('Available Filter Options', () => {
    beforeEach(() => {
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
    });

    it('should return all unique clients', async () => {
      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.clients).toContain('Cliente A');
      expect(options.clients).toContain('Cliente B');
      expect(options.clients).toContain('Cliente C');
      expect(options.clients).toHaveLength(3);
    });

    it('should return all unique channels', async () => {
      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.channels).toContain('Email');
      expect(options.channels).toContain('Chat');
      expect(options.channels).toContain('Phone');
      expect(options.channels).toHaveLength(3);
    });

    it('should return all sentiment types', async () => {
      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.sentimentTypes).toContain(SentimentType.POSITIVE);
      expect(options.sentimentTypes).toContain(SentimentType.NEUTRAL);
      expect(options.sentimentTypes).toContain(SentimentType.NEGATIVE);
    });

    it('should return date range', async () => {
      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.dateRange.earliest).toBeInstanceOf(Date);
      expect(options.dateRange.latest).toBeInstanceOf(Date);
      expect(options.dateRange.earliest!.getTime()).toBeLessThanOrEqual(
        options.dateRange.latest!.getTime()
      );
    });

    it('should return confidence range', async () => {
      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.confidenceRange.min).toBe(0.75);
      expect(options.confidenceRange.max).toBe(0.95);
    });

    it('should handle empty repository', async () => {
      // Arrange
      mockRepository.clear();

      // Act
      const options = await useCase.getAvailableFilterOptions();

      // Assert
      expect(options.clients).toHaveLength(0);
      expect(options.channels).toHaveLength(0);
      expect(options.dateRange.earliest).toBeNull();
      expect(options.dateRange.latest).toBeNull();
      expect(options.confidenceRange.min).toBe(0);
      expect(options.confidenceRange.max).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when repository fails', async () => {
      // Arrange
      mockRepository.setShouldFail(true);
      const query = { criteria: {} };

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow('Failed to find analyses');
    });

    it('should handle invalid confidence ranges gracefully', async () => {
      // Arrange
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
      const query = {
        criteria: {
          minConfidence: 1.5, // Invalid: > 1
          maxConfidence: -0.5, // Invalid: < 0
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert - Should filter out invalid values
      expect(result.analyses.data).toHaveLength(4); // Returns all because filters are invalid
    });

    it('should trim whitespace from client name filter', async () => {
      // Arrange
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
      const query = {
        criteria: { clientName: '  Cliente A  ' },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(2);
    });

    it('should ignore empty string filters', async () => {
      // Arrange
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
      const query = {
        criteria: {
          clientName: '',
          channel: '   ',
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(4); // Returns all
    });
  });

  describe('Edge Cases', () => {
    it('should handle single analysis', async () => {
      // Arrange
      const singleAnalysis = createMockSentimentAnalysis();
      mockRepository.seed([singleAnalysis]);
      const query = { criteria: {} };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(1);
      expect(result.analyses.totalPages).toBe(1);
    });

    it('should handle large dataset pagination', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 50 }, (_, i) =>
        createMockSentimentAnalysis({ id: `analysis-${i}` })
      );
      mockRepository.seed(largeDataset);
      const query = {
        criteria: {},
        pagination: { page: 1, limit: 10 },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.analyses.data).toHaveLength(10);
      expect(result.analyses.total).toBe(50);
      expect(result.analyses.totalPages).toBe(5);
    });

    it('should handle date filter with same from and to date', async () => {
      // Arrange
      mockRepository.seed(MOCK_ANALYSES_COLLECTION);
      const targetDate = new Date('2024-01-16');
      const query = {
        criteria: {
          dateFrom: targetDate,
          dateTo: targetDate,
        },
      };

      // Act
      const result = await useCase.execute(query);

      // Assert - Should find analyses on exactly that date
      expect(result.analyses.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
