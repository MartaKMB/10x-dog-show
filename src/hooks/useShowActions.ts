import { useState, useCallback } from "react";
import type {
  ShowDetailResponseDto,
  ShowStatus,
  UpdateShowStatusDto,
  UpdateShowDto,
} from "../types";

export const useShowActions = (show: ShowDetailResponseDto | null) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateShow = useCallback(
    async (data: UpdateShowDto): Promise<ShowDetailResponseDto> => {
      if (!show) {
        throw new Error("No show to update");
      }

      try {
        setIsUpdating(true);

        const response = await fetch(`/api/shows/${show.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd aktualizacji wystawy",
          );
        }

        const updatedShow = await response.json();
        return updatedShow;
      } catch (error) {
        console.error("Error updating show:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [show],
  );

  const deleteShow = useCallback(async () => {
    if (!show) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/shows/${show.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Błąd usuwania wystawy");
      }

      // Redirect to shows list after successful deletion
      window.location.href = "/shows";
    } catch (error) {
      console.error("Error deleting show:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [show]);

  const updateShowStatus = useCallback(
    async (status: ShowStatus) => {
      if (!show) return;

      try {
        setIsUpdating(true);

        const updateData: UpdateShowStatusDto = { status };

        const response = await fetch(`/api/shows/${show.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd aktualizacji statusu wystawy",
          );
        }

        // Refresh the page to show updated status
        window.location.reload();
      } catch (error) {
        console.error("Error updating show status:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [show],
  );

  return {
    isDeleting,
    isUpdating,
    updateShow,
    deleteShow,
    updateShowStatus,
  };
};
