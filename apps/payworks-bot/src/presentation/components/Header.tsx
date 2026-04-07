'use client';

import React from 'react';
import { BanorteLogo } from './BanorteLogo';

export function Header() {
  return (
    <header className="w-full h-16 bg-banorte-red px-10 flex items-center shrink-0">
      <BanorteLogo
        variant="white"
        height={26}
        width={140}
        useOfficialLogo={true}
        href="/dashboard"
        className="mr-4"
      />
      <div className="flex-grow" />
    </header>
  );
}
