import { useState, useEffect, useCallback } from "react";
import type { Show } from "../types";

export const useNextShow = (userRole: string = "club_board") => {
  const [nextShow, setNextShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNextShow = useCallback(async () => {
    if (userRole !== "club_board") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Mock data dla najbliższej wystawy klubu
      const mockNextShow: Show = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Wystawa Klubowa Hovawartów 2024",
        status: "draft",
        show_date: "2025-08-05",
        registration_deadline: "2025-07-25",
        location: "Warszawa",
        judge_name: "Jan Kowalski",
        description: "Wystawa klubowa psów rasy Hovawart",
        max_participants: 100,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
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
