import React from 'react'
import {
  PieChart,
  PiggyBank,
  CreditCard,
  TrendingDown,
  Shield,
  BookOpen,
  Send,
} from 'lucide-react'

export function QuickActionsGrid() {
  const actions = [
    {
      id: 'transfer',
      label: 'Transferir',
      icon: Send,
      color: 'bg-banorte-red',
    },
    {
      id: 'presupuestos',
      label: 'Presupuesto',
      icon: PieChart,
      color: 'bg-blue-500',
    },
    {
      id: 'savings',
      label: 'Ahorrar',
      icon: PiggyBank,
      color: 'bg-green-500',
    },
    {
      id: 'cards',
      label: 'Tarjetas',
      icon: CreditCard,
      color: 'bg-purple-500',
    },
    {
      id: 'debt',
      label: 'Pagar Deuda',
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
    {
      id: 'insurance',
      label: 'Seguros',
      icon: Shield,
      color: 'bg-indigo-500',
    },
    {
      id: 'learn',
      label: 'Aprender',
      icon: BookOpen,
      color: 'bg-teal-500',
    },
  ]

  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          className="flex flex-col items-center gap-2 group"
          onClick={() => {
            console.log(`Clicked ${action.id}`)
          }}
        >
          <div
            className={`
            w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md
            transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg
            ${action.color}
          `}
          >
            <action.icon size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-medium text-banorte-gray group-hover:text-banorte-dark">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}

