'use client';

import React from 'react';

export function Header() {
  return (
    <header className="w-full h-16 bg-banorte-red px-10 flex items-center shrink-0">
      <div className="text-white font-bold text-xl tracking-[3px]">
        BANORTE
      </div>
      <div className="flex-grow" />
      <div className="flex items-center gap-4">
        <span className="text-white font-medium text-sm">
          Bot de Certificacion Payworks
        </span>
        <span className="text-white/80 text-[13px]">
          Analista Lab.
        </span>
      </div>
    </header>
  );
}
