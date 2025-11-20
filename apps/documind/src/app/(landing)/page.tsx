'use client';

import React from 'react';
import { Header, SecondaryNav, LoginForm, Promotion, ChatBubble, SocialIcons } from '@banorte/landing-page';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100">
      <Header />
      <SecondaryNav />
      <Promotion />
      {/* LoginForm - Oculto en mobile pequeño para evitar superposición */}
      <div className="absolute top-32 left-4 z-30 w-full max-w-sm hidden sm:block">
        <LoginForm />
      </div>
      <ChatBubble />
      <SocialIcons />
    </div>
  );
}
