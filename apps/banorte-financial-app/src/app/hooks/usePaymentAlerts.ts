'use client';

import { useMemo } from 'react';
import { usePaymentAlertsContext } from '@/app/context/PaymentAlertsContext';
import { PaymentAlertDTO, AlertStatus, AlertPriority } from '@/core/domain/entities/payment/PaymentAlert';

export interface UsePaymentAlertsResult {
  // All visible alerts (not dismissed)
  alerts: PaymentAlertDTO[];

  // Filtered alert groups
  overdueAlerts: PaymentAlertDTO[];
  urgentAlerts: PaymentAlertDTO[];
  upcomingAlerts: PaymentAlertDTO[];

  // Priority groups
  criticalAlerts: PaymentAlertDTO[];
  highPriorityAlerts: PaymentAlertDTO[];

  // Summary
  summary: {
    total: number;
    overdue: number;
    urgent: number;
    upcoming: number;
    totalAmountDue: number;
  } | null;

  // Counts
  unreadCount: number;
  criticalCount: number;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;

  // Helpers
  isRead: (id: string) => boolean;
  isDismissed: (id: string) => boolean;
  getAlertById: (id: string) => PaymentAlertDTO | undefined;
  getAlertsByStatus: (status: AlertStatus) => PaymentAlertDTO[];
  getAlertsByPriority: (priority: AlertPriority) => PaymentAlertDTO[];
  getTopAlerts: (count?: number) => PaymentAlertDTO[];
}

export function usePaymentAlerts(): UsePaymentAlertsResult {
  const context = usePaymentAlertsContext();

  const overdueAlerts = useMemo(
    () => context.alerts.filter((a) => a.status === 'overdue'),
    [context.alerts]
  );

  const urgentAlerts = useMemo(
    () => context.alerts.filter((a) => a.status === 'urgent'),
    [context.alerts]
  );

  const upcomingAlerts = useMemo(
    () => context.alerts.filter((a) => a.status === 'upcoming'),
    [context.alerts]
  );

  const criticalAlerts = useMemo(
    () => context.alerts.filter((a) => a.priority === 'CRITICAL'),
    [context.alerts]
  );

  const highPriorityAlerts = useMemo(
    () => context.alerts.filter((a) => a.priority === 'HIGH'),
    [context.alerts]
  );

  const getAlertById = (id: string) => context.alerts.find((a) => a.id === id);

  const getAlertsByStatus = (status: AlertStatus) =>
    context.alerts.filter((a) => a.status === status);

  const getAlertsByPriority = (priority: AlertPriority) =>
    context.alerts.filter((a) => a.priority === priority);

  const getTopAlerts = (count = 5) => context.alerts.slice(0, count);

  return {
    alerts: context.alerts,
    overdueAlerts,
    urgentAlerts,
    upcomingAlerts,
    criticalAlerts,
    highPriorityAlerts,
    summary: context.summary,
    unreadCount: context.unreadCount,
    criticalCount: context.criticalCount,
    loading: context.loading,
    error: context.error,
    refetch: context.refetch,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    dismiss: context.dismiss,
    isRead: context.isRead,
    isDismissed: context.isDismissed,
    getAlertById,
    getAlertsByStatus,
    getAlertsByPriority,
    getTopAlerts,
  };
}
