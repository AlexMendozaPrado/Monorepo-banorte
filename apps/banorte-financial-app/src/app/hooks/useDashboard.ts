'use client';

import { useState, useEffect } from 'react';

export function useDashboard(userId: string) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSummary();
    }
  }, [userId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/summary?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

