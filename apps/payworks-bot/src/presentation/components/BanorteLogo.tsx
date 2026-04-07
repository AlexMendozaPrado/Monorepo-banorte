'use client';

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

  const TextFallback = () => (
    <span
      className={cn(
        'flex items-center justify-center font-bold tracking-[3px] text-xl',
        variant === 'white' ? 'text-white' : 'text-banorte-red'
      )}
    >
      BANORTE
    </span>
  );

  const LogoContent = () => {
    if (useOfficialLogo && !imageError) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
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
        />
      );
    }

    return <TextFallback />;
  };

  const logoElement = (
    <span
      className={cn(
        'inline-flex items-center transition-opacity',
        href && 'cursor-pointer hover:opacity-80',
        className
      )}
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
