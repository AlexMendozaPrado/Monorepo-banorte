import React from 'react';
import { Card, ProgressBar } from '@banorte/ui';
import { MoreVertical, Calendar } from 'lucide-react';

interface SavingsGoalCardProps {
  name: string;
  target: number;
  saved: number;
  targetDate: string;
  image?: string;
  icon?: React.ReactNode;
}

export function SavingsGoalCard({
  name,
  target,
  saved,
  targetDate,
  image,
  icon,
}: SavingsGoalCardProps) {
  const percentage = Math.round((saved / target) * 100);

  return (
    <Card hoverEffect className="overflow-hidden group">
      <div className="relative h-32 -mx-5 -mt-5 mb-4 bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-3 left-5 text-white">
          <h3 className="font-bold text-lg shadow-sm">{name}</h3>
        </div>

        <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-2xl font-bold text-banorte-dark">
              ${saved.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 mb-1">
              de ${target.toLocaleString()}
            </span>
          </div>
          <ProgressBar
            value={saved}
            max={target}
            height="md"
            color={percentage >= 100 ? 'success' : 'primary'}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>Meta: {targetDate}</span>
          </div>
          <span className="font-medium text-banorte-red">{percentage}%</span>
        </div>
      </div>
    </Card>
  );
}
