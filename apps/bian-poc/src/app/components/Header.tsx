'use client';

import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { BanorteLogo } from './ui/BanorteLogo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center h-16 bg-banorte-red shadow-sm px-6">
      {/* Toggle sidebar + Logo */}
      <div className="flex items-center gap-2 flex-grow">
        <button
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          title="Mostrar/ocultar sidebar"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <BanorteLogo
          variant="white"
          height={26}
          width={140}
          useOfficialLogo={true}
          className="mr-4"
        />
      </div>

      {/* Icon buttons */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          title="Busqueda global"
        >
          <Search size={24} />
        </button>
        <button
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          title="Notificaciones"
        >
          <Bell size={24} />
        </button>
        <button
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          title="Perfil de usuario"
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
}
