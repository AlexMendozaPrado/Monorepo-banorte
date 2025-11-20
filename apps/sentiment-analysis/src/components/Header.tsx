'use client';

import Link from "next/link";
import BanorteLogo from "./BanorteLogo";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between whitespace-nowrap px-6 py-4"
      style={{ backgroundColor: '#EB0029' }}
    >
      <div className="flex items-center">
        <BanorteLogo
          variant="white"
          height={60}
          width={200}
          useOfficialLogo={true}
          className="mr-4"
        />
      </div>
      <div className="flex flex-1 justify-end gap-6">
        <nav className="flex items-center gap-8">
          {['Inicio','Análisis','Historial','Ayuda'].map((item) => (
            <Link key={item} href="#" className="text-sm font-medium leading-normal text-white hover:text-gray-200 transition-colors">
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {/* Ícono de búsqueda */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
            </svg>
          </button>

          {/* Ícono de notificaciones */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Notificaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
            </svg>
          </button>

          {/* Ícono de menú */}
          <button
            className="flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
