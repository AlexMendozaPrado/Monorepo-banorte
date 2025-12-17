import React from 'react'
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

interface InsightMessageProps {
  title: string
  description: string
  data?: {
    label: string
    value: string
    trend?: 'up' | 'down'
  }[]
  recommendation: string
  timestamp: string
}

export function InsightMessage({
  title,
  description,
  data,
  recommendation,
  timestamp,
}: InsightMessageProps) {
  return (
    <div className="flex gap-3 mb-6 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>

      <div className="max-w-[85%] flex flex-col">
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Análisis Detectado
            </span>
          </div>

          <div className="p-4">
            <h4 className="font-bold text-banorte-dark mb-2">{title}</h4>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            {data && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {data.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-bold text-banorte-dark">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
              <p className="text-xs font-bold text-green-800 mb-1">
                Recomendación:
              </p>
              <p className="text-sm text-green-700">{recommendation}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-banorte-red text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Aplicar Recomendación
              </button>
              <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  )
}

