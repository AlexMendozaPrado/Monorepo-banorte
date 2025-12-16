'use client';

import React from 'react';
import { Home, TrendingUp, CreditCard, Target, Wallet, Settings, HelpCircle, LogOut } from 'lucide-react';

export interface SidebarProps {
  className?: string;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', activeTab = 'dashboard', onNavigate }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, href: '/' },
    { id: 'presupuestos', label: 'Presupuestos', icon: <Wallet size={20} />, href: '/budget' },
    { id: 'investments', label: 'Inversiones', icon: <TrendingUp size={20} />, href: '/investments' },
    { id: 'credit', label: 'Créditos', icon: <CreditCard size={20} />, href: '/credit' },
    { id: 'goals', label: 'Metas', icon: <Target size={20} />, href: '/goals' },
  ];

  const bottomItems: NavItem[] = [
    { id: 'settings', label: 'Configuración', icon: <Settings size={20} />, href: '/settings' },
    { id: 'help', label: 'Ayuda', icon: <HelpCircle size={20} />, href: '/help' },
  ];

  return (
    <aside className={`w-64 bg-white shadow-card h-screen flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-banorte-red">Banorte</h1>
        <p className="text-sm text-banorte-gray">Financial Advisor</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const handleClick = (e: React.MouseEvent) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate(item.id);
            }
          };

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={handleClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-banorte-red text-white'
                  : 'text-banorte-dark hover:bg-banorte-bg'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t space-y-1">
        {bottomItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-banorte-gray hover:bg-banorte-bg transition-colors duration-200"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-banorte-gray hover:bg-red-50 hover:text-banorte-red transition-colors duration-200 w-full">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
