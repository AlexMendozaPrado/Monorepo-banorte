'use client'

import React, { useState } from 'react'
import { Send, Mic, Paperclip } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isTyping?: boolean
}

export function ChatInput({ onSend, isTyping }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="bg-white border-t border-gray-100 p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu duda financiera..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-banorte-red/20 focus:border-banorte-red transition-all"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-banorte-red rounded-full hover:bg-red-50 transition-colors"
          >
            <Mic size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-banorte-red text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          <Send size={20} />
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400">
          Norma puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  )
}

