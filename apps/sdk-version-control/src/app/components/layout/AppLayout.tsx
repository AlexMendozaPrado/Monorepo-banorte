'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Settings, Bell, User } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-banorte-red shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-banorte-red" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-lg leading-tight">
                    SDK Version Control
                  </h1>
                  <p className="text-white/70 text-xs">
                    Monitoreo de Versiones
                  </p>
                </div>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Notificaciones"
              >
                <Bell size={20} />
              </button>
              <button
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings size={20} />
              </button>
              <div className="ml-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </div>
          </div>
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
