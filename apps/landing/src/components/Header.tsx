import React from 'react'
import Image from 'next/image'
import { Search, Bell, Menu } from 'lucide-react'

export const Header = () => {
  return (
    <header className="bg-[#EB0029] h-[63px] flex items-center justify-between px-5 md:px-12">
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
        <button className="text-white" aria-label="Buscar">
          <Search size={20} />
        </button>
        <button className="text-white" aria-label="Notificaciones">
          <Bell size={20} />
        </button>
        <button className="text-white" aria-label="Menú">
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
