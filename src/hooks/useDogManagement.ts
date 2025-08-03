import { useState, useCallback } from "react";
import type { UpdateRegistrationDto, ValidationErrors } from "../types";

export const useDogManagement = (showId: string, onSuccess: () => void) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const addDog = useCallback(async () => {
    try {
      setIsAdding(true);
      setValidationErrors({});

      // Mock registration creation - data would be used in real implementation
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      onSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding dog:", error);

      // Handle validation errors
      if (
        error instanceof Error &&
        error.message.includes("VALIDATION_ERROR")
      ) {
        const errors: ValidationErrors = {};
        // Parse validation error message and extract field names
        const message = error.message;
        if (message.includes("dog_class")) {
          errors.dog_class = ["Nieprawidłowa klasa psa"];
        }
        if (message.includes("dog_id")) {
          errors.dog_id = ["Nieprawidłowy pies"];
        }
        setValidationErrors(errors);
      }

      throw error;
    } finally {
      setIsAdding(false);
    }
  }, [onSuccess]);

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
    validationErrors,
    addDog,
    editDog,
    deleteDog,
  };
};
