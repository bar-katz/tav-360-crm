import { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';

export interface DashboardStats {
  [key: string]: any;
}

export function useDashboardStats(endpoint: string, params?: Record<string, any>) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const url = `/dashboard/stats/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
        const data = await apiClient.get(url);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [endpoint, JSON.stringify(params)]);

  return { stats, isLoading, error };
}

export function useRecentActivity(limit: number = 10) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(`/dashboard/recent-activity?limit=${limit}`);
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recent activity'));
        console.error('Error fetching recent activity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  return { activities, isLoading, error };
}

