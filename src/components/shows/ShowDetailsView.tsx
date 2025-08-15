import React, { useState, useEffect } from "react";
import type {
  ShowResponse,
  RegistrationResponse,
  UpdateShowDto,
} from "../../types";
import { useShowDetails } from "../../hooks/useShowDetails";
import { useShowActions } from "../../hooks/useShowActions";
import ShowHeader from "./ShowHeader";
import ShowStats from "./ShowStats";
import RegistrationFilters from "./RegistrationFilters";
import DogsList from "./DogsList";
import AddDogModal from "./AddDogModal";
import RegisterDogModal from "./RegisterDogModal";
import EditShowModal from "./EditShowModal";
import EditDogModal from "./EditDogModal";
import DeleteDogConfirmation from "./DeleteDogConfirmation";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";
import OfflineIndicator from "./OfflineIndicator";

interface ShowDetailsViewProps {
  showId: string;
  isAuthenticated: boolean;
}

const ShowDetailsView: React.FC<ShowDetailsViewProps> = ({
  showId,
  isAuthenticated,
}) => {
  // Show data and loading states
  const { show, registrations, isLoading, error, loadShowData, stats } =
    useShowDetails(showId);
  const { deleteShow, updateShow, updateShowStatus, isDeleting, isUpdating } =
    useShowActions(show);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditShowModalOpen, setIsEditShowModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected items
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationResponse | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [selectedDogName, setSelectedDogName] = useState<string>("");

  const resolvedShowId = showId;

  // Helper functions - now based on authentication and show status
  const canUserEditShow = (): boolean => {
    return isAuthenticated && show?.status === "draft";
  };

  const canUserDeleteShow = (showData: ShowResponse): boolean => {
    return (
      isAuthenticated &&
      showData.status === "draft" &&
      showData.registered_dogs === 0
    );
  };

  const canUserChangeStatus = (): boolean => {
    return isAuthenticated; // Zalogowany użytkownik zawsze może zmieniać status
  };

  const canUserAddDogs = (): boolean => {
    return isAuthenticated && show?.status === "draft";
  };

  const canUserEditDogs = (): boolean => {
    return isAuthenticated && show?.status === "draft";
  };

  const canUserDeleteDogs = (): boolean => {
    return isAuthenticated && show?.status === "draft";
  };

  const deleteDog = async (registrationId: string) => {
    // TODO: Implement deleteDog function
    // eslint-disable-next-line no-console
    console.log("Deleting dog with registration ID:", registrationId);
  };

  useEffect(() => {
    loadShowData();
  }, [loadShowData]);

  // Computed properties
  const viewModel = {
    canEdit: canUserEditShow(),
    canDelete: show ? canUserDeleteShow(show) : false,
    canAddDogs: canUserAddDogs(),
    filters: {
      // TODO: Implement filter state
    },
    registrations: registrations || [],
    stats: stats,
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

  // Krok 1: Po dodaniu/wybraniu psa, otwórz modal rejestracji
  const handleAddDogSuccess = (dogId: string, dogName: string) => {
    setIsAddModalOpen(false);
    setSelectedDogId(dogId);
    setSelectedDogName(dogName);
    setIsRegisterModalOpen(true);
  };

  // Krok 2: Po rejestracji psa, zamknij modal i odśwież dane
  const handleRegisterDogSuccess = () => {
    setIsRegisterModalOpen(false);
    setSelectedDogId("");
    setSelectedDogName("");
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

  const handleEditShowSuccess = async (data: UpdateShowDto) => {
    try {
      if (!show) return;

      // Update show using the hook
      await updateShow(data);

      // Reload show data to reflect changes
      await loadShowData();

      // Close modal
      setIsEditShowModalOpen(false);
    } catch (error) {
      console.error("Error updating show:", error);
      // Could add error handling here
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsEditShowModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRegistration(null);
    setSelectedDogId("");
    setSelectedDogName("");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!show) {
    return (
      <EmptyState
        title="Wystawa nie została znaleziona"
        description="Sprawdź identyfikator wystawy i spróbuj ponownie."
      />
    );
  }

  return (
    <div className="space-y-6">
      <OfflineIndicator />

      <ShowHeader
        show={show}
        isAuthenticated={isAuthenticated}
        canEdit={viewModel.canEdit}
        canDelete={viewModel.canDelete}
        canChangeStatus={canUserChangeStatus()}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        onDelete={deleteShow}
        onStatusUpdate={updateShowStatus}
        onEdit={handleEditShow}
      />

      {/* Show Stats */}
      <ShowStats stats={viewModel.stats} />

      {/* Registration Filters */}
      <RegistrationFilters
        onFiltersChange={() => {
          // TODO: Implement filter handling
        }}
        currentFilters={viewModel.filters}
      />

      {/* Dogs List */}
      <DogsList
        registrations={viewModel.registrations}
        showStatus={show.status}
        canAddDogs={canUserAddDogs()}
        canEdit={canUserEditDogs()}
        canDelete={canUserDeleteDogs()}
        onAddDog={handleAddDog}
        onEditDog={handleEditDog}
        onDeleteDog={handleDeleteDog}
      />

      {/* Modals */}
      {/* Krok 1: Modal dodawania/wyboru psa */}
      <AddDogModal
        showId={resolvedShowId as string}
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddDogSuccess}
        isProcessing={false}
      />

      {/* Krok 2: Modal rejestracji psa na wystawę */}
      <RegisterDogModal
        showId={resolvedShowId as string}
        dogId={selectedDogId}
        dogName={selectedDogName}
        isOpen={isRegisterModalOpen}
        onClose={handleModalClose}
        onSuccess={handleRegisterDogSuccess}
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
            showId={resolvedShowId as string}
            registration={selectedRegistration}
            isOpen={isEditModalOpen}
            onClose={handleModalClose}
            onSuccess={handleEditDogSuccess}
            isProcessing={false}
          />

          <DeleteDogConfirmation
            registration={selectedRegistration}
            isOpen={isDeleteModalOpen}
            onClose={handleModalClose}
            onConfirm={() =>
              selectedRegistration && deleteDog(selectedRegistration.id)
            }
            isProcessing={false}
            onDeleteDog={deleteDog}
          />
        </>
      )}
    </div>
  );
};

export default ShowDetailsView;
