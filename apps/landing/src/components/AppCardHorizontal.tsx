'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@banorte/ui'

export interface AppCardHorizontalProps {
  icon: React.ReactNode
  title: string
  description: string
  route: string
}

export const AppCardHorizontal: React.FC<AppCardHorizontalProps> = ({
  icon,
  title,
  description,
  route,
}) => {
  const handleAccess = () => {
    window.location.href = route
  }

  return (
    <div className="bg-banorte-white rounded-card shadow-card p-6 transition-all duration-300 ease-in-out hover:shadow-hover animate-[fadeIn_0.5s_ease-in-out] group">
      <div className="flex items-start gap-6">
        <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0 bg-banorte-light rounded-lg group-hover:bg-banorte-red transition-colors duration-300">
          <div className="group-hover:[&>svg]:stroke-white transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-[20px] font-bold text-banorte-dark mb-2">{title}</h3>
          <p className="text-[14px] text-banorte-gray leading-[21px] mb-4">
            {description}
          </p>
          <Button
            onClick={handleAccess}
            variant="ghost"
            size="sm"
            className="text-banorte-red hover:text-banorte-red hover:gap-3 px-0"
          >
            Acceder
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
