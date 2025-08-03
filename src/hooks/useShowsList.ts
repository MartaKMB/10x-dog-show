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
        // Mock shows data for development
        const mockShows: ShowResponseDto[] = [
          {
            id: "show-1",
            name: "Narodowa Wystawa Psów Warszawa 2024",
            show_type: "national",
            status: "open_for_registration",
            show_date: "2024-06-15",
            registration_deadline: "2024-05-15",
            max_participants: 500,
            description: "Największa wystawa psów w Polsce",
            entry_fee: 150,
            language: "pl",
            venue: {
              id: "venue-1",
              name: "Centrum Wystawowe EXPO XXI",
              city: "Warszawa",
            },
            organizer: {
              id: "user-1",
              first_name: "Jan",
              last_name: "Kowalski",
            },
            registered_dogs: 45,
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
            deleted_at: null,
            scheduled_for_deletion: false,
          },
          {
            id: "show-2",
            name: "Międzynarodowa Wystawa Psów Katowice 2024",
            show_type: "international",
            status: "draft",
            show_date: "2024-08-20",
            registration_deadline: "2024-07-20",
            max_participants: 300,
            description: "Międzynarodowa wystawa psów rasowych",
            entry_fee: 200,
            language: "pl",
            venue: {
              id: "venue-2",
              name: "Międzynarodowe Centrum Kongresowe",
              city: "Katowice",
            },
            organizer: {
              id: "user-2",
              first_name: "Anna",
              last_name: "Nowak",
            },
            registered_dogs: 0,
            created_at: "2024-02-01T14:30:00Z",
            updated_at: "2024-02-01T14:30:00Z",
            deleted_at: null,
            scheduled_for_deletion: false,
          },
          {
            id: "show-3",
            name: "Wystawa Psów Poznań 2024",
            show_type: "national",
            status: "completed",
            show_date: "2024-03-10",
            registration_deadline: "2024-02-10",
            max_participants: 250,
            description: "Wystawa psów rasowych w Poznaniu",
            entry_fee: 120,
            language: "pl",
            venue: {
              id: "venue-3",
              name: "Centrum Targowo-Kongresowe",
              city: "Poznań",
            },
            organizer: {
              id: "user-3",
              first_name: "Piotr",
              last_name: "Wiśniewski",
            },
            registered_dogs: 180,
            created_at: "2023-12-01T09:00:00Z",
            updated_at: "2024-03-10T18:00:00Z",
            deleted_at: null,
            scheduled_for_deletion: false,
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Apply filters (client-side for mocks)
        let filteredShows = [...mockShows];

        if (filters.status) {
          filteredShows = filteredShows.filter(
            (show) => show.status === filters.status,
          );
        }

        if (filters.showType) {
          filteredShows = filteredShows.filter(
            (show) => show.show_type === filters.showType,
          );
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredShows = filteredShows.filter(
            (show) =>
              show.name.toLowerCase().includes(searchLower) ||
              show.venue.city.toLowerCase().includes(searchLower),
          );
        }

        // Apply pagination
        const total = filteredShows.length;
        const pages = Math.ceil(total / pagination.limit);
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit;
        const paginatedShows = filteredShows.slice(from, to);

        setState({
          shows: paginatedShows,
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
