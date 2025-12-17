'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BanorteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'red' | 'white';
  useOfficialLogo?: boolean;
}

export default function BanorteLogo({
  className = "",
  width = 140,
  height = 40,
  variant = 'red',
  useOfficialLogo = true
}: BanorteLogoProps) {
  const isWhite = variant === 'white';
  const [imageError, setImageError] = useState(false);

  // Si se debe usar el logotipo oficial y no hay error de carga
  if (useOfficialLogo && !imageError) {
    return (
      <div className={`flex items-center ${className}`} style={{ width, height }}>
        <Image
          src="/images/LogotipoBanorteFinal.png"
          alt="Banorte"
          width={width}
          height={height}
          className="object-contain"
          style={{
            filter: isWhite ? 'brightness(0) invert(1)' : 'none',
            maxWidth: width,
            maxHeight: height,
          }}
          onError={() => setImageError(true)}
          priority
        />
      </div>
    );
  }

  // Fallback al logotipo simple si no está disponible la imagen oficial
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
      {/* Símbolo simple expandido */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: height * 0.8,
          height: height * 0.8,
          backgroundColor: isWhite ? 'rgba(255, 255, 255, 0.2)' : '#EB0029',
          border: isWhite ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid #FFFFFF'
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: height * 0.3,
            height: height * 0.3,
            backgroundColor: isWhite ? '#FFFFFF' : '#FFFFFF'
          }}
        />
      </div>
    </div>
  );
}
