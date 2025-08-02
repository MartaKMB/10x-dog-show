import { useState, useCallback } from "react";
import type { CreateShowDto, VenueResponseDto } from "../types";
import { supabaseClient as supabase } from "../db/supabase.client";

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
      const { data: venues, error } = await supabase
        .from("venues")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      setState((prev) => ({
        ...prev,
        venues: venues || [],
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
        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
        }

        // Create show with organizer_id set to current user
        const { data: show, error } = await supabase
          .from("shows")
          .insert({
            ...showData,
            organizer_id: user.id,
            status: "draft", // Always start as draft
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setState((prev) => ({ ...prev, isLoading: false }));

        return {
          success: true,
          showId: show.id,
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
