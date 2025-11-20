export interface AnalysisMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
  processingTimeMs: number;
  languageDetected: string;
}

export class AnalysisMetricsValueObject implements AnalysisMetrics {
  constructor(
    public readonly wordCount: number,
    public readonly sentenceCount: number,
    public readonly paragraphCount: number,
    public readonly averageWordsPerSentence: number,
    public readonly readabilityScore: number,
    public readonly processingTimeMs: number,
    public readonly languageDetected: string
  ) {
    this.validateMetrics();
  }

  private validateMetrics(): void {
    if (this.wordCount < 0) {
      throw new Error('Word count cannot be negative');
    }
    
    if (this.sentenceCount < 0) {
      throw new Error('Sentence count cannot be negative');
    }
    
    if (this.paragraphCount < 0) {
      throw new Error('Paragraph count cannot be negative');
    }
    
    if (this.averageWordsPerSentence < 0) {
      throw new Error('Average words per sentence cannot be negative');
    }
    
    if (this.readabilityScore < 0 || this.readabilityScore > 100) {
      throw new Error('Readability score must be between 0 and 100');
    }
    
    if (this.processingTimeMs < 0) {
      throw new Error('Processing time cannot be negative');
    }
    
    if (!this.languageDetected || this.languageDetected.trim() === '') {
      throw new Error('Language detected cannot be empty');
    }
  }

  public getReadabilityLevel(): string {
    if (this.readabilityScore >= 90) return 'Muy fácil';
    if (this.readabilityScore >= 80) return 'Fácil';
    if (this.readabilityScore >= 70) return 'Bastante fácil';
    if (this.readabilityScore >= 60) return 'Estándar';
    if (this.readabilityScore >= 50) return 'Bastante difícil';
    if (this.readabilityScore >= 30) return 'Difícil';
    return 'Muy difícil';
  }

  public getComplexityLevel(): 'low' | 'medium' | 'high' {
    if (this.averageWordsPerSentence < 15) return 'low';
    if (this.averageWordsPerSentence < 25) return 'medium';
    return 'high';
  }

  public getProcessingTimeFormatted(): string {
    if (this.processingTimeMs < 1000) {
      return `${this.processingTimeMs}ms`;
    } else if (this.processingTimeMs < 60000) {
      return `${(this.processingTimeMs / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(this.processingTimeMs / 60000);
      const seconds = Math.floor((this.processingTimeMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  public isLongDocument(): boolean {
    return this.wordCount > 1000;
  }

  public isComplexDocument(): boolean {
    return this.averageWordsPerSentence > 20 || this.readabilityScore < 50;
  }

  public toJSON(): Record<string, any> {
    return {
      wordCount: this.wordCount,
      sentenceCount: this.sentenceCount,
      paragraphCount: this.paragraphCount,
      averageWordsPerSentence: this.averageWordsPerSentence,
      readabilityScore: this.readabilityScore,
      processingTimeMs: this.processingTimeMs,
      languageDetected: this.languageDetected,
    };
  }

  public static fromText(text: string, processingTimeMs: number, languageDetected: string = 'es'): AnalysisMetricsValueObject {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Simple readability score calculation (Flesch-like)
    const averageSentenceLength = averageWordsPerSentence;
    const averageSyllablesPerWord = 1.5; // Simplified assumption
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord)
    ));

    return new AnalysisMetricsValueObject(
      wordCount,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence,
      readabilityScore,
      processingTimeMs,
      languageDetected
    );
  }
}
