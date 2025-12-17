'use client';

import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface FloatingActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export function FloatingActionBar({
  selectedCount,
  onClear,
  onCompare,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)] border-t border-gray-100 p-4 z-40 animate-slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-banorte-red flex items-center justify-center text-white font-bold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium text-banorte-dark">
            {selectedCount}{' '}
            {selectedCount === 1
              ? 'servicio seleccionado'
              : 'servicios seleccionados'}
          </span>
          <button
            onClick={onClear}
            className="ml-4 text-sm text-banorte-gray hover:text-banorte-red underline decoration-dotted underline-offset-4"
          >
            Limpiar selección
          </button>
        </div>

        <button
          onClick={onCompare}
          disabled={selectedCount < 2}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
            selectedCount >= 2
              ? 'bg-banorte-red hover:bg-banorte-red-hover text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Comparar Ahora</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
