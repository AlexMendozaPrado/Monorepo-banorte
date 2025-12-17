'use client';

import React, { useState } from 'react';
import { DebtDashboard } from '../components/debt/DebtDashboard';
import { DebtCard } from '../components/debt/DebtCard';
import { PaymentStrategy } from '../components/debt/PaymentStrategy';
import { PaymentSimulator } from '../components/debt/PaymentSimulator';
import { NormaRecommendations } from '../components/debt/NormaRecommendations';
import { CreditHealthScore } from '../components/debt/CreditHealthScore';
import { PaymentAlerts } from '../components/debt/PaymentAlerts';
import { DebtDetailModal } from '../components/debt/DebtDetailModal';
import { AddDebtModal } from '../components/debt/AddDebtModal';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

export function DebtModule() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const userId = 'user-demo';
  const availableMonthly = 3000;

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
          <PaymentStrategy userId={userId} availableMonthly={availableMonthly} />

          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Tus Deudas Priorizadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DebtCard
                type="credit"
                creditor="Banorte Oro"
                amount={12450}
                rate={42}
                minPayment={450}
                recPayment={1200}
                dueDate="15 Nov"
                progress={35}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="store"
                creditor="Liverpool"
                amount={9550}
                rate={35}
                minPayment={350}
                recPayment={800}
                dueDate="25 Nov"
                progress={20}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="personal"
                creditor="BBVA Personal"
                amount={18000}
                rate={28}
                minPayment={850}
                recPayment={1500}
                dueDate="10 Nov"
                progress={40}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="auto"
                creditor="Santander Auto"
                amount={45000}
                rate={12}
                minPayment={1800}
                recPayment={2000}
                dueDate="20 Nov"
                progress={60}
                priority="medium"
                onViewDetails={() => setIsDetailOpen(true)}
              />
            </div>
          </div>

          <PaymentSimulator />
        </div>

        {/* Sidebar - Recommendations & Alerts */}
        <div className="lg:col-span-4 space-y-6">
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

