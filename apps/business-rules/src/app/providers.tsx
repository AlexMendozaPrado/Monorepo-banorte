'use client';

import { ReactNode } from 'react';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NotificationsProvider>
      {children}
    </NotificationsProvider>
  );
}
