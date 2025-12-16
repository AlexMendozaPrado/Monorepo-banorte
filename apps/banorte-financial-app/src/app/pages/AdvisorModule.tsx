'use client'

import React, { useEffect, useState, useRef } from 'react'
import { ChatMessage } from '../components/chat/ChatMessage'
import { InsightMessage } from '../components/chat/InsightMessage'
import { ComparisonMessage } from '../components/chat/ComparisonMessage'
import { QuickReplyOptions } from '../components/chat/QuickReplyOptions'
import { ChatInput } from '../components/chat/ChatInput'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import { ChatHistoryModal } from '../components/chat/ChatHistoryModal'
import { History, Settings, Sparkles } from 'lucide-react'

export function AdvisorModule() {
  const [messages, setMessages] = useState<any[]>([
    {
      type: 'text',
      message:
        '¡Hola María! 👋 Soy Norma, tu asesora financiera personal. He estado analizando tus finanzas y tengo algunas recomendaciones.',
      sender: 'norma',
      timestamp: '10:30 AM',
      sentiment: 'positive',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'text',
        message: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])

    // Simulate Norma thinking
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Mock response logic
      if (text.toLowerCase().includes('gastos')) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'comparison',
            title: 'Análisis de Gastos Mensuales',
            currentMonth: {
              label: 'Noviembre',
              value: 12450,
            },
            previousMonth: {
              label: 'Octubre',
              value: 14200,
            },
            insight:
              '¡Excelente! Has reducido tus gastos un 12% comparado con el mes anterior. Principalmente en la categoría de Restaurantes.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      } else if (
        text.toLowerCase().includes('ahorro') ||
        text.toLowerCase().includes('ahorrar')
      ) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'insight',
            title: 'Oportunidad de Ahorro Detectada',
            description:
              'He notado que tienes $5,000 en tu cuenta de nómina que no has utilizado en 3 meses.',
            data: [
              {
                label: 'Saldo inactivo',
                value: '$5,000',
              },
              {
                label: 'Rendimiento potencial',
                value: '$450/año',
              },
            ],
            recommendation:
              'Mueve este saldo a tu Pagaré Banorte para generar rendimientos sin riesgo.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'text',
            message:
              'Entiendo. Para darte una mejor respuesta, ¿podrías darme más detalles o elegir una de las opciones sugeridas?',
            sender: 'norma',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      }
    }, 1500)
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
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!isTyping && (
          <QuickReplyOptions
            options={[
              '¿Cómo van mis gastos?',
              'Sugerencias de ahorro',
              'Analizar mis deudas',
              'Revisar presupuesto',
            ]}
            onSelect={handleSend}
          />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} isTyping={isTyping} />
      </div>

      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  )
}

