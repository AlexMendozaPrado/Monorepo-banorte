import React from 'react'
import { User, Sparkles } from 'lucide-react'

interface ChatMessageProps {
  message: string
  sender: 'norma' | 'user'
  timestamp: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

export function ChatMessage({
  message,
  sender,
  timestamp,
  sentiment,
  actions,
}: ChatMessageProps) {
  const isNorma = sender === 'norma'
  return (
    <div
      className={`flex gap-3 mb-6 ${isNorma ? 'justify-start' : 'justify-end'}`}
    >
      {isNorma && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <Sparkles size={16} />
        </div>
      )}

      <div
        className={`max-w-[80%] ${isNorma ? 'items-start' : 'items-end'} flex flex-col`}
      >
        <div
          className={`
            p-4 rounded-2xl shadow-sm relative
            ${isNorma ? 'bg-white text-banorte-dark rounded-tl-none border border-gray-100' : 'bg-gradient-to-br from-banorte-red to-red-600 text-white rounded-tr-none'}
            ${sentiment === 'positive' && isNorma ? 'border-l-4 border-l-green-500' : ''}
            ${sentiment === 'negative' && isNorma ? 'border-l-4 border-l-orange-500' : ''}
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="text-xs font-medium px-3 py-1.5 bg-white border border-gray-200 rounded-full text-banorte-red hover:bg-red-50 transition-colors shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>

      {!isNorma && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
          <User size={16} />
        </div>
      )}
    </div>
  )
}

