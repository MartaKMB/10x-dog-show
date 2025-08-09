import { useState, useEffect, useCallback } from "react";
import type { ShowResponse } from "../types";

interface DashboardStats {
  totalShows: number;
  completedShows: number;
  totalDogs: number;
}

interface DashboardState {
  stats: DashboardStats;
  recentShows: ShowResponse[];
  isLoading: boolean;
  error: string | null;
}

const defaultStats: DashboardStats = {
  totalShows: 0,
  completedShows: 0,
  totalDogs: 0,
};

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    stats: defaultStats,
    recentShows: [],
    isLoading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch dashboard stats
      const statsResponse = await fetch("/api/dashboard/stats");
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();

      // Fetch recent shows
      const showsResponse = await fetch(
        "/api/shows?limit=5&sort=show_date&order=desc",
      );
      if (!showsResponse.ok) {
        throw new Error(`Failed to fetch shows: ${showsResponse.status}`);
      }
      const showsData = await showsResponse.json();

      setState({
        stats: statsData.data || defaultStats,
        recentShows: showsData.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats: state.stats,
    recentShows: state.recentShows,
    isLoading: state.isLoading,
    error: state.error,
    refreshData,
  };
};
