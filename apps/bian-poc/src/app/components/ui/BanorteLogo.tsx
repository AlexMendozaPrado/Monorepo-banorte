'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@banorte/ui';

interface BanorteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'red' | 'white' | 'full-color';
  useOfficialLogo?: boolean;
  href?: string;
}

export function BanorteLogo({
  className = '',
  width = 140,
  height = 40,
  variant = 'red',
  useOfficialLogo = true,
  href,
}: BanorteLogoProps) {
  const [imageError, setImageError] = useState(false);

  const LogoContent = () => {
    if (useOfficialLogo && !imageError) {
      return (
        <Image
          src="/images/LogotipoBanorteFinal.png"
          alt="Banorte"
          width={width}
          height={height}
          className="object-contain"
          style={{
            filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none',
            maxWidth: width,
            maxHeight: height,
          }}
          onError={() => setImageError(true)}
          priority
        />
      );
    }

    return (
      <span
        className={cn(
          'flex items-center justify-center font-display font-bold rounded px-4 py-2',
          variant === 'white'
            ? 'bg-transparent border-2 border-white text-white'
            : 'bg-banorte-red border-2 border-transparent text-white'
        )}
        style={{ fontSize: `${height * 0.25}px`, minWidth: `${height * 2.5}px`, height: `${height}px` }}
      >
        BANORTE
      </span>
    );
  };

  const logoElement = (
    <span
      className={cn(
        'inline-flex items-center transition-opacity',
        href && 'cursor-pointer hover:opacity-80',
        className
      )}
      style={{ width, height }}
    >
      <LogoContent />
    </span>
  );

  if (href) {
    return (
      <a href={href} className="no-underline">
        {logoElement}
      </a>
    );
  }

  return logoElement;
}
