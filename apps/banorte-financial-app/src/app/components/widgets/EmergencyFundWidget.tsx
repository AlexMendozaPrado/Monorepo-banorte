import React from 'react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import { ShieldCheck, Plus } from 'lucide-react'

interface EmergencyFundWidgetProps {
  currentAmount: number
  targetAmount: number
  monthsCovered: number
}

export function EmergencyFundWidget({
  currentAmount,
  targetAmount,
  monthsCovered,
}: EmergencyFundWidgetProps) {
  const percentage = Math.round((currentAmount / targetAmount) * 100)

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-banorte-dark">
              Fondo de Emergencia
            </h3>
            <p className="text-xs text-banorte-gray">Tu red de seguridad</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-gray-100 text-banorte-gray px-2 py-1 rounded">
          {monthsCovered} meses
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-banorte-dark">
            ${currentAmount.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 mb-1">
            meta: ${targetAmount.toLocaleString()}
          </span>
        </div>

        <ProgressBar
          value={currentAmount}
          max={targetAmount}
          color={percentage >= 100 ? 'success' : 'primary'}
          height="lg"
        />

        <p className="mt-3 text-sm text-banorte-gray">
          Has completado el{' '}
          <strong className="text-banorte-dark">{percentage}%</strong> de tu
          meta recomendada.
        </p>
      </div>

      <div className="mt-6">
        <Button variant="outline" size="sm" fullWidth className="text-xs">
          <Plus size={14} className="mr-1" />
          Aportar al fondo
        </Button>
      </div>
    </Card>
  )
}

