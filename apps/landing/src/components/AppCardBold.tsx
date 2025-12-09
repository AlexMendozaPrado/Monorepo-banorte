'use client'

import React from 'react'

export interface AppCardBoldProps {
  icon: React.ReactNode
  title: string
  description: string
  route: string
}

export const AppCardBold: React.FC<AppCardBoldProps> = ({
  icon,
  title,
  description,
  route,
}) => {
  const handleAccess = () => {
    window.location.href = route
  }

  return (
    <div className="relative bg-gradient-to-br from-[#EB0029] to-[#C4001F] rounded-lg shadow-[0_5px_15px_rgba(235,0,41,0.3)] p-6 md:p-8 transition-all duration-300 ease-in-out hover:shadow-[0_8px_20px_rgba(235,0,41,0.4)] hover:scale-105 animate-[fadeIn_0.5s_ease-in-out] overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10 flex flex-col">
        <div className="w-[60px] h-[60px] flex items-center justify-center mb-5 bg-white rounded-lg">
          {icon}
        </div>
        <h3 className="text-[20px] font-bold text-white mb-3">{title}</h3>
        <p className="text-[14px] text-white/90 leading-[21px] mb-6 flex-1">
          {description}
        </p>
        <button
          onClick={handleAccess}
          className="h-[45px] px-6 bg-white text-[#EB0029] rounded font-bold text-[15px] transition-all duration-300 hover:bg-[#F4F7F8] hover:shadow-lg"
        >
          Acceder Ahora
        </button>
      </div>
    </div>
  )
}
