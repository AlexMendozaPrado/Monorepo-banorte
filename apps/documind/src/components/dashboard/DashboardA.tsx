import React from 'react';
import { SentimentAnalysisResult } from '@/core/domain/documents/SentimentAnalysis';

interface DashboardAProps {
  analysisData: SentimentAnalysisResult;
}

export const DashboardA: React.FC<DashboardAProps> = ({ analysisData }) => {
  const {
    sentimentScore,
    confidenceLevel,
    emotions,
    timeline,
    keywords,
    alerts,
    documentInfo,
    textMetrics,
  } = analysisData;

  const getSentimentLabel = (score: number) => {
    if (score <= 1) return 'Muy Negativo';
    if (score <= 2) return 'Negativo';
    if (score <= 3) return 'Ligeramente Negativo';
    if (score <= 4) return 'Neutral';
    if (score <= 5) return 'Ligeramente Positivo';
    if (score <= 6) return 'Positivo';
    return 'Muy Positivo';
  };

  return (
    <div className="space-y-8">
      {/* Document Info */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Información del Documento
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-600">Cliente</div>
            <div className="text-gray-800 font-bold">{documentInfo.client}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Fecha</div>
            <div className="text-gray-800 font-bold">{documentInfo.date}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Canal</div>
            <div className="text-gray-800 font-bold">{documentInfo.channel}</div>
          </div>
          {documentInfo.participants.length > 0 && (
            <div>
              <div className="text-xs text-gray-600">Participantes</div>
              <div className="text-gray-800 font-bold">
                {documentInfo.participants.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Score */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Sentimiento General
        </h3>
        <div className="flex justify-between mb-4">
          <span className="text-xs text-gray-600">Muy Negativo</span>
          <span className="text-xs text-gray-600">Neutral</span>
          <span className="text-xs text-gray-600">Muy Positivo</span>
        </div>
        <div className="relative h-2 mb-8">
          <div className="absolute inset-0 bg-gray-200"></div>
          <div
            className="absolute h-2 bg-red-600"
            style={{
              width: `${((sentimentScore - 1) / 6) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <span
              key={value}
              className={`text-sm ${
                value === sentimentScore
                  ? 'font-bold text-red-600'
                  : 'font-normal text-gray-600'
              }`}
            >
              {value}
            </span>
          ))}
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-800">
            {getSentimentLabel(sentimentScore)}
          </span>
        </div>
      </div>

      {/* Confidence Level */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Nivel de Confianza
        </h3>
        <div className="flex flex-col items-center py-8">
          <span className="text-6xl font-bold text-red-600 mb-4">
            {confidenceLevel}%
          </span>
          <span className="text-lg font-normal text-gray-600">
            Confianza {confidenceLevel >= 85 ? 'Alta' : confidenceLevel >= 70 ? 'Media' : 'Baja'}
          </span>
        </div>
      </div>

      {/* Emotions Distribution */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Distribución de Emociones
        </h3>
        <div className="space-y-6">
          {emotions.map((emotion) => (
            <div key={emotion.emotion}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-normal text-gray-800">
                  {emotion.emotion}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {emotion.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200">
                <div
                  className="h-2 bg-red-600"
                  style={{
                    width: `${emotion.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Palabras Clave y Triggers
        </h3>
        <div className="space-y-6">
          {keywords.slice(0, 10).map((item) => {
            const maxFrequency = Math.max(...keywords.map((k) => k.frequency));
            return (
              <div key={item.word}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-normal text-gray-800">
                    {item.word}
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {item.frequency}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200">
                  <div
                    className="h-2 bg-red-600"
                    style={{
                      width: `${(item.frequency / maxFrequency) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Alertas y Recomendaciones
        </h3>
        <ol className="space-y-8">
          {alerts.map((alert, index) => (
            <li key={alert.id} className="flex">
              <span
                className={`mr-4 font-bold ${
                  alert.priority === 'Alta' ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {index + 1}.
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-normal text-gray-600">
                    Prioridad {alert.priority}
                  </span>
                  <span className="text-xs text-gray-600 font-normal">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-gray-800 font-bold mb-3">{alert.message}</p>
                <div className="text-xs text-gray-600 font-normal p-4 border-l-2 border-gray-200">
                  {alert.context}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Text Metrics */}
      <div className="p-8 border-b-2 border-gray-200">
        <h3 className="text-gray-800 font-bold text-lg mb-8">
          Métricas del Texto
        </h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6">
            <div className="text-sm text-gray-600 font-normal">Palabras</div>
            <div className="text-xl font-bold text-gray-800">
              {textMetrics.words}
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-600 font-normal">Oraciones</div>
            <div className="text-xl font-bold text-gray-800">
              {textMetrics.sentences}
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-600 font-normal">
              Palabras/Oración
            </div>
            <div className="text-xl font-bold text-gray-800">
              {textMetrics.avgWordsPerSentence}
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-600 font-normal">
              Tiempo de Lectura
            </div>
            <div className="text-xl font-bold text-gray-800">
              {textMetrics.readingTime}
            </div>
          </div>
        </div>
        <div className="mt-8 p-6">
          <div className="text-sm text-gray-600 font-normal mb-2">
            Tipo de Vocabulario
          </div>
          <div className="text-sm font-bold text-gray-800">
            {textMetrics.vocabularyType}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="p-8 border-b-2 border-gray-200">
          <h3 className="text-gray-800 font-bold text-lg mb-8">
            Timeline Emocional
          </h3>
          <div className="space-y-4">
            {timeline.map((point, index) => (
              <div key={index} className="border-l-4 border-red-600 pl-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-800">
                    {point.time}
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    Sentimiento: {point.sentiment}/7
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-normal">
                  {point.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
