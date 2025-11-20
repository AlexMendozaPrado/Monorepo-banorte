import React from 'react';
import Image from 'next/image';
import { Accessibility, MapPin, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header
      className="flex items-center justify-between whitespace-nowrap px-10 py-3"
      style={{ backgroundColor: '#EB0029' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-4 text-white">
        <Image
          src="/images/logos/LogotipoBanorteFinal.png"
          alt="Banorte"
          width={140}
          height={32}
          priority={true}
          className="object-contain"
          style={{
            maxWidth: '100%',
            height: 'auto',
            filter: 'brightness(0) invert(1)', // Convertir a blanco
          }}
        />
      </div>

      {/* Navegación central */}
      <nav className="hidden md:flex space-x-6">
        <a href="#" className="text-white text-sm font-medium hover:text-gray-200 transition-colors">
          PREFERENTE
        </a>
        <a href="#" className="text-white text-sm font-medium hover:text-gray-200 transition-colors">
          PYMES
        </a>
        <a href="#" className="text-white text-sm font-medium hover:text-gray-200 transition-colors">
          EMPRESAS
        </a>
        <a href="#" className="text-white text-sm font-medium hover:text-gray-200 transition-colors">
          GOBIERNO
        </a>
        <a href="#" className="text-white text-sm font-medium hover:text-gray-200 transition-colors">
          CASA DE BOLSA
        </a>
      </nav>

      {/* Iconos derecha */}
      <div className="flex items-center gap-4">
        <button
          className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Accesibilidad"
        >
          <Accessibility className="w-5 h-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Ubicación"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Usuario"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
