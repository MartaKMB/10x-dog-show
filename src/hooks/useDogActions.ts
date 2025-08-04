import { useState, useCallback } from "react";
import type { DogActionsState } from "../types";

const useDogActions = () => {
  const [state, setState] = useState<DogActionsState>({
    selectedDog: null,
    isProcessing: false,
    modalState: {
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
    },
  });

  const openAddModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modalState: {
        ...prev.modalState,
        isAddModalOpen: true,
      },
    }));
  }, []);

  const openEditModal = useCallback((dogId: string) => {
    setState((prev) => ({
      ...prev,
      selectedDog: dogId,
      modalState: {
        ...prev.modalState,
        isEditModalOpen: true,
      },
    }));
  }, []);

  const openDeleteModal = useCallback((dogId: string) => {
    setState((prev) => ({
      ...prev,
      selectedDog: dogId,
      modalState: {
        ...prev.modalState,
        isDeleteModalOpen: true,
      },
    }));
  }, []);

  const closeModals = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDog: null,
      modalState: {
        isAddModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
      },
    }));
  }, []);

  const editDog = useCallback(async (dogId: string) => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      // Navigate to edit page or open edit modal
      // This will be implemented based on the specific requirements
      // eslint-disable-next-line no-console
      console.log("Editing dog:", dogId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to edit dog:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const deleteDog = useCallback(
    async (dogId: string) => {
      setState((prev) => ({ ...prev, isProcessing: true }));

      try {
        const response = await fetch(`/api/dogs/${dogId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to delete dog");
        }

        // Close modal after successful deletion
        closeModals();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to delete dog:", error);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [closeModals],
  );

  const createDescription = useCallback(async (dogId: string) => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      // Navigate to description creation page
      // This will be implemented based on the specific requirements
      // eslint-disable-next-line no-console
      console.log("Creating description for dog:", dogId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create description:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, []);

  return {
    selectedDog: state.selectedDog,
    isProcessing: state.isProcessing,
    modalState: state.modalState,
    editDog,
    deleteDog,
    createDescription,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModals,
  };
};

export default useDogActions;
