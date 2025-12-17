'use client';

import React, { useState } from 'react';
import { useSavings } from '../hooks/useSavings';
import { useSavingsRules } from '../hooks/useSavingsRules';
import { EmergencyFundHero } from '../components/savings/EmergencyFundHero';
import { SavingsGoalCard } from '../components/savings/SavingsGoalCard';
import { SavingRuleCard } from '../components/savings/SavingRuleCard';
import { SavingRuleWizard } from '../components/savings/SavingRuleWizard';
import { GoalModal } from '../components/savings/GoalModal';
import { SavingsHistory } from '../components/savings/SavingsHistory';
import { CelebrationModal } from '../components/savings/CelebrationModal';
import { SavingsOptimizationCard } from '../components/savings/SavingsOptimizationCard';
import { SmartRuleSuggestions } from '../components/savings/SmartRuleSuggestions';
import { Button } from '../components/ui/Button';
import { Plus, Plane, Car, Home } from 'lucide-react';

export function SavingsModule() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const userId = 'user-demo';
  const { goals, loading, error, createGoal } = useSavings(userId);
  const { rules } = useSavingsRules(userId);

  // Mock toggle handler
  const handleToggle = () => {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-banorte-red mx-auto mb-4"></div>
          <p className="text-banorte-gray">Cargando metas de ahorro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Ahorros Automáticos
          </h1>
          <p className="text-banorte-gray">
            Construye tu futuro financiero sin esfuerzo
          </p>
        </div>
        <Button
          onClick={() => setIsCelebrationOpen(true)}
          variant="outline"
          size="sm"
        >
          Simular Logro 🎉
        </Button>
      </div>

      {/* Hero Section */}
      <EmergencyFundHero saved={45000} target={60000} monthlyContribution={3200} />

      {/* AI Optimization Section */}
      {goals.length > 0 && (
        <SavingsOptimizationCard
          userId={userId}
          monthlyIncome={30000}
          monthlyExpenses={18000}
        />
      )}

      {/* Savings Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-banorte-dark">Mis Metas</h2>
          <Button onClick={() => setIsGoalModalOpen(true)} size="sm">
            <Plus size={18} className="mr-2" />
            Nueva Meta
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-card shadow-card">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🎯
            </div>
            <h2 className="text-xl font-bold text-banorte-dark mb-2">
              No tienes metas de ahorro
            </h2>
            <p className="text-banorte-gray mb-6">
              Crea tu primera meta para comenzar a ahorrar
            </p>
            <Button onClick={() => setIsGoalModalOpen(true)}>Crear Meta</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                name={goal.name}
                target={goal.targetAmount.amount}
                saved={goal.currentAmount.amount}
                targetDate={goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Sin fecha'}
                icon={<span className="text-5xl">{goal.icon}</span>}
              />
            ))}
          </div>
        )}
      </div>

      {/* Smart Rule Suggestions */}
      {goals.length > 0 && (
        <SmartRuleSuggestions
          userId={userId}
          monthlyIncome={30000}
          monthlyExpenses={18000}
          onCreateRule={(type, name, description) => {
            console.log('Create rule:', { type, name, description });
            setIsWizardOpen(true);
          }}
        />
      )}

      {/* Saving Rules Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-banorte-dark">
              Reglas Automáticas
            </h2>
            <p className="text-sm text-banorte-gray">
              Ahorra sin pensarlo con reglas inteligentes
            </p>
          </div>
          <Button onClick={() => setIsWizardOpen(true)} size="sm" variant="outline">
            <Plus size={18} className="mr-2" />
            Nueva Regla
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-card p-6 text-center">
            <span className="text-5xl mb-3 block">✨</span>
            <h3 className="font-bold text-banorte-dark mb-2">
              Crea tu primera regla automática
            </h3>
            <p className="text-sm text-banorte-gray mb-4">
              Las reglas de ahorro te ayudan a acumular dinero sin esfuerzo
            </p>
            <Button onClick={() => setIsWizardOpen(true)} size="sm">
              Crear Regla
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <SavingRuleCard
                key={rule.id}
                type={rule.type.toLowerCase() as any}
                title={rule.name}
                description={`Regla de tipo ${rule.type}`}
                amountSaved={rule.totalSaved.amount}
                frequency={rule.frequency}
                isActive={rule.active}
                onToggle={handleToggle}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <SavingsHistory />

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }}
      />
      <SavingRuleWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
      />
    </div>
  );
}
