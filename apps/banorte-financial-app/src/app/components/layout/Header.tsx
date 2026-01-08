'use client'

import React from 'react'
import Link from 'next/link'
import { Search, Menu } from 'lucide-react'
import BanorteLogo from './BanorteLogo'
import { NotificationBell } from '@/app/components/notifications'

interface HeaderProps {
  onMenuClick: () => void
  onNotificationHubOpen?: () => void
  userName?: string
}

export function Header({ onMenuClick, onNotificationHubOpen, userName = 'María González' }: HeaderProps) {
  return (
    <header
      className="h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30"
      style={{ backgroundColor: '#EB0029' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>

        <BanorteLogo
          variant="white"
          height={40}
          width={160}
          useOfficialLogo={true}
          className="hidden lg:block"
        />
      </div>

      <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
        <Link href="/dashboard" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Dashboard
        </Link>
        <Link href="/presupuesto" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Presupuesto
        </Link>
        <Link href="/ahorros" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Ahorros
        </Link>
        <Link href="/deudas" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Deudas
        </Link>
        <Link href="/tarjetas" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Tarjetas
        </Link>
        <Link href="/educacion" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Educación
        </Link>
        <Link href="/asesor" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
          Asesor
        </Link>
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Buscar"
        >
          <Search size={20} />
        </button>

        <NotificationBell onViewAllClick={onNotificationHubOpen} />

        <div className="flex items-center gap-2 pl-2 border-l border-white/20">
          <span className="hidden md:block text-sm font-medium text-white">
            {userName.split(' ')[0]}
          </span>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold border border-white/30">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  )
}
