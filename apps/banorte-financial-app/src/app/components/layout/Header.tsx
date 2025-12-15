'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showSearch = true,
  className = '',
}) => {
  return (
    <header className={`bg-white shadow-sm border-b px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Title or Search */}
        <div className="flex-1">
          {title ? (
            <h2 className="text-2xl font-bold text-banorte-dark">{title}</h2>
          ) : showSearch ? (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-banorte-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-input focus:outline-none focus:ring-2 focus:ring-banorte-red focus:border-banorte-red"
              />
            </div>
          ) : null}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-banorte-gray hover:text-banorte-dark transition-colors">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-banorte-red rounded-full"></span>
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-banorte-bg transition-colors">
            <div className="w-8 h-8 bg-banorte-red rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-banorte-dark">Usuario</p>
              <p className="text-xs text-banorte-gray">usuario@banorte.com</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
