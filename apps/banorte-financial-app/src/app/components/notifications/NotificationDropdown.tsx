'use client';

import React from 'react';
import { Bell, ChevronRight, Loader2 } from 'lucide-react';
import { usePaymentAlerts } from '@/app/hooks/usePaymentAlerts';
import { AlertListItem } from './AlertListItem';

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAllClick?: () => void;
}

export function NotificationDropdown({ onClose, onViewAllClick }: NotificationDropdownProps) {
  const {
    alerts,
    loading,
    error,
    unreadCount,
    getTopAlerts,
    markAsRead,
    dismiss,
    isRead,
  } = usePaymentAlerts();

  const topAlerts = getTopAlerts(5);

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-banorte-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
      role="menu"
      aria-orientation="vertical"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-banorte-light">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-banorte-dark">Pagos Próximos</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-banorte-red text-white rounded-full">
              {unreadCount} nuevos
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-banorte-red animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && topAlerts.length === 0 && (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-banorte-bg rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-banorte-gray" />
            </div>
            <p className="text-sm text-banorte-dark font-medium">Sin pagos próximos</p>
            <p className="text-xs text-banorte-gray mt-1">
              No tienes pagos pendientes en los próximos 30 días
            </p>
          </div>
        )}

        {!loading && !error && topAlerts.length > 0 && (
          <div className="p-2 space-y-2">
            {topAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                variant="compact"
                isRead={isRead(alert.id)}
                onMarkAsRead={() => markAsRead(alert.id)}
                onDismiss={() => dismiss(alert.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-banorte-light">
          <button
            onClick={onViewAllClick}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-banorte-red hover:text-banorte-red/80 transition-colors"
          >
            Ver todas las alertas
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
