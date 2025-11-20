'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Key, ChevronDown } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/analyze' }: LoginFormProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <h2 className="text-gray-700 text-xl font-medium">Banco en Línea</h2>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-3">Ingresa tu usuario</p>
        <div className="mb-4">
          <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="Usuario" />
        </div>
        <Link href={redirectTo}>
          <button className="w-full bg-[#E60026] text-white font-bold py-3 rounded hover:bg-red-700">
            ENTRAR
          </button>
        </Link>
        <div className="mt-4 flex justify-between text-gray-600">
          <div className="flex items-center">
            <Key className="w-4 h-4 mr-1 text-[#E60026]" />
            <span className="text-sm">Activa tu token</span>
          </div>
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-1 text-[#E60026]" />
            <span className="text-sm">Ayuda</span>
          </div>
        </div>
        <div className="mt-2 text-gray-600">
          <span className="text-sm">Sincroniza tu token</span>
        </div>
        <div className="mt-6 flex items-center text-gray-700 border-t pt-4">
          <ChevronDown className="w-5 h-5 mr-2 text-[#E60026]" />
          <span className="font-medium">Otras Cuentas</span>
        </div>
      </div>
    </div>
  );
}
