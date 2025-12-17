'use client'

import React, { useEffect, useState, useRef } from 'react'
import { ChatMessage } from '../components/chat/ChatMessage'
import { InsightMessage } from '../components/chat/InsightMessage'
import { ComparisonMessage } from '../components/chat/ComparisonMessage'
import { QuickReplyOptions } from '../components/chat/QuickReplyOptions'
import { ChatInput } from '../components/chat/ChatInput'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import { ChatHistoryModal } from '../components/chat/ChatHistoryModal'
import { History, Settings, Sparkles, AlertCircle } from 'lucide-react'
import { useAdvisor } from '../hooks/useAdvisor'

export function AdvisorModule() {
  const userId = 'user-demo'
  const { messages: apiMessages, loading, error, suggestedQuestions, sendMessage } = useAdvisor(userId)

  const [localMessages, setLocalMessages] = useState<any[]>([
    {
      type: 'text',
      message:
        '¡Hola! 👋 Soy Norma, tu asesora financiera personal. He estado analizando tus finanzas y tengo algunas recomendaciones. ¿En qué puedo ayudarte hoy?',
      sender: 'norma',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sentiment: 'positive',
    },
  ])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Merge API messages with local messages
  const messages = apiMessages.length > 0 ? apiMessages : localMessages

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (text: string) => {
    try {
      // Add user message to local state immediately
      const userMessage = {
        type: 'text',
        message: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setLocalMessages((prev) => [...prev, userMessage])

      // Send message to OpenAI via API with financial context
      const context = {
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

      await sendMessage(text, context)
    } catch (err) {
      console.error('Error sending message:', err)
      // Add error message to local state
      setLocalMessages((prev) => [
        ...prev,
        {
          type: 'text',
          message: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
          sender: 'norma',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sentiment: 'neutral',
        },
      ])
    }
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
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </h1>
              <p className="text-xs text-gray-500">
                Tu Asesora Financiera Personal
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors"
            >
              <History size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-banorte-gray hover:bg-gray-50 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {messages.map((msg, idx) => {
            if (msg.type === 'insight') {
              return <InsightMessage key={idx} {...msg} />
            }
            if (msg.type === 'comparison') {
              return <ComparisonMessage key={idx} {...msg} />
            }
            return <ChatMessage key={idx} {...msg} />
          })}
          {loading && <TypingIndicator />}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm">Error: {error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!loading && (
          <QuickReplyOptions
            options={
              suggestedQuestions.length > 0
                ? suggestedQuestions
                : [
                    '¿Cómo van mis gastos?',
                    'Sugerencias de ahorro',
                    'Analizar mis deudas',
                    'Revisar presupuesto',
                  ]
            }
            onSelect={handleSend}
          />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} isTyping={loading} />
      </div>

      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  )
}

