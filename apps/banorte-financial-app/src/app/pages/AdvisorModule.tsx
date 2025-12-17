'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { ChatMessage } from '../components/chat/ChatMessage'
import { QuickReplyOptions } from '../components/chat/QuickReplyOptions'
import { ChatInput } from '../components/chat/ChatInput'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import { ChatHistoryModal } from '../components/chat/ChatHistoryModal'
import { History, RotateCcw, Sparkles, AlertCircle } from 'lucide-react'
import { useAdvisorChat, FinancialContext } from '../hooks/useAdvisorChat'

/**
 * Contexto financiero del usuario (en producción vendría de una API/store)
 */
const FINANCIAL_CONTEXT: FinancialContext = {
  currentBudget: {
    totalIncome: 30000,
    spent: 12450,
    budget: 20000,
    categories: [
      { name: 'Alimentos', spent: 3200, budget: 6000 },
      { name: 'Transporte', spent: 1800, budget: 2500 },
      { name: 'Ocio', spent: 800, budget: 1500 },
      { name: 'Hogar', spent: 5500, budget: 8500 },
      { name: 'Servicios', spent: 1150, budget: 2000 },
    ],
  },
  debts: [
    { creditor: 'Banorte Oro', amount: 12450, rate: 42, type: 'credit' },
    { creditor: 'Liverpool', amount: 9550, rate: 35, type: 'store' },
    { creditor: 'BBVA Personal', amount: 18000, rate: 28, type: 'personal' },
    { creditor: 'Santander Auto', amount: 45000, rate: 12, type: 'auto' },
  ],
  savingsGoals: [
    { name: 'Fondo de Emergencia', current: 15000, target: 90000, priority: 'high' },
    { name: 'Vacaciones', current: 5000, target: 25000, priority: 'medium' },
  ],
}

/**
 * Preguntas sugeridas por defecto
 */
const DEFAULT_SUGGESTED_QUESTIONS = [
  '¿Cómo van mis gastos?',
  'Sugerencias de ahorro',
  'Analizar mis deudas',
  'Revisar presupuesto',
]

/**
 * Mensaje de bienvenida inicial
 */
const WELCOME_MESSAGE = {
  type: 'text' as const,
  message: '¡Hola! 👋 Soy Norma, tu asesora financiera personal de Banorte. He estado analizando tus finanzas y tengo algunas recomendaciones para ti. ¿En qué puedo ayudarte hoy?',
  sender: 'norma' as const,
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  sentiment: 'positive' as const,
}

export function AdvisorModule() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hook de chat con streaming usando Vercel AI SDK v5
  const {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
    status,
    error,
    clearConversation,
  } = useAdvisorChat({
    userId: 'user-demo',
    context: FINANCIAL_CONTEXT,
  })

  // Convertir mensajes del formato AI SDK v5 al formato de componentes
  // AI SDK v5 usa 'parts' en lugar de 'content'
  const formattedMessages = useMemo(() => {
    // Si no hay mensajes de la API, mostrar mensaje de bienvenida
    if (messages.length === 0) {
      return [WELCOME_MESSAGE]
    }

    return messages.map((msg) => {
      // Extraer texto de las partes del mensaje (AI SDK v5 pattern)
      const parts = msg.parts || []
      const textContent = parts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('')

      return {
        type: 'text' as const,
        message: textContent,
        sender: (msg.role === 'assistant' ? 'norma' : 'user') as 'norma' | 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sentiment: 'neutral' as const,
      }
    })
  }, [messages])

  // Auto-scroll al fondo cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Manejar envío de mensaje
  const handleSend = async (text: string) => {
    if (!text.trim()) return
    await sendMessage(text.trim())
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-xl my-4 rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-banorte-dark flex items-center gap-2">
                Norma
                <span
                  className={`w-2 h-2 rounded-full ${
                    isStreaming
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-green-500 animate-pulse'
                  }`}
                />
              </h1>
              <p className="text-xs text-gray-500">
                {isStreaming
                  ? 'Escribiendo...'
                  : status === 'submitted'
                  ? 'Pensando...'
                  : 'Tu Asesora Financiera Personal'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
              title="Ver historial"
            >
              <History size={20} />
            </button>
            <button
              onClick={clearConversation}
              className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
              title="Nueva conversación"
              disabled={isLoading}
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {formattedMessages.map((msg, idx) => (
            <ChatMessage key={idx} {...msg} />
          ))}

          {/* Indicador de typing cuando está procesando */}
          {isLoading && !isStreaming && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm">Error: {error.message}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies - solo mostrar cuando no está cargando */}
        {!isLoading && (
          <QuickReplyOptions
            options={DEFAULT_SUGGESTED_QUESTIONS}
            onSelect={handleSend}
          />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} isTyping={isLoading} />
      </div>

      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  )
}
