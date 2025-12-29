'use client';

import React from 'react';
import { Card, Button } from '@banorte/ui';
import { Trophy, ArrowRight } from 'lucide-react';

export function EducationHero() {
  return (
    <Card className="bg-gradient-to-br from-banorte-dark to-gray-800 text-white border-none mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
            <Trophy size={14} className="text-yellow-400" />
            <span>Nivel: Principiante Avanzado</span>
          </div>

          <h1 className="text-3xl font-display font-bold">
            Aprende a Mejorar tu{' '}
            <span className="text-banorte-red">Salud Financiera</span>
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed">
            Has completado el 35% de tu ruta de aprendizaje. Tu próximo objetivo
            es dominar el interés compuesto.
          </p>

          <Button className="bg-white text-banorte-dark hover:bg-gray-100 border-none">
            Continuar Aprendiendo <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 w-full md:w-auto min-w-[280px]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Tu Progreso</span>
            <span className="text-2xl font-bold">35%</span>
          </div>

          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-banorte-red h-2 rounded-full w-[35%]" />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-yellow-400">3</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Badges
              </span>
            </div>
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-green-400">12</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Lecciones
              </span>
            </div>
            <div className="flex-1 bg-gray-800/50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-blue-400">850</span>
              <span className="text-[10px] text-gray-400 uppercase">
                Puntos
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
