import { useState, useCallback } from "react";
import type { CreateShowDto, VenueResponseDto } from "../types";

interface ShowCreatorState {
  venues: VenueResponseDto[];
  isLoading: boolean;
  error: string | null;
}

interface CreateShowResult {
  success: boolean;
  showId?: string;
  error?: string;
}

export const useShowCreator = () => {
  const [state, setState] = useState<ShowCreatorState>({
    venues: [],
    isLoading: false,
    error: null,
  });

  const loadVenues = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // For now, use mock venues since venues API is not implemented yet
      const mockVenues: VenueResponseDto[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440201",
          name: "Centrum Wystawowe EXPO XXI",
          address: "ul. Prądzyńskiego 12/14",
          city: "Warszawa",
          postal_code: "01-222",
          country: "Polska",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440202",
          name: "Międzynarodowe Centrum Kongresowe",
          address: "plac Sławika i Antalla 1",
          city: "Katowice",
          postal_code: "40-163",
          country: "Polska",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440203",
          name: "Centrum Targowo-Kongresowe",
          address: "ul. Głogowska 14",
          city: "Poznań",
          postal_code: "60-734",
          country: "Polska",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      setState((prev) => ({
        ...prev,
        venues: mockVenues,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Błąd podczas ładowania obiektów",
      }));
    }
  }, []);

  const loadJudges = useCallback(async () => {
    // Judges loading is not implemented yet
    // This will be used in future versions for judge assignment
  }, []);

  const createShow = useCallback(
    async (showData: CreateShowDto): Promise<CreateShowResult> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/shows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(showData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message ||
              `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();

        setState((prev) => ({ ...prev, isLoading: false }));

        return {
          success: true,
          showId: data.id,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Błąd podczas tworzenia wystawy";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [],
  );

  return {
    venues: state.venues,
    isLoading: state.isLoading,
    error: state.error,
    loadVenues,
    loadJudges,
    createShow,
  };
};
