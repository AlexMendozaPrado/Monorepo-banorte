'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NotificationHub } from '@/app/components/notifications'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationHubOpen, setIsNotificationHubOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-banorte-bg font-sans text-banorte-dark">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onNotificationHubOpen={() => setIsNotificationHubOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <NotificationHub
        isOpen={isNotificationHubOpen}
        onClose={() => setIsNotificationHubOpen(false)}
      />
    </div>
  )
}

