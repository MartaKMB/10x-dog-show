import { useState, useCallback } from "react";
import type { ShowResponse, PaginationInfo } from "../types";

interface ShowFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

interface ShowsListState {
  shows: ShowResponse[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}

export const useShowsList = () => {
  const [state, setState] = useState<ShowsListState>({
    shows: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
  });

  const loadShows = useCallback(
    async (
      filters: ShowFilters,
      pagination: { page: number; limit: number },
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add filters
        if (filters.status) params.append("status", filters.status);
        if (filters.fromDate) params.append("from_date", filters.fromDate);
        if (filters.toDate) params.append("to_date", filters.toDate);
        if (filters.search) params.append("search", filters.search);

        // Add pagination
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());

        const response = await fetch(`/api/shows?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setState({
          shows: data.data || [],
          pagination: data.pagination || {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            pages: 0,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading shows:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load shows",
        }));
      }
    },
    [],
  );

  const refreshShows = useCallback(() => {
    loadShows({}, { page: 1, limit: 12 });
  }, [loadShows]);

  return {
    shows: state.shows,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    loadShows,
    refreshShows,
  };
};
