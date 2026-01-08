'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PaymentAlertDTO, PaymentAlertsSummary } from '@/core/domain/entities/payment/PaymentAlert';

const STORAGE_KEY = 'payment-alerts-state';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface StoredState {
  readIds: string[];
  dismissedIds: string[];
  lastUpdated: number;
}

interface PaymentAlertsContextValue {
  alerts: PaymentAlertDTO[];
  summary: PaymentAlertsSummary | null;
  unreadCount: number;
  criticalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  isRead: (id: string) => boolean;
  isDismissed: (id: string) => boolean;
}

const defaultSummary: PaymentAlertsSummary = {
  total: 0,
  overdue: 0,
  urgent: 0,
  upcoming: 0,
  totalAmountDue: 0,
};

const PaymentAlertsContext = createContext<PaymentAlertsContextValue | undefined>(undefined);

interface PaymentAlertsProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function PaymentAlertsProvider({ children, userId = 'user-1' }: PaymentAlertsProviderProps) {
  const [alerts, setAlerts] = useState<PaymentAlertDTO[]>([]);
  const [summary, setSummary] = useState<PaymentAlertsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const lastFetchRef = useRef<number>(0);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: StoredState = JSON.parse(stored);
        setReadIds(new Set(state.readIds));
        setDismissedIds(new Set(state.dismissedIds));
      }
    } catch (e) {
      console.warn('Failed to load payment alerts state from localStorage');
    }
  }, []);

  // Save state to localStorage
  const persistState = useCallback(() => {
    try {
      const state: StoredState = {
        readIds: Array.from(readIds),
        dismissedIds: Array.from(dismissedIds),
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save payment alerts state to localStorage');
    }
  }, [readIds, dismissedIds]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Fetch alerts from API
  const fetchAlerts = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < CACHE_TTL) {
      return; // Use cached data
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/advisor/payment-alerts?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data.alerts);
        setSummary(data.data.summary);
        lastFetchRef.current = now;
      } else {
        throw new Error(data.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts';
      setError(message);
      console.error('[PaymentAlertsContext] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refetch on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAlerts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchAlerts]);

  // Auto-refetch interval (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, CACHE_TTL);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const refetch = useCallback(async () => {
    await fetchAlerts(true);
  }, [fetchAlerts]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      alerts.forEach((alert) => next.add(alert.id));
      return next;
    });
  }, [alerts]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Also mark as read when dismissed
    markAsRead(id);
  }, [markAsRead]);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);
  const isDismissed = useCallback((id: string) => dismissedIds.has(id), [dismissedIds]);

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  // Calculate counts
  const unreadCount = visibleAlerts.filter((alert) => !readIds.has(alert.id)).length;
  const criticalCount = visibleAlerts.filter((alert) => alert.priority === 'CRITICAL').length;

  const value: PaymentAlertsContextValue = {
    alerts: visibleAlerts,
    summary,
    unreadCount,
    criticalCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    dismiss,
    isRead,
    isDismissed,
  };

  return (
    <PaymentAlertsContext.Provider value={value}>
      {children}
    </PaymentAlertsContext.Provider>
  );
}

export function usePaymentAlertsContext() {
  const context = useContext(PaymentAlertsContext);
  if (!context) {
    throw new Error('usePaymentAlertsContext must be used within a PaymentAlertsProvider');
  }
  return context;
}
