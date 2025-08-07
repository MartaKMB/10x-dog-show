import React, { useEffect, useState, useCallback } from "react";
import type {
  ShowResponse,
  RegistrationResponse,
  ShowStats as ShowStatsType,
  FilterState,
  UserRole,
  UpdateShowDto,
} from "../../types";
import ShowHeader from "./ShowHeader";
import ShowStats from "./ShowStats.tsx";
import DogsList from "./DogsList.tsx";
import AddDogModal from "./AddDogModal.tsx";
import EditDogModal from "./EditDogModal.tsx";
import EditShowModal from "./EditShowModal.tsx";
import DeleteDogConfirmation from "./DeleteDogConfirmation.tsx";
import ErrorDisplay from "./ErrorDisplay.tsx";
import LoadingSpinner from "./LoadingSpinner.tsx";
import EmptyState from "./EmptyState.tsx";
import OfflineIndicator from "./OfflineIndicator.tsx";
import { useShowDetails } from "../../hooks/useShowDetails";
import { useShowActions } from "../../hooks/useShowActions";
import { useDogManagement } from "../../hooks/useDogManagement";

interface ShowDetailsViewProps {
  showId: string;
  userRole?: UserRole;
}

interface ShowDetailsViewModel {
  show: ShowResponse | null;
  registrations: RegistrationResponse[];
  stats: ShowStatsType;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
}

const ShowDetailsView: React.FC<ShowDetailsViewProps> = ({
  showId,
  userRole = "club_board",
}) => {
  const [viewModel, setViewModel] = useState<ShowDetailsViewModel>({
    show: null,
    registrations: [],
    stats: {
      totalDogs: 0,
      byClass: {
        baby: 0,
        puppy: 0,
        junior: 0,
        intermediate: 0,
        open: 0,
        working: 0,
        champion: 0,
        veteran: 0,
      },
      byGender: {
        male: 0,
        female: 0,
      },
    },
    canEdit: false,
    canDelete: false,
    isLoading: true,
    error: null,
    filters: {},
  });

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditShowModalOpen, setIsEditShowModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationResponse | null>(null);

  const { show, registrations, isLoading, error, loadShowData } =
    useShowDetails(showId);
  const { isDeleting, isUpdating, deleteShow, updateShowStatus } =
    useShowActions(show ?? null);
  const {
    isAdding,
    isEditing,
    isDeleting: isDeletingDog,
    addDog,
    editDog,
    deleteDog,
  } = useDogManagement(showId, loadShowData);

  useEffect(() => {
    loadShowData();
  }, [showId]);

  useEffect(() => {
    if (show && registrations) {
      const stats = calculateStats(registrations);
      const canEdit = canUserEditShow();
      const canDelete = canUserDeleteShow(show);

      setViewModel((prev) => ({
        ...prev,
        show,
        registrations,
        stats,
        canEdit,
        canDelete,
        isLoading: false,
        error: null,
      }));
    }
  }, [show, registrations]);

  const calculateStats = (
    registrations: RegistrationResponse[],
  ): ShowStatsType => {
    const byClass: Record<string, number> = {
      baby: 0,
      puppy: 0,
      junior: 0,
      intermediate: 0,
      open: 0,
      working: 0,
      champion: 0,
      veteran: 0,
    };
    const byGender: Record<string, number> = {
      male: 0,
      female: 0,
    };

    registrations.forEach((registration) => {
      byClass[registration.dog_class] =
        (byClass[registration.dog_class] || 0) + 1;
      byGender[registration.dog.gender] =
        (byGender[registration.dog.gender] || 0) + 1;
    });

    return {
      totalDogs: registrations.length,
      byClass,
      byGender,
    };
  };

  const canUserEditShow = (): boolean => {
    return userRole === "club_board";
  };

  const canUserDeleteShow = (showData: ShowResponse): boolean => {
    return userRole === "club_board" && showData.registered_dogs === 0;
  };

  const handleAddDog = () => {
    setIsAddModalOpen(true);
  };

  const handleEditDog = (registration: RegistrationResponse) => {
    setSelectedRegistration(registration);
    setIsEditModalOpen(true);
  };

  const handleDeleteDog = (registration: RegistrationResponse) => {
    setSelectedRegistration(registration);
    setIsDeleteModalOpen(true);
  };

  const handleAddDogSuccess = () => {
    setIsAddModalOpen(false);
    loadShowData();
  };

  const handleEditDogSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedRegistration(null);
    loadShowData();
  };

  const handleEditShow = () => {
    setIsEditShowModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditShowSuccess = async (data: UpdateShowDto) => {
    try {
      // TODO: Implement updateShow function in useShowActions
      // For now, just close modal and reload
      setIsEditShowModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating show:", error);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditShowModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRegistration(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!show) {
    return <EmptyState message="Wystawa nie została znaleziona" />;
  }

  return (
    <div className="space-y-6">
      <OfflineIndicator />

      <ShowHeader
        show={show}
        userRole={userRole}
        canEdit={viewModel.canEdit}
        canDelete={viewModel.canDelete}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        onDelete={deleteShow}
        onStatusUpdate={updateShowStatus}
        onEdit={handleEditShow}
      />

      {/* Show Stats */}
      <ShowStats stats={viewModel.stats} userRole={userRole} />

      {/* Dogs List */}
      <DogsList
        registrations={viewModel.registrations}
        showStatus={show.status}
        canAddDogs={viewModel.canEdit}
        canEdit={viewModel.canEdit}
        canDelete={viewModel.canDelete}
        userRole={userRole}
        onAddDog={handleAddDog}
        onEditDog={handleEditDog}
        onDeleteDog={handleDeleteDog}
      />

      {/* Modals */}
      <AddDogModal
        showId={showId}
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddDogSuccess}
        isProcessing={isAdding}
        onAddDog={addDog}
      />

      <EditShowModal
        show={show}
        isOpen={isEditShowModalOpen}
        onClose={handleModalClose}
        onSave={handleEditShowSuccess}
        isLoading={isUpdating}
        error={null}
      />

      {selectedRegistration && (
        <>
          <EditDogModal
            registration={selectedRegistration}
            isOpen={isEditModalOpen}
            onClose={handleModalClose}
            onSuccess={handleEditDogSuccess}
            isProcessing={isEditing}
            onEditDog={editDog}
          />

          <DeleteDogConfirmation
            registration={selectedRegistration}
            isOpen={isDeleteModalOpen}
            onClose={handleModalClose}
            onConfirm={() =>
              selectedRegistration && deleteDog(selectedRegistration.id)
            }
            isProcessing={isDeletingDog}
            onDeleteDog={deleteDog}
          />
        </>
      )}
    </div>
  );
};

export default ShowDetailsView;
