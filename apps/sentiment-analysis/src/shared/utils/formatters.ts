import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { EmotionScore } from '../../core/domain/value-objects/EmotionScore';

export const formatSentiment = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return 'Positivo';
    case SentimentType.NEUTRAL:
      return 'Neutral';
    case SentimentType.NEGATIVE:
      return 'Negativo';
    default:
      return 'Desconocido';
  }
};

export const getSentimentColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return '#4caf50'; // Green
    case SentimentType.NEUTRAL:
      return '#ff9800'; // Orange
    case SentimentType.NEGATIVE:
      return '#f44336'; // Red
    default:
      return '#9e9e9e'; // Gray
  }
};

export const getSentimentIcon = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return '😊';
    case SentimentType.NEUTRAL:
      return '😐';
    case SentimentType.NEGATIVE:
      return '😞';
    default:
      return '❓';
  }
};

export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(1)}%`;
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return '#4caf50'; // Green - High confidence
  if (confidence >= 0.6) return '#ff9800'; // Orange - Medium confidence
  return '#f44336'; // Red - Low confidence
};

export const formatEmotion = (emotion: keyof EmotionScore): string => {
  const emotionMap: Record<keyof EmotionScore, string> = {
    joy: 'Alegría',
    sadness: 'Tristeza',
    anger: 'Enojo',
    fear: 'Miedo',
    surprise: 'Sorpresa',
    disgust: 'Disgusto',
  };
  return emotionMap[emotion] || emotion;
};

export const getEmotionColor = (emotion: keyof EmotionScore): string => {
  const colorMap: Record<keyof EmotionScore, string> = {
    joy: '#ffeb3b',      // Yellow
    sadness: '#2196f3',   // Blue
    anger: '#f44336',     // Red
    fear: '#9c27b0',      // Purple
    surprise: '#ff9800',  // Orange
    disgust: '#4caf50',   // Green
  };
  return colorMap[emotion] || '#9e9e9e';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const formatProcessingTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getReadabilityLevel = (score: number): string => {
  if (score >= 90) return 'Muy fácil';
  if (score >= 80) return 'Fácil';
  if (score >= 70) return 'Bastante fácil';
  if (score >= 60) return 'Estándar';
  if (score >= 50) return 'Bastante difícil';
  if (score >= 30) return 'Difícil';
  return 'Muy difícil';
};

export const getReadabilityColor = (score: number): string => {
  if (score >= 70) return '#4caf50'; // Green - Easy to read
  if (score >= 50) return '#ff9800'; // Orange - Medium difficulty
  return '#f44336'; // Red - Difficult to read
};
