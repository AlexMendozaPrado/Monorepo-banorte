'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePaymentAlerts } from '@/app/hooks/usePaymentAlerts';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  onViewAllClick?: () => void;
}

export function NotificationBell({ onViewAllClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { unreadCount, criticalCount } = usePaymentAlerts();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAllClick?.();
  };

  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();
  const hasCritical = criticalCount > 0;
  const hasUnread = unreadCount > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label={`Notificaciones${hasUnread ? ` (${unreadCount} sin leer)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {hasUnread && (
          <span
            className={`
              absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
              flex items-center justify-center
              text-[10px] font-bold text-banorte-red bg-white
              rounded-full px-1
              ${hasCritical ? 'animate-pulse' : ''}
            `}
          >
            {displayCount}
          </span>
        )}
        {hasCritical && !hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-white rounded-full border-2 border-banorte-red animate-pulse" />
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onViewAllClick={handleViewAll}
        />
      )}
    </div>
  );
}
