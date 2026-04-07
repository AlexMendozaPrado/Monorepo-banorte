'use client';

import React from 'react';
import { Card } from '@banorte/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accentColor: string;
}

export function StatCard({ title, value, subtitle, accentColor }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2 flex-1 min-w-[240px] !p-6">
      <div
        className="w-full h-[3px] rounded-full mb-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="text-banorte-secondary font-medium text-[13px]">{title}</div>
      <div className="text-banorte-dark font-bold text-4xl">{value}</div>
      <div className="text-banorte-secondary text-xs mt-1">{subtitle}</div>
    </Card>
  );
}
