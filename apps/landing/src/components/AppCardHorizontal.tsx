'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'

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
    <div className="bg-white rounded-lg shadow-[0_3px_6px_rgba(0,0,0,0.16)] p-6 transition-all duration-300 ease-in-out hover:shadow-[0_5px_12px_rgba(0,0,0,0.2)] animate-[fadeIn_0.5s_ease-in-out] group">
      <div className="flex items-start gap-6">
        <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0 bg-[#F4F7F8] rounded-lg group-hover:bg-[#EB0029] transition-colors duration-300">
          <div className="group-hover:[&>svg]:stroke-white transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-[20px] font-bold text-[#323E48] mb-2">{title}</h3>
          <p className="text-[14px] text-[#5B6670] leading-[21px] mb-4">
            {description}
          </p>
          <button
            onClick={handleAccess}
            className="inline-flex items-center gap-2 text-[#EB0029] font-medium text-[15px] hover:gap-3 transition-all duration-300"
          >
            Acceder
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
