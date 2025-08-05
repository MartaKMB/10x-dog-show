import { useState, useEffect, useCallback } from "react";
import type { ShowResponseDto } from "../types";

export const useNextShow = (userRole: string = "secretary") => {
  const [nextShow, setNextShow] = useState<ShowResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNextShow = useCallback(async () => {
    if (userRole !== "secretary") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Mock data dla najbliższej wystawy sekretarza
      const mockNextShow: ShowResponseDto = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "National Dog Show Warsaw 2024",
        show_type: "national",
        status: "open_for_registration",
        show_date: "2025-08-05",
        registration_deadline: "2025-07-25",
        branch_id: "550e8400-e29b-41d4-a716-446655440201",
        organizer_id: "00000000-0000-0000-0000-000000000002",
        max_participants: 500,
        description: "Międzynarodowa wystawa psów rasowych",
        entry_fee: 150.0,
        language: "pl",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      };

      // Symulacja opóźnienia API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setNextShow(mockNextShow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadNextShow();
  }, [loadNextShow]);

  const refreshNextShow = useCallback(async () => {
    await loadNextShow();
  }, [loadNextShow]);

  return {
    nextShow,
    isLoading,
    error,
    refreshNextShow,
  };
};
