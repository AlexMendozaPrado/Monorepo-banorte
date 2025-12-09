'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'

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
    <div className="bg-white border-2 border-[#EBF0F2] rounded-lg p-6 md:p-8 transition-all duration-300 ease-in-out hover:border-[#EB0029] animate-[fadeIn_0.5s_ease-in-out] group">
      <div className="flex flex-col">
        <div className="w-[50px] h-[50px] flex items-center justify-center mb-5">
          <div className="scale-[0.83] group-hover:scale-100 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-[18px] font-bold text-[#323E48] mb-3">{title}</h3>
        <p className="text-[14px] text-[#5B6670] leading-[21px] mb-6 flex-1">
          {description}
        </p>
        <button
          onClick={handleAccess}
          className="inline-flex items-center gap-2 text-[#EB0029] font-medium text-[14px] hover:gap-3 transition-all duration-300"
        >
          Explorar aplicación
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  )
}
