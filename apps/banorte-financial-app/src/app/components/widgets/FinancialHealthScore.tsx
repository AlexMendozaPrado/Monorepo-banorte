import React from 'react'
import { Card } from '../ui/Card'
import { TrendingUp, Info } from 'lucide-react'

interface FinancialHealthScoreProps {
  score: number
  previousScore?: number
}

export function FinancialHealthScore({
  score,
  previousScore = 68,
}: FinancialHealthScoreProps) {
  // Calculate stroke dasharray for circle
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-status-success'
    if (s >= 60) return 'text-status-warning'
    return 'text-status-alert'
  }

  const getScoreStroke = (s: number) => {
    if (s >= 80) return 'stroke-status-success'
    if (s >= 60) return 'stroke-status-warning'
    return 'stroke-status-alert'
  }

  return (
    <Card className="flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 text-gray-400 hover:text-banorte-gray cursor-pointer">
        <Info size={18} />
      </div>

      <h3 className="text-banorte-gray font-medium text-sm mb-4 uppercase tracking-wider">
        Salud Financiera
      </h3>

      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getScoreStroke(score)} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span
            className={`text-4xl font-display font-bold ${getScoreColor(score)}`}
          >
            {score}
          </span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <div className="flex items-center text-status-success bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={14} className="mr-1" />
          <span className="font-bold">+{score - previousScore} pts</span>
        </div>
        <span className="text-gray-500">vs mes anterior</span>
      </div>

      <p className="mt-4 text-center text-sm text-banorte-gray">
        ¡Vas muy bien! Tu salud financiera es{' '}
        <strong className="text-banorte-dark">estable</strong>.
      </p>
    </Card>
  )
}

