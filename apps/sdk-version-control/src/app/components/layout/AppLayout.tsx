'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Design System Banorte */}
      <header className="bg-[#EB0029] h-[63px] flex items-center justify-between px-5 md:px-12 sticky top-0 z-50">
        <div className="logo">
          <Image
            src="/images/LogotipoBanorteFinal.png"
            alt="Banorte"
            width={140}
            height={32}
            priority={true}
            className="object-contain"
            style={{
              maxWidth: '100%',
              height: 'auto',
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-white hover:text-white/80 transition-colors" aria-label="Buscar">
            <Search size={20} />
          </button>
          <button className="text-white hover:text-white/80 transition-colors" aria-label="Notificaciones">
            <Bell size={20} />
          </button>
          <button className="text-white hover:text-white/80 transition-colors" aria-label="Menú">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-banorte-gray">
            <span>© 2024 Banorte. SDK Version Control</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
