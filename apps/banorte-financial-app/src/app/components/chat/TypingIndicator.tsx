import React from 'react'
import { Sparkles } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6 justify-start animate-in fade-in slide-in-from-bottom-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>
      <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '0ms',
          }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '150ms',
          }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: '300ms',
          }}
        />
      </div>
    </div>
  )
}

