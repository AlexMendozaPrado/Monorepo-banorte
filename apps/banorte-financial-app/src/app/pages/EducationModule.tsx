'use client';

import React from 'react';
import { EducationHero } from '../components/education/EducationHero';
import { TopicCard } from '../components/education/TopicCard';
import { ContentCard } from '../components/education/ContentCard';
import { LearningPath } from '../components/education/LearningPath';
import { Quiz } from '../components/education/Quiz';
import { Button } from '../components/ui/Button';
import {
  Search,
  Filter,
  Wallet,
  TrendingUp,
  Shield,
  CreditCard,
} from 'lucide-react';

export function EducationModule() {
  const topics = [
    {
      title: 'Presupuesto',
      description: 'Controla tus gastos y planifica tu dinero',
      progress: 80,
      lessonsCount: 12,
      level: 'Básico',
      icon: <Wallet size={24} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Inversiones',
      description: 'Haz crecer tu patrimonio a largo plazo',
      progress: 20,
      lessonsCount: 8,
      level: 'Intermedio',
      icon: <TrendingUp size={24} />,
      color: 'bg-green-500',
    },
    {
      title: 'Crédito',
      description: 'Usa las tarjetas a tu favor',
      progress: 45,
      lessonsCount: 10,
      level: 'Básico',
      icon: <CreditCard size={24} />,
      color: 'bg-purple-500',
    },
    {
      title: 'Seguros',
      description: 'Protege lo que más te importa',
      progress: 0,
      lessonsCount: 6,
      level: 'Avanzado',
      icon: <Shield size={24} />,
      color: 'bg-orange-500',
    },
  ];

  const recommended = [
    {
      type: 'video' as const,
      title: 'Cómo funciona el interés compuesto',
      duration: '5 min',
      rating: 4.9,
      thumbnail:
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=400',
      isRecommended: true,
    },
    {
      type: 'article' as const,
      title: 'Guía para salir de deudas rápidamente',
      duration: '8 min',
      rating: 4.7,
      thumbnail:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
      type: 'quiz' as const,
      title: 'Test de Salud Financiera',
      duration: '3 min',
      rating: 4.8,
      thumbnail:
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=400',
    },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">
            Centro Educativo
          </h1>
          <p className="text-banorte-gray">
            Aprende a tomar mejores decisiones financieras
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar temas..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-banorte-red w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
      </div>

      <EducationHero />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Topics Grid */}
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Temas Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map((topic, idx) => (
                <TopicCard key={idx} {...topic} />
              ))}
            </div>
          </div>

          {/* Recommended Content */}
          <div>
            <h2 className="text-lg font-bold text-banorte-dark mb-4">
              Recomendado para ti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommended.map((content, idx) => (
                <ContentCard key={idx} {...content} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <LearningPath />
          <Quiz />
        </div>
      </div>
    </div>
  );
}
