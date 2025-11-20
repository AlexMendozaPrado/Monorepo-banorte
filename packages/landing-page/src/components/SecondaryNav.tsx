import React from 'react';
import { CreditCard, DollarSign, BarChart3, Shield, Globe, LayoutGrid, Users } from 'lucide-react';

export function SecondaryNav() {
  return (
    <nav className="w-full bg-gray-600 text-white py-2">
      <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <CreditCard className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Cuentas y Tarjetas</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <DollarSign className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Créditos</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Ahorro e Inversión</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <Shield className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Seguros</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <Globe className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Internacional</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Servicios en Línea</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <Users className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Nómina</span>
        </a>
        <a href="#" className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-500 rounded">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Cotiza en Línea</span>
        </a>
      </div>
    </nav>
  );
}
