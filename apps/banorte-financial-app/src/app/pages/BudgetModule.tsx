'use client';

import React, { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { useAntExpenses } from '../hooks/useAntExpenses';
import { BudgetHeader } from '../components/budget/BudgetHeader';
import { BudgetSummary } from '../components/budget/BudgetSummary';
import { CategoryCard } from '../components/budget/CategoryCard';
import { SmallExpensesAlert } from '../components/budget/SmallExpensesAlert';
import { TopExpenses } from '../components/budget/TopExpenses';
import { CategoryModal } from '../components/budget/CategoryModal';
import { Button } from '../components/ui/Button';

export function BudgetModule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const userId = 'user-demo';
  const { budget, loading: budgetLoading, error: budgetError, createBudget } = useBudget(userId, currentMonth);
  const { analysis: antExpenses, loading: antExpensesLoading } = useAntExpenses(userId);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleCreateBudget = async () => {
    try {
      await createBudget({
        month: currentMonth,
        totalIncome: 30000,
        categories: [
          { name: 'Alimentos', budgeted: 6000, icon: '🍔', color: '#6CC04A' },
          { name: 'Transporte', budgeted: 2500, icon: '🚗', color: '#5B6670' },
          { name: 'Ocio', budgeted: 1500, icon: '☕', color: '#FFA400' },
          { name: 'Hogar', budgeted: 8500, icon: '🏠', color: '#EB0029' },
          { name: 'Servicios', budgeted: 2000, icon: '⚡', color: '#323E48' },
        ],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategorySave = (data: any) => {
    console.log('Category saved:', data);
    // TODO: Implement category update/create logic
  };

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banorte-red mx-auto mb-4"></div>
          <p className="text-banorte-gray">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (budgetError && !budget) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-card shadow-card p-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-banorte-dark mb-4">
            No tienes presupuesto para este mes
          </h2>
          <p className="text-banorte-gray mb-6">
            Crea tu primer presupuesto para comenzar a administrar tus finanzas de manera inteligente.
          </p>
          <Button onClick={handleCreateBudget} size="lg">
            Crear Presupuesto
          </Button>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-card shadow-card p-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-banorte-dark mb-4">
            No tienes presupuesto para este mes
          </h2>
          <p className="text-banorte-gray mb-6">
            Crea tu primer presupuesto para comenzar a administrar tus finanzas de manera inteligente.
          </p>
          <Button onClick={handleCreateBudget} size="lg">
            Crear Presupuesto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <BudgetHeader
        currentMonth={new Date(budget.month).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        onMonthChange={handleMonthChange}
        onAddCategory={handleAddCategory}
      />

      <BudgetSummary
        income={budget.totalIncome.amount}
        spent={budget.totalSpent.amount}
        available={budget.available.amount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <h2 className="text-lg font-bold mb-4 text-banorte-dark">Categorías de Gastos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budget.categories.map((cat: any) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                icon={<span className="text-xl">{cat.icon || '📁'}</span>}
                spent={cat.spent.amount}
                budget={cat.budgeted.amount}
                trend="stable"
                onEdit={handleEditCategory}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {!antExpensesLoading && antExpenses && antExpenses.detections.length > 0 && (
            <SmallExpensesAlert userId={userId} />
          )}
          <TopExpenses />
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        category={selectedCategory ? budget.categories.find((c: any) => c.id === selectedCategory) : null}
        onSave={handleCategorySave}
      />
    </div>
  );
}

