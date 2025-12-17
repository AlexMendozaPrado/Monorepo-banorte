import { useState, useEffect } from 'react';
import axios from 'axios';

export function useInsurance(userId: string) {
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchInsurances();
    }
  }, [userId]);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/insurance?userId=${userId}`);

      if (response.data.success) {
        setInsurances(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching insurance');
    } finally {
      setLoading(false);
    }
  };

  return {
    insurances,
    loading,
    error,
    refetch: fetchInsurances,
  };
}

