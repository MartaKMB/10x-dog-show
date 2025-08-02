import { useState, useCallback } from "react";
import type { ShowResponseDto } from "../types";
import { supabaseClient as supabase } from "../db/supabase.client";

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
        let query = supabase.from("shows").select(
          `
            *,
            venue:venues(id, name, city),
            organizer:users!organizer_id(id, first_name, last_name)
          `,
          { count: "exact" },
        );

        // Apply filters
        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        if (filters.showType) {
          query = query.eq("show_type", filters.showType);
        }

        if (filters.fromDate) {
          query = query.gte("show_date", filters.fromDate);
        }

        if (filters.toDate) {
          query = query.lte("show_date", filters.toDate);
        }

        if (filters.organizerId) {
          query = query.eq("organizer_id", filters.organizerId);
        }

        if (filters.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }

        // Apply pagination
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);

        // Order by show date (newest first)
        query = query.order("show_date", { ascending: false });

        const { data: shows, error, count } = await query;

        if (error) {
          throw new Error(error.message);
        }

        const total = count || 0;
        const pages = Math.ceil(total / pagination.limit);

        setState({
          shows: shows || [],
          pagination: {
            ...pagination,
            total,
            pages,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Wystąpił błąd podczas ładowania wystaw",
        }));
      }
    },
    [],
  );

  return {
    ...state,
    loadShows,
  };
};
