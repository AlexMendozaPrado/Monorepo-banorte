'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DebtDashboard } from '../components/debt/DebtDashboard';
import { DebtCard } from '../components/debt/DebtCard';
import { PaymentStrategy } from '../components/debt/PaymentStrategy';
import { DebtDetailModal } from '../components/debt/DebtDetailModal';
import { PaymentSimulator } from '../components/debt/PaymentSimulator';
import { NormaRecommendations } from '../components/debt/NormaRecommendations';
import { CreditHealthScore } from '../components/debt/CreditHealthScore';
import { PaymentAlerts } from '../components/debt/PaymentAlerts';
import { AddDebtModal } from '../components/debt/AddDebtModal';

export default function DebtModule() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-banorte-dark font-display">Mis Deudas</h1>
            <p className="text-banorte-gray">Gestiona y optimiza tus pagos</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-banorte-red text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            <Plus size={20} />
            Agregar Deuda
          </button>
        </div>

        {/* Dashboard Summary */}
        <DebtDashboard />

        {/* Strategy Section */}
        <PaymentStrategy />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Debt Cards - Main Column */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-lg font-bold text-banorte-dark">Tus Deudas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DebtCard
                type="credit"
                creditor="Banorte Oro"
                amount={12450}
                rate={42}
                minPayment={450}
                recPayment={800}
                dueDate="22 Nov"
                progress={38}
                priority="high"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="store"
                creditor="Liverpool"
                amount={9550}
                rate={35}
                minPayment={350}
                recPayment={500}
                dueDate="28 Nov"
                progress={36}
                priority="medium"
                onViewDetails={() => setIsDetailOpen(true)}
              />
              <DebtCard
                type="personal"
                creditor="BBVA Personal"
                amount={18000}
                rate={28}
                minPayment={850}
                recPayment={1200}
                dueDate="17 Nov"
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

            <PaymentSimulator />
          </div>

          {/* Sidebar - Recommendations & Alerts */}
          <div className="lg:col-span-4 space-y-6">
            <NormaRecommendations />
            <PaymentAlerts />
            <CreditHealthScore />
          </div>
        </div>

        <DebtDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
        <AddDebtModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      </div>
    </div>
  );
}

