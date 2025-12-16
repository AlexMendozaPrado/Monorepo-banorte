import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight } from 'lucide-react';

export function TopExpenses() {
  const expenses = [
    {
      name: 'Renta Departamento',
      amount: 8500,
      date: '01 Oct',
      category: 'Hogar',
    },
    {
      name: 'Supermercado Walmart',
      amount: 2450,
      date: '05 Oct',
      category: 'Alimentos',
    },
    {
      name: 'Seguro de Auto',
      amount: 1800,
      date: '12 Oct',
      category: 'Seguros',
    },
    {
      name: 'Cena Restaurante',
      amount: 1200,
      date: '14 Oct',
      category: 'Ocio',
      unusual: true,
    },
    {
      name: 'Gasolina',
      amount: 950,
      date: '08 Oct',
      category: 'Transporte',
    },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark">Gastos más fuertes</h3>
        <span className="text-xs text-banorte-gray bg-gray-100 px-2 py-1 rounded">
          Octubre
        </span>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 text-banorte-red flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-banorte-dark">
                  {expense.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{expense.category}</span>
                  <span>•</span>
                  <span>{expense.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-banorte-dark">
                -${expense.amount.toLocaleString()}
              </p>
              {expense.unusual && (
                <span className="text-[10px] text-status-warning bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                  Inusual
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

