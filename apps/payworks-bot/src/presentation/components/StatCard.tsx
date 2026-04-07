'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accentColor: string;
}

export function StatCard({ title, value, subtitle, accentColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-card shadow-card p-6 flex flex-col gap-2 flex-1 min-w-[240px]">
      <div
        className="w-full h-[3px] rounded-full mb-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="text-banorte-secondary font-medium text-[13px]">{title}</div>
      <div className="text-banorte-dark font-bold text-4xl">{value}</div>
      <div className="text-banorte-secondary text-xs mt-1">{subtitle}</div>
    </div>
  );
}
