'use client'

import React from 'react'
import { Button } from '@banorte/ui'

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
    window.location.href = route
  }

  return (
    <div className="bg-banorte-white rounded-card shadow-card p-6 md:p-10 transition-all duration-300 ease-in-out hover:translate-y-[-5px] animate-[fadeIn_0.5s_ease-in-out]">
      <div className="flex flex-col items-center">
        <div className="w-[60px] h-[60px] flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-[18px] font-bold text-banorte-dark mb-3 text-center">
          {title}
        </h3>
        <p className="text-[15px] text-banorte-gray leading-[22px] mb-8 text-center">
          {description}
        </p>
        <Button onClick={handleAccess} className="w-full md:w-auto">
          Acceder
        </Button>
      </div>
    </div>
  )
}
