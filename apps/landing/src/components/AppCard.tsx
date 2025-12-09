'use client'

import React from 'react'

export interface AppCardProps {
  icon: React.ReactNode
  title: string
  description: string
  route: string
}

export const AppCard: React.FC<AppCardProps> = ({
  icon,
  title,
  description,
  route,
}) => {
  const handleAccess = () => {
    // Navegación a URL externa o relativa
    // Si la URL es absoluta (http/https), hace full page navigation
    // Si es relativa (/documind), Next.js router podría interceptar (pero usamos window.location para forzar navegación)
    window.location.href = route
  }

  return (
    <div className="bg-white rounded-lg shadow-[0_3px_6px_rgba(0,0,0,0.16)] p-6 md:p-10 transition-all duration-300 ease-in-out hover:translate-y-[-5px] animate-[fadeIn_0.5s_ease-in-out]">
      <div className="flex flex-col items-center">
        <div className="w-[60px] h-[60px] flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-[18px] font-bold text-[#323E48] mb-3 text-center">
          {title}
        </h3>
        <p className="text-[15px] text-[#5B6670] leading-[22px] mb-8 text-center">
          {description}
        </p>
        <button
          onClick={handleAccess}
          className="h-[45px] px-6 bg-[#EB0029] text-white rounded font-medium text-[15px] transition-colors duration-300 hover:bg-[#E30028] w-full md:w-auto"
        >
          Acceder
        </button>
      </div>
    </div>
  )
}
