'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Loader2,
  AlertTriangle,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { usePaymentAlerts } from '@/app/hooks/usePaymentAlerts';
import { AlertListItem } from './AlertListItem';
import { AlertStatus, PaymentAlertDTO } from '@/core/domain/entities/payment/PaymentAlert';

type FilterStatus = AlertStatus | 'all';

interface NotificationHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationHub({ isOpen, onClose }: NotificationHubProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    alerts,
    summary,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    isRead,
    refetch,
  } = usePaymentAlerts();

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter((a) => a.status === activeFilter);
    }

    // Filter by selected date
    if (selectedDate) {
      result = result.filter((a) => {
        const alertDate = new Date(a.dueDate);
        return (
          alertDate.getDate() === selectedDate.getDate() &&
          alertDate.getMonth() === selectedDate.getMonth() &&
          alertDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    return result;
  }, [alerts, activeFilter, selectedDate]);

  const filterTabs: { key: FilterStatus; label: string; icon: typeof Bell }[] = [
    { key: 'all', label: 'Todas', icon: Bell },
    { key: 'overdue', label: 'Vencidas', icon: AlertTriangle },
    { key: 'urgent', label: 'Urgentes', icon: Clock },
    { key: 'upcoming', label: 'Próximas', icon: CalendarDays },
  ];

  // Calendar helpers
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const alertsByDate = useMemo(() => {
    const map = new Map<string, PaymentAlertDTO[]>();
    alerts.forEach((alert) => {
      const date = new Date(alert.dueDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(alert);
    });
    return map;
  }, [alerts]);

  const getAlertsForDate = (day: number) => {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    return alertsByDate.get(key) || [];
  };

  const getPriorityColorForDate = (day: number): string | null => {
    const dayAlerts = getAlertsForDate(day);
    if (dayAlerts.length === 0) return null;
    if (dayAlerts.some((a) => a.priority === 'CRITICAL')) return 'bg-red-500';
    if (dayAlerts.some((a) => a.priority === 'HIGH')) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const navigateMonth = (direction: -1 | 1) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedDate?.getTime() === date.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-banorte-dark/50">
      <div
        className="bg-banorte-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-hub-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#EB0029' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="notification-hub-title" className="text-lg font-semibold text-white">
                Centro de Notificaciones
              </h2>
              <p className="text-sm text-white/80">
                {summary?.total || 0} pagos pendientes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <CheckCheck size={16} />
              Marcar todo leído
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="px-6 py-3 bg-banorte-light border-b border-gray-100 grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
              <p className="text-xs text-banorte-gray">Vencidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{summary.urgent}</p>
              <p className="text-xs text-banorte-gray">Urgentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{summary.upcoming}</p>
              <p className="text-xs text-banorte-gray">Próximas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-banorte-dark">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                }).format(summary.totalAmountDue)}
              </p>
              <p className="text-xs text-banorte-gray">Total a pagar</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Calendar Panel */}
          <div className="w-80 border-r border-gray-100 p-4 hidden md:block bg-banorte-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-banorte-bg rounded-lg text-banorte-dark"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-banorte-dark capitalize">
                {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-banorte-bg rounded-lg text-banorte-dark"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-banorte-gray py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const priorityColor = getPriorityColorForDate(day);
                const isSelected =
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentMonth.getMonth() &&
                  selectedDate?.getFullYear() === currentMonth.getFullYear();
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                      transition-colors relative
                      ${isSelected ? 'bg-banorte-red text-white' : 'text-banorte-dark hover:bg-banorte-bg'}
                      ${isToday && !isSelected ? 'ring-2 ring-banorte-red/30' : ''}
                    `}
                  >
                    {day}
                    {priorityColor && !isSelected && (
                      <span
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${priorityColor}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-4 w-full text-sm text-banorte-red hover:underline"
              >
                Limpiar filtro de fecha
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="flex-1 flex flex-col overflow-hidden bg-banorte-white">
            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto bg-banorte-light">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                    whitespace-nowrap transition-colors
                    ${
                      activeFilter === tab.key
                        ? 'bg-banorte-red text-white'
                        : 'text-banorte-gray hover:bg-banorte-bg'
                    }
                  `}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Alerts */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-banorte-red animate-spin" />
                </div>
              )}

              {error && (
                <div className="p-4 text-center">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={refetch}
                    className="text-sm text-banorte-red hover:underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && filteredAlerts.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-banorte-bg rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-banorte-gray" />
                  </div>
                  <p className="text-banorte-dark font-medium">No hay alertas</p>
                  <p className="text-sm text-banorte-gray mt-1">
                    {selectedDate
                      ? 'No hay pagos en la fecha seleccionada'
                      : 'No tienes pagos pendientes con este filtro'}
                  </p>
                </div>
              )}

              {!loading && !error && filteredAlerts.length > 0 && (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <AlertListItem
                      key={alert.id}
                      alert={alert}
                      variant="default"
                      isRead={isRead(alert.id)}
                      onMarkAsRead={() => markAsRead(alert.id)}
                      onDismiss={() => dismiss(alert.id)}
                      onPayClick={() => {
                        // TODO: Open payment modal
                        console.log('Pay:', alert.debtId);
                      }}
                      onViewClick={() => {
                        // TODO: Navigate to debt detail
                        console.log('View:', alert.debtId);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
