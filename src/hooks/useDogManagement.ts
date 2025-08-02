import { useState, useCallback } from "react";
import type { CreateRegistrationDto, UpdateRegistrationDto } from "../types";

export const useDogManagement = (showId: string, onSuccess: () => void) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addDog = useCallback(
    async (data: CreateRegistrationDto) => {
      try {
        setIsAdding(true);

        const response = await fetch(`/api/shows/${showId}/registrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd dodawania psa do wystawy",
          );
        }

        onSuccess();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error adding dog:", error);
        throw error;
      } finally {
        setIsAdding(false);
      }
    },
    [showId, onSuccess],
  );

  const editDog = useCallback(
    async (registrationId: string, data: UpdateRegistrationDto) => {
      try {
        setIsEditing(true);

        const response = await fetch(
          `/api/shows/${showId}/registrations/${registrationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd edycji rejestracji psa",
          );
        }

        onSuccess();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error editing dog:", error);
        throw error;
      } finally {
        setIsEditing(false);
      }
    },
    [showId, onSuccess],
  );

  const deleteDog = useCallback(
    async (registrationId: string) => {
      try {
        setIsDeleting(true);

        const response = await fetch(
          `/api/shows/${showId}/registrations/${registrationId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd usuwania psa z wystawy",
          );
        }

        onSuccess();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error deleting dog:", error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [showId, onSuccess],
  );

  return {
    isAdding,
    isEditing,
    isDeleting,
    addDog,
    editDog,
    deleteDog,
  };
};
