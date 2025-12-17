import React from 'react'
import { Modal } from '../ui/Modal'
import { Search } from 'lucide-react'

interface ChatHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatHistoryModal({ isOpen, onClose }: ChatHistoryModalProps) {
  const history = [
    {
      id: 1,
      title: 'Análisis de gastos hormiga',
      date: 'Hoy',
      preview: 'Detecté $1,200 en gastos...',
    },
    {
      id: 2,
      title: 'Plan de ahorro para viaje',
      date: 'Ayer',
      preview: 'Para ahorrar $20,000 necesitas...',
    },
    {
      id: 3,
      title: 'Duda sobre tarjeta Oro',
      date: '10 Nov',
      preview: 'La tasa de interés es del...',
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Conversaciones"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar en conversaciones..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-banorte-red"
          />
        </div>

        <div className="space-y-2">
          {history.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-banorte-dark group-hover:text-banorte-red transition-colors">
                  {chat.title}
                </h4>
                <span className="text-[10px] text-gray-400">{chat.date}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {chat.preview}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

