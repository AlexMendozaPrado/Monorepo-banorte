'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export interface BudgetHeaderProps {
  currentMonth: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onAddCategory: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  currentMonth,
  onMonthChange,
  onAddCategory,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-banorte-dark">Presupuesto</h1>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2">
          <button
            onClick={() => onMonthChange('prev')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={20} className="text-banorte-gray" />
          </button>
          <span className="text-base font-semibold text-banorte-dark min-w-[140px] text-center capitalize">
            {currentMonth}
          </span>
          <button
            onClick={() => onMonthChange('next')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={20} className="text-banorte-gray" />
          </button>
        </div>
      </div>
      
      <Button
        variant="primary"
        size="md"
        onClick={onAddCategory}
        className="flex items-center gap-2"
      >
        <Plus size={20} />
        <span>Agregar Categoría</span>
      </Button>
    </div>
  );
};

