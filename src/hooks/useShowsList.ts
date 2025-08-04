import { useState, useCallback } from "react";
import type { ShowResponseDto } from "../types";

interface ShowFilters {
  status?: string;
  showType?: string;
  fromDate?: string;
  toDate?: string;
  organizerId?: string;
  search?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ShowsListState {
  shows: ShowResponseDto[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
}

export const useShowsList = () => {
  const [state, setState] = useState<ShowsListState>({
    shows: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
  });

  const loadShows = useCallback(
    async (filters: ShowFilters, pagination: PaginationState) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.status) params.append("status", filters.status);
        if (filters.showType) params.append("show_type", filters.showType);
        if (filters.fromDate) params.append("from_date", filters.fromDate);
        if (filters.toDate) params.append("to_date", filters.toDate);
        if (filters.organizerId)
          params.append("organizer_id", filters.organizerId);
        if (filters.search) params.append("search", filters.search);

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
            page: 1,
            limit: 20,
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

  return {
    shows: state.shows,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    loadShows,
  };
};
