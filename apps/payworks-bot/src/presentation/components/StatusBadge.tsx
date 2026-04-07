'use client';

import React from 'react';

type Status = 'Aprobado' | 'Rechazado' | 'En Proceso' | 'Pendiente';

const statusStyles: Record<Status, { bg: string; text: string }> = {
  Aprobado: { bg: 'bg-[#E9F6E2]', text: 'text-[#2E8B15]' },
  Rechazado: { bg: 'bg-[#FDE4E2]', text: 'text-[#B81818]' },
  'En Proceso': { bg: 'bg-[#E0ECFF]', text: 'text-[#1D61B0]' },
  Pendiente: { bg: 'bg-[#FFF2D9]', text: 'text-[#AE7906]' },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status];
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles.bg} ${styles.text}`}>
      {status}
    </span>
  );
}

export type { Status };
