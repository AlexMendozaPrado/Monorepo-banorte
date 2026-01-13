'use client';

import React, { useState } from 'react';
import { useFinancialContext } from '../context/FinancialContext';
import { useModuleInsights } from '../hooks/useModuleInsights';
import { DebtDashboard } from '../components/debt/DebtDashboard';
import { DebtCard } from '../components/debt/DebtCard';
import { PaymentStrategy } from '../components/debt/PaymentStrategy';
import { PaymentSimulator } from '../components/debt/PaymentSimulator';
import { NormaRecommendations } from '../components/debt/NormaRecommendations';
import { CreditHealthScore } from '../components/debt/CreditHealthScore';
import { PaymentAlerts } from '../components/debt/PaymentAlerts';
import { DebtDetailModal } from '../components/debt/DebtDetailModal';
import { AddDebtModal } from '../components/debt/AddDebtModal';
import { ModuleInsightsSection } from '../components/insights';
import { Button } from '@banorte/ui';
import { Plus, Loader2 } from 'lucide-react';

// Helper to map debt type to card type (DebtCard only supports 4 types)
const debtTypeToCardType = (type: string): 'credit' | 'personal' | 'auto' | 'store' => {
  const mapping: Record<string, 'credit' | 'personal' | 'auto' | 'store'> = {
    'CREDIT_CARD': 'credit',
    'PERSONAL_LOAN': 'personal',
    'AUTO_LOAN': 'auto',
    'STORE_CREDIT': 'store',
    'MORTGAGE': 'personal', // Map to personal since mortgage not supported
    'STUDENT_LOAN': 'personal', // Map to personal since student not supported
    'OTHER': 'personal',
  };
  return mapping[type] || 'personal';
};

// Helper to determine priority based on interest rate and amount
const calculatePriority = (rate: number, balance: number): 'high' | 'medium' | 'low' => {
  if (rate > 30 || balance > 50000) return 'high';
  if (rate > 15 || balance > 20000) return 'medium';
  return 'low';
};

export function DebtModule() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Usar contexto financiero global
  const {
    userId,
    debts,
    debtsLoading,
    totalDebt,
    availableForDebt,
    averageInterestRate,
  } = useFinancialContext();

  // Insights proactivos de IA para deudas
  const {
    insights: debtInsights,
    loading: insightsLoading,
    error: insightsError,
    refetch: refetchInsights,
    dismissInsight,
  } = useModuleInsights({
    userId,
    domain: 'DEBT',
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutos
    enabled: true,
  });

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Gestión de Deudas
          </h1>
          <p className="text-banorte-gray">
            Toma el control y libérate de deudas más rápido
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} className="mr-2" />
          Registrar Deuda
        </Button>
      </div>

      <DebtDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Strategy & List */}
        <div className="lg:col-span-8 space-y-8">
          <PaymentStrategy userId={userId} availableMonthly={availableForDebt} />

          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Tus Deudas Priorizadas
            </h2>
            {debtsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-banorte-red animate-spin" />
              </div>
            ) : debts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-banorte-gray">No tienes deudas registradas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debts.map((debt) => {
                  const dueDate = debt.dueDate
                    ? new Date(debt.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                    : 'Sin fecha';
                  // Calculate recommended payment (minimum + 30% or available amount)
                  const recPayment = Math.round(debt.minimumPayment * 1.3);

                  return (
                    <DebtCard
                      key={debt.id}
                      type={debtTypeToCardType(debt.type)}
                      creditor={debt.name}
                      amount={debt.balance}
                      rate={debt.interestRate}
                      minPayment={debt.minimumPayment}
                      recPayment={recPayment}
                      dueDate={dueDate}
                      progress={30} // Would need original amount to calculate
                      priority={calculatePriority(debt.interestRate, debt.balance)}
                      onViewDetails={() => setIsDetailOpen(true)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <PaymentSimulator />
        </div>

        {/* Sidebar - Recommendations & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Insights Proactivos de Norma */}
          <ModuleInsightsSection
            domain="DEBT"
            insights={debtInsights}
            loading={insightsLoading}
            error={insightsError}
            title="Alertas y Oportunidades"
            subtitle="Estrategias para liberarte de deudas más rápido"
            maxVisible={3}
            variant="compact"
            onDismiss={dismissInsight}
            onRefresh={refetchInsights}
            onInsightAction={(insightId, action) => {
              console.log('Debt insight action:', insightId, action);
              // TODO: Implement action handling
            }}
          />

          <NormaRecommendations userId={userId} />
          <PaymentAlerts />
          <CreditHealthScore />
        </div>
      </div>

      <DebtDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      <AddDebtModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}

