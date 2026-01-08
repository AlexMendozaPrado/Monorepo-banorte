'use client'

import React from 'react'
import { FinancialHealthScore } from '../components/widgets/FinancialHealthScore'
import { EmergencyFundWidget } from '../components/widgets/EmergencyFundWidget'
import { QuickActionsGrid } from '../components/widgets/QuickActionsGrid'
import { Card, Button } from '@banorte/ui'
import {
  AlertCircle,
  CreditCard,
  Loader2,
} from 'lucide-react'
import { useFinancialContext } from '../context/FinancialContext'

// Helper para formatear moneda
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)

export function DashboardCompact() {
  const {
    userName,
    monthlyIncome,
    monthlyExpenses,
    availableBudget,
    categories,
    financialHealthScore,
    emergencyFund,
    debts,
    isLoading,
  } = useFinancialContext()

  // Calcular porcentaje usado del presupuesto
  const budgetPercentUsed = monthlyIncome > 0
    ? Math.round((monthlyExpenses / monthlyIncome) * 100)
    : 0

  // Calcular meses cubiertos por fondo de emergencia
  const monthsCovered = monthlyExpenses > 0
    ? +(emergencyFund.current / monthlyExpenses).toFixed(1)
    : 0

  // Obtener próximos pagos urgentes (próximos 7 días)
  const urgentPayments = debts.filter(d => {
    if (!d.dueDate) return false
    const dueDate = new Date(d.dueDate)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= -2 // Include up to 2 days overdue
  })

  // Obtener primer nombre del usuario
  const firstName = userName.split(' ')[0]

  // Determinar saludo según hora
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-banorte-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            {greeting}, {firstName}
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
          <FinancialHealthScore score={financialHealthScore} />
          <div className="h-64">
            <EmergencyFundWidget
              currentAmount={emergencyFund.current}
              targetAmount={emergencyFund.target}
              monthsCovered={monthsCovered}
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
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                budgetPercentUsed <= 80
                  ? 'bg-green-100 text-green-700'
                  : budgetPercentUsed <= 100
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {budgetPercentUsed <= 80 ? 'En orden' : budgetPercentUsed <= 100 ? 'Ajustado' : 'Excedido'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Gastado</p>
                  <p className="text-2xl font-bold text-banorte-dark">
                    {formatCurrency(monthlyExpenses)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="text-lg font-medium text-banorte-gray">
                    {formatCurrency(availableBudget)}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budgetPercentUsed > 100 ? 'bg-red-500' : 'bg-banorte-red'
                  }`}
                  style={{ width: `${Math.min(budgetPercentUsed, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {categories.slice(0, 3).map((cat) => {
                  const catPercent = cat.budgeted.amount > 0
                    ? Math.round((cat.spent.amount / cat.budgeted.amount) * 100)
                    : 0
                  return (
                    <div key={cat.id} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 truncate">{cat.name}</p>
                      <p className={`font-bold text-sm ${
                        catPercent > 90 ? 'text-status-warning' : 'text-banorte-dark'
                      }`}>
                        {catPercent}%
                      </p>
                    </div>
                  )
                })}
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
          {urgentPayments.length > 0 ? (
            <Card className="bg-orange-50 border-orange-100">
              <div className="flex items-center gap-2 mb-3 text-status-alert">
                <AlertCircle size={20} />
                <h3 className="font-bold">Atención Requerida</h3>
              </div>
              <div className="space-y-3">
                {urgentPayments.slice(0, 3).map((debt) => {
                  const dueDate = new Date(debt.dueDate!)
                  const today = new Date()
                  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isOverdue = diffDays < 0

                  return (
                    <div key={debt.id} className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                      <p className="text-xs font-medium text-gray-800 mb-1">
                        {debt.name}
                      </p>
                      <p className={`text-xs mb-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {isOverdue
                          ? `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`
                          : diffDays === 0
                          ? 'Vence hoy'
                          : `Vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-banorte-dark font-medium mb-2">
                        Mínimo: {formatCurrency(debt.minimumPayment)}
                      </p>
                      <button className="text-xs text-banorte-red font-bold hover:underline">
                        Pagar ahora
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>
          ) : (
            <Card className="bg-green-50 border-green-100">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <CreditCard size={20} />
                <h3 className="font-bold">Todo en orden</h3>
              </div>
              <p className="text-sm text-green-600">
                No tienes pagos urgentes pendientes esta semana.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

