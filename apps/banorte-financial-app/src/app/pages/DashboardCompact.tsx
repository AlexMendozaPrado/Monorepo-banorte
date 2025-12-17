'use client'

import React from 'react'
import { FinancialHealthScore } from '../components/widgets/FinancialHealthScore'
import { EmergencyFundWidget } from '../components/widgets/EmergencyFundWidget'
import { QuickActionsGrid } from '../components/widgets/QuickActionsGrid'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  AlertCircle,
  CreditCard,
} from 'lucide-react'

export function DashboardCompact() {
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Buenos días, María
          </h1>
          <p className="text-banorte-gray">
            Aquí está tu resumen financiero de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Ver Reporte Mensual
          </Button>
          <Button size="sm">Nueva Transacción</Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-card shadow-sm border border-gray-100">
        <QuickActionsGrid />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Health & Emergency */}
        <div className="md:col-span-4 space-y-6">
          <FinancialHealthScore score={72} />
          <div className="h-64">
            <EmergencyFundWidget
              currentAmount={45000}
              targetAmount={60000}
              monthsCovered={4.5}
            />
          </div>
        </div>

        {/* Middle Column - Activity & Budget */}
        <div className="md:col-span-5 space-y-6">
          {/* Budget Summary Card */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-banorte-dark">
                Presupuesto Mensual
              </h3>
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                En orden
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Gastado</p>
                  <p className="text-2xl font-bold text-banorte-dark">
                    $18,500
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="text-lg font-medium text-banorte-gray">
                    $6,500
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-banorte-red h-3 rounded-full w-[74%]" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Alimentos</p>
                  <p className="font-bold text-sm text-banorte-dark">65%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Transporte</p>
                  <p className="font-bold text-sm text-banorte-dark">42%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Ocio</p>
                  <p className="font-bold text-sm text-status-warning">85%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card noPadding>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-banorte-dark">
                Movimientos Recientes
              </h3>
              <button className="text-xs text-banorte-red font-medium hover:underline">
                Ver todos
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { name: 'Uber Eats', date: 'Hoy, 2:30 PM', amount: -245.0, icon: '🍔' },
                { name: 'Netflix', date: 'Ayer', amount: -199.0, icon: '🎬' },
                { name: 'Depósito Nómina', date: '15 Oct', amount: 12500.0, icon: '💰', positive: true },
                { name: 'Starbucks', date: '14 Oct', amount: -85.0, icon: '☕' },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-banorte-dark">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.positive ? 'text-status-success' : 'text-banorte-dark'}`}>
                    {tx.positive ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Alerts & Cards */}
        <div className="md:col-span-3 space-y-6">
          {/* Alerts */}
          <Card className="bg-orange-50 border-orange-100">
            <div className="flex items-center gap-2 mb-3 text-status-alert">
              <AlertCircle size={20} />
              <h3 className="font-bold">Atención Requerida</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                <p className="text-xs font-medium text-gray-800 mb-1">Pago de Tarjeta Oro</p>
                <p className="text-xs text-gray-500 mb-2">Vence en 2 días</p>
                <button className="text-xs text-banorte-red font-bold">Pagar ahora</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

