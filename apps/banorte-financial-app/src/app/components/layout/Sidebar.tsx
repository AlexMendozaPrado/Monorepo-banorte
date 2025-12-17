'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PieChart,
  PiggyBank,
  CreditCard,
  TrendingDown,
  Shield,
  BookOpen,
  MessageCircle,
  X,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'presupuestos', label: 'Presupuestos', icon: PieChart, href: '/presupuestos' },
    { id: 'ahorros', label: 'Ahorros', icon: PiggyBank, href: '/ahorros' },
    { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard, href: '/tarjetas' },
    { id: 'deudas', label: 'Deudas', icon: TrendingDown, href: '/deudas' },
    { id: 'seguros', label: 'Seguros', icon: Shield, href: '/seguros' },
    { id: 'educacion', label: 'Educación', icon: BookOpen, href: '/educacion' },
    { id: 'asesor', label: 'Asesor IA', icon: MessageCircle, href: '/asesor' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="h-16 flex items-center justify-end px-6 border-b border-gray-100 lg:border-0">
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-banorte-red transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-red-50 text-banorte-red font-bold shadow-sm' : 'text-banorte-gray hover:bg-gray-50 hover:text-banorte-dark font-medium'}
                  `}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-banorte-red" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 text-banorte-gray transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
