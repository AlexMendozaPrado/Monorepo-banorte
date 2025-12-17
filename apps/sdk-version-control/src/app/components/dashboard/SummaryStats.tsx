'use client';

import React from 'react';
import { ServiceStatistics } from '@/core/domain/ports/repositories/IServiceRepository';

interface SummaryStatsProps {
  stats: ServiceStatistics | null;
  loading?: boolean;
}

export function SummaryStats({ stats, loading }: SummaryStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: 'Total Servicios',
      value: stats.total,
      color: null,
      bgColor: null,
    },
    {
      label: 'Actualizados',
      value: stats.current,
      color: '#6CC04A',
      bgColor: 'bg-[#6CC04A]',
    },
    {
      label: 'Pendientes',
      value: stats.warning + stats.outdated,
      color: '#FFA400',
      bgColor: 'bg-[#FFA400]',
    },
    {
      label: 'Críticos',
      value: stats.critical,
      color: '#FF671B',
      bgColor: 'bg-[#FF671B]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden"
        >
          {item.color && (
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            {item.color && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            {item.label}
          </span>
          <span className="text-3xl font-bold text-banorte-dark">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
