import React from 'react';
import { Button } from '@banorte/ui';
import { Calendar, Download, Plus } from 'lucide-react';

interface BudgetHeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onAddCategory: () => void;
}

export function BudgetHeader({
  currentMonth,
  onMonthChange,
  onAddCategory,
}: BudgetHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-banorte-dark mb-1">
          Presupuestos
        </h1>
        <div className="flex items-center gap-2 text-banorte-gray text-sm">
          <Calendar size={16} />
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent border-none font-medium focus:ring-0 cursor-pointer hover:text-banorte-red transition-colors"
          >
            <option value="Octubre 2024">Octubre 2024</option>
            <option value="Septiembre 2024">Septiembre 2024</option>
            <option value="Agosto 2024">Agosto 2024</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
          <Download size={16} className="mr-2" />
          Exportar
        </Button>
        <Button
          onClick={onAddCategory}
          size="sm"
          className="flex-1 md:flex-none"
        >
          <Plus size={16} className="mr-2" />
          Crear Categoría
        </Button>
      </div>
    </div>
  );
}

