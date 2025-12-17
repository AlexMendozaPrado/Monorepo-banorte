import React from 'react'
import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react'

interface ComparisonMessageProps {
  title: string
  currentMonth: {
    label: string
    value: number
  }
  previousMonth: {
    label: string
    value: number
  }
  insight: string
  timestamp: string
}

export function ComparisonMessage({
  title,
  currentMonth,
  previousMonth,
  insight,
  timestamp,
}: ComparisonMessageProps) {
  const difference = currentMonth.value - previousMonth.value
  const percentChange = Math.round((difference / previousMonth.value) * 100)
  const isImprovement = difference < 0 // Assuming lower spending is better

  return (
    <div className="flex gap-3 mb-6 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banorte-red to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
        <Sparkles size={16} />
      </div>

      <div className="max-w-[85%] flex flex-col">
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100 shadow-sm overflow-hidden p-4">
          <h4 className="font-bold text-banorte-dark mb-4">{title}</h4>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">
                {previousMonth.label}
              </p>
              <p className="font-medium text-gray-400">
                ${previousMonth.value.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isImprovement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {isImprovement ? (
                  <ArrowDown size={12} />
                ) : (
                  <ArrowUp size={12} />
                )}
                {Math.abs(percentChange)}%
              </div>
              <div className="w-16 h-0.5 bg-gray-100 mt-2" />
            </div>

            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">{currentMonth.label}</p>
              <p className="font-bold text-banorte-dark">
                ${currentMonth.value.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-sm text-banorte-gray italic border-l-2 border-banorte-red pl-3">
            "{insight}"
          </p>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  )
}

