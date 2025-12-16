import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Edit2, Coins, Percent, Calendar, Sparkles } from 'lucide-react';

interface SavingRuleCardProps {
  type: 'roundup' | 'percentage' | 'fixed' | 'smart';
  title: string;
  description: string;
  amountSaved: number;
  frequency: string;
  isActive: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export function SavingRuleCard({
  type,
  title,
  description,
  amountSaved,
  frequency,
  isActive,
  onToggle,
  onEdit,
}: SavingRuleCardProps) {
  const icons = {
    roundup: <Coins size={24} />,
    percentage: <Percent size={24} />,
    fixed: <Calendar size={24} />,
    smart: <Sparkles size={24} />,
  };

  const colors = {
    roundup: 'bg-purple-100 text-purple-600',
    percentage: 'bg-blue-100 text-blue-600',
    fixed: 'bg-green-100 text-green-600',
    smart: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card
      className={`relative group transition-all duration-300 ${!isActive ? 'opacity-75 grayscale' : ''}`}
    >
      <button
        onClick={onEdit}
        className="absolute top-3 right-3 p-2 text-gray-300 hover:text-banorte-red hover:bg-gray-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit2 size={16} />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colors[type]}`}>{icons[type]}</div>
        <div>
          <h3 className="font-bold text-banorte-dark">{title}</h3>
          <p className="text-xs text-banorte-gray mt-1 line-clamp-2 h-8">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end border-b border-gray-100 pb-3">
          <div>
            <p className="text-xs text-gray-400">Total ahorrado</p>
            <p className="text-lg font-bold text-banorte-dark">
              ${amountSaved.toLocaleString()}
            </p>
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-banorte-gray">
            {frequency}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span
            className={`text-xs font-medium ${isActive ? 'text-status-success' : 'text-gray-400'}`}
          >
            {isActive ? 'Activa' : 'Pausada'}
          </span>
          <button
            onClick={onToggle}
            className={`
              w-10 h-5 rounded-full transition-colors duration-300 relative
              ${isActive ? 'bg-status-success' : 'bg-gray-300'}
            `}
          >
            <div
              className={`
                w-3 h-3 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm
                ${isActive ? 'left-6' : 'left-1'}
              `}
            />
          </button>
        </div>
      </div>
    </Card>
  );
}
