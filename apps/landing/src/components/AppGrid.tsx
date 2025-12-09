'use client'

import React from 'react'
import { AppCard } from './AppCard'
import { AppCardHorizontal } from './AppCardHorizontal'
import { AppCardMinimal } from './AppCardMinimal'
import { AppCardBold } from './AppCardBold'
import { FileText, BarChart2, FileCode } from 'lucide-react'

export type DesignVariant = 'cards' | 'horizontal' | 'minimal' | 'bold'

interface AppGridProps {
  variant: DesignVariant
}

export const AppGrid: React.FC<AppGridProps> = ({ variant }) => {
  // IMPORTANTE: Actualiza estas URLs con las URLs reales de tus apps en Vercel
  // Opción 1: Si usas subdominios
  // Opción 2: Si usas paths en el mismo dominio
  // Opción 3: Si están en proyectos separados de Vercel

  const apps = [
    {
      icon: <FileText size={60} color="#EB0029" />,
      title: 'DocuMind',
      description:
        'Análisis inteligente de documentos con IA para validación de cumplimiento normativo',
      route: process.env.NEXT_PUBLIC_DOCUMIND_URL || '/documind',
    },
    {
      icon: <BarChart2 size={60} color="#EB0029" />,
      title: 'Sentiment Analysis',
      description:
        'Análisis de sentimientos en tiempo real para feedback de clientes',
      route: process.env.NEXT_PUBLIC_SENTIMENT_URL || '/sentiment-analysis',
    },
    {
      icon: <FileCode size={60} color="#EB0029" />,
      title: 'Business Rules Generator',
      description:
        'Generación automática de reglas de negocio basadas en regulaciones',
      route: process.env.NEXT_PUBLIC_BUSINESS_RULES_URL || '/business-rules',
    },
  ]

  const gridClasses = {
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]',
    horizontal: 'grid grid-cols-1 lg:grid-cols-2 gap-[25px]',
    minimal: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]',
    bold: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]',
  }

  const CardComponent = {
    cards: AppCard,
    horizontal: AppCardHorizontal,
    minimal: AppCardMinimal,
    bold: AppCardBold,
  }[variant]

  return (
    <div className={gridClasses[variant]}>
      {apps.map((app, index) => (
        <CardComponent
          key={index}
          icon={app.icon}
          title={app.title}
          description={app.description}
          route={app.route}
        />
      ))}
    </div>
  )
}
