'use client';

import React, { useState } from 'react';
import { ProtectionDashboard } from '../components/insurance/ProtectionDashboard';
import { InsuranceCard } from '../components/insurance/InsuranceCard';
import { NeedsEvaluator } from '../components/insurance/NeedsEvaluator';
import { InsuranceComparator } from '../components/insurance/InsuranceComparator';
import { CoverageCalculator } from '../components/insurance/CoverageCalculator';
import { EducationSection } from '../components/insurance/EducationSection';
import { NormaInsuranceRecommendation } from '../components/insurance/NormaInsuranceRecommendation';
import { QuoteModal } from '../components/insurance/QuoteModal';
import { Button } from '../components/ui/Button';
import { Plus, Car, Activity } from 'lucide-react';

export function InsuranceModule() {
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Centro de Seguros
          </h1>
          <p className="text-banorte-gray">Protege lo que más te importa</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEvaluatorOpen(true)}
          >
            Evaluar Necesidades
          </Button>
          <Button size="sm" onClick={() => setIsQuoteOpen(true)}>
            <Plus size={16} className="mr-2" />
            Cotizar Seguro
          </Button>
        </div>
      </div>

      <ProtectionDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Mis Seguros Actuales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsuranceCard
                type="Seguro de Auto"
                insurer="Banorte Seguros"
                policyNumber="AUT-2024-8592"
                premium={12500}
                sumInsured="Valor Comercial"
                expiryDate="15 Nov 2024"
                status="expiring"
                icon={<Car size={20} />}
              />
              <InsuranceCard
                type="Gastos Médicos"
                insurer="AXA Salud"
                policyNumber="GMM-9921-002"
                premium={24000}
                sumInsured="$5,000,000 MXN"
                expiryDate="20 Ene 2025"
                status="active"
                icon={<Activity size={20} />}
              />
            </div>
          </div>

          <InsuranceComparator />
          <CoverageCalculator />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <NormaInsuranceRecommendation />
          <EducationSection />
        </div>
      </div>

      <NeedsEvaluator
        isOpen={isEvaluatorOpen}
        onClose={() => setIsEvaluatorOpen(false)}
      />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}

