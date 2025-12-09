'use client'

import React, { useState } from 'react'
import { Header } from '@/components/Header'
import { AppGrid, DesignVariant } from '@/components/AppGrid'
import { LayoutGrid, LayoutList, Minimize2, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [designVariant, setDesignVariant] = useState<DesignVariant>('cards')

  const variants = [
    {
      id: 'cards' as DesignVariant,
      name: 'Tarjetas',
      icon: <LayoutGrid size={18} />,
    },
    {
      id: 'horizontal' as DesignVariant,
      name: 'Horizontal',
      icon: <LayoutList size={18} />,
    },
    {
      id: 'minimal' as DesignVariant,
      name: 'Minimalista',
      icon: <Minimize2 size={18} />,
    },
    {
      id: 'bold' as DesignVariant,
      name: 'Atrevido',
      icon: <Sparkles size={18} />,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#EBF0F2]">
      <Header />
      <main className="flex-1 px-5 md:px-12 py-10 md:py-[50px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-[40px] font-bold text-[#EB0029] leading-[38px] mb-4">
                Selecciona una Aplicación
              </h1>
              <p className="text-xl md:text-[25px] font-bold text-[#5B6670] leading-[30px] mb-6 md:mb-0">
                Explora y prueba nuestras aplicaciones disponibles
              </p>
            </div>
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setDesignVariant(variant.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 ${designVariant === variant.id ? 'bg-[#EB0029] text-white' : 'text-[#5B6670] hover:bg-[#F4F7F8]'}`}
                  title={variant.name}
                >
                  {variant.icon}
                  <span className="hidden lg:inline text-sm font-medium">
                    {variant.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <AppGrid variant={designVariant} />
        </div>
      </main>
    </div>
  )
}
