'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@banorte/ui'

export interface AppCardMinimalProps {
  icon: React.ReactNode
  title: string
  description: string
  route: string
}

export const AppCardMinimal: React.FC<AppCardMinimalProps> = ({
  icon,
  title,
  description,
  route,
}) => {
  const handleAccess = () => {
    window.location.href = route
  }

  return (
    <div className="bg-white border-2 border-banorte-bg rounded-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:border-banorte-red animate-[fadeIn_0.5s_ease-in-out] group">
      <div className="flex flex-col">
        <div className="w-[50px] h-[50px] flex items-center justify-center mb-5">
          <div className="scale-[0.83] group-hover:scale-100 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-[18px] font-bold text-banorte-dark mb-3">{title}</h3>
        <p className="text-[14px] text-banorte-gray leading-[21px] mb-6 flex-1">
          {description}
        </p>
        <Button
          onClick={handleAccess}
          variant="ghost"
          size="sm"
          className="text-banorte-red hover:text-banorte-red px-0 justify-start"
        >
          Explorar aplicación
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </Button>
      </div>
    </div>
  )
}
