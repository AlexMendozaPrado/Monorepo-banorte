'use client'

import React from 'react'
import { Bell, Search, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  userName?: string
}

export function Header({ onMenuClick, userName = 'María González' }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-banorte-gray hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center text-banorte-gray text-sm">
          <span className="font-display font-medium text-banorte-dark">
            Hola, {userName}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <span>Último acceso: Hoy, 10:30 AM</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className="h-10 pl-10 pr-4 rounded-full bg-gray-50 border-none text-sm focus:ring-2 focus:ring-banorte-red w-64"
          />
        </div>

        <button className="relative p-2 text-banorte-gray hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-banorte-red rounded-full border-2 border-white animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 bg-banorte-red/10 rounded-full flex items-center justify-center text-banorte-red font-bold border border-banorte-red/20">
            MG
          </div>
        </div>
      </div>
    </header>
  )
}
