import React, { useEffect, useState, useCallback } from "react";
import type {
  ShowDetailResponseDto,
  RegistrationResponseDto,
  ShowStats as ShowStatsType,
  FilterState,
} from "../../types";
import ShowHeader from "./ShowHeader";
import ShowStats from "./ShowStats.tsx";
import RegistrationFilters from "./RegistrationFilters.tsx";
import DogsList from "./DogsList.tsx";
import AddDogModal from "./AddDogModal.tsx";
import EditDogModal from "./EditDogModal.tsx";
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
  userRole?: string;
}

interface ShowDetailsViewModel {
  show: ShowDetailResponseDto | null;
  registrations: RegistrationResponseDto[];
  stats: ShowStatsType;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
}

const ShowDetailsView: React.FC<ShowDetailsViewProps> = ({
  showId,
  userRole = "admin",
}) => {
  const [viewModel, setViewModel] = useState<ShowDetailsViewModel>({
    show: null,
    registrations: [],
    stats: {
      totalDogs: 0,
      paidRegistrations: 0,
      unpaidRegistrations: 0,
      byClass: {} as Record<string, number>,
      byGender: {} as Record<string, number>,
      byBreedGroup: {} as Record<string, number>,
      revenue: {
        total: 0,
        paid: 0,
        outstanding: 0,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationResponseDto | null>(null);

  const { show, registrations, isLoading, error, loadShowData, updateFilters } =
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
      const canEdit = canUserEditShow(show);
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

  useEffect(() => {
    if (error) {
      setViewModel((prev) => ({
        ...prev,
        error,
        isLoading: false,
      }));
    }
  }, [error]);

  const calculateStats = useCallback(
    (regs: RegistrationResponseDto[]): ShowStatsType => {
      const byClass: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      const byBreedGroup: Record<string, number> = {};
      let paidCount = 0;
      let unpaidCount = 0;
      let totalRevenue = 0;
      let paidRevenue = 0;
      let outstandingRevenue = 0;

      regs.forEach((reg) => {
        // Count by class
        byClass[reg.dog_class] = (byClass[reg.dog_class] || 0) + 1;

        // Count by gender
        byGender[reg.dog.gender] = (byGender[reg.dog.gender] || 0) + 1;

        // Count by breed group
        const fciGroup = reg.dog.breed.fci_group;
        byBreedGroup[fciGroup] = (byBreedGroup[fciGroup] || 0) + 1;

        // Count by payment status and calculate revenue
        const fee = reg.registration_fee || 0;
        totalRevenue += fee;

        if (reg.is_paid) {
          paidCount++;
          paidRevenue += fee;
        } else {
          unpaidCount++;
          outstandingRevenue += fee;
        }
      });

      return {
        totalDogs: regs.length,
        paidRegistrations: paidCount,
        unpaidRegistrations: unpaidCount,
        byClass,
        byGender,
        byBreedGroup,
        revenue: {
          total: totalRevenue,
          paid: paidRevenue,
          outstanding: outstandingRevenue,
        },
      };
    },
    [],
  );

  const canUserEditShow = useCallback(
    (show: ShowDetailResponseDto): boolean => {
      // Administratorzy mogą edytować wszystko
      if (userRole === "admin") {
        return true;
      }
      // Sekretarze nie mogą edytować wystaw - tylko przedstawiciele oddziałów
      if (userRole === "secretary") {
        return false;
      }
      return show.status === "draft" || show.status === "open_for_registration";
    },
    [userRole],
  );

  const canUserDeleteShow = useCallback(
    (show: ShowDetailResponseDto): boolean => {
      // Administratorzy mogą usuwać wszystko
      if (userRole === "admin") {
        return true;
      }
      // Sekretarze nie mogą usuwać wystaw - tylko przedstawiciele oddziałów
      if (userRole === "secretary") {
        return false;
      }
      return show.status === "draft";
    },
    [userRole],
  );

  const handleFiltersChange = (newFilters: FilterState) => {
    updateFilters(newFilters);
    setViewModel((prev) => ({
      ...prev,
      filters: newFilters,
    }));
  };

  const handleAddDog = () => {
    setIsAddModalOpen(true);
  };

  const handleEditDog = (registration: RegistrationResponseDto) => {
    setSelectedRegistration(registration);
    setIsEditModalOpen(true);
  };

  const handleDeleteDog = (registration: RegistrationResponseDto) => {
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

  const handleDeleteDogSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedRegistration(null);
    loadShowData();
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRegistration(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Ładowanie danych wystawy..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay
          error={error}
          onRetry={loadShowData}
          title="Błąd ładowania danych"
        />
      </div>
    );
  }

  if (!viewModel.show) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          title="Wystawa nie została znaleziona"
          description="Nie udało się załadować danych wystawy. Sprawdź czy podany adres URL jest poprawny."
        />
      </div>
    );
  }

  return (
    <>
      <OfflineIndicator />
      <div className="container mx-auto px-4 py-8">
        {viewModel.show && (
          <ShowHeader
            show={viewModel.show}
            userRole={userRole as "department_representative" | "secretary"}
            canEdit={viewModel.canEdit}
            canDelete={viewModel.canDelete}
            isDeleting={isDeleting}
            isUpdating={isUpdating}
            onDelete={deleteShow}
            onStatusUpdate={updateShowStatus}
          />
        )}

        <div className="mt-8">
          <ShowStats stats={viewModel.stats} userRole={userRole} />
        </div>

        <div className="mt-8">
          <RegistrationFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={viewModel.filters}
            userRole={userRole}
          />
        </div>

        <div className="mt-8">
          {viewModel.registrations.length === 0 ? (
            <EmptyState
              title="Brak zarejestrowanych psów"
              description="Nie ma jeszcze żadnych psów zarejestrowanych na tę wystawę."
              action={
                viewModel.canEdit ? (
                  <button
                    onClick={handleAddDog}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Dodaj pierwszego psa
                  </button>
                ) : undefined
              }
            />
          ) : (
            <DogsList
              registrations={viewModel.registrations}
              showStatus={viewModel.show.status}
              canAddDogs={viewModel.canEdit}
              onAddDog={handleAddDog}
              onEditDog={handleEditDog}
              onDeleteDog={handleDeleteDog}
              canEdit={viewModel.canEdit}
              canDelete={viewModel.canEdit}
              userRole={userRole}
            />
          )}
        </div>

        {/* Modal Components */}
        <AddDogModal
          showId={showId}
          isOpen={isAddModalOpen}
          onClose={handleModalClose}
          onSuccess={handleAddDogSuccess}
          isProcessing={isAdding}
          onAddDog={addDog}
        />

        {selectedRegistration && (
          <EditDogModal
            registration={selectedRegistration}
            isOpen={isEditModalOpen}
            onClose={handleModalClose}
            onSuccess={handleEditDogSuccess}
            isProcessing={isEditing}
            onEditDog={editDog}
          />
        )}

        {selectedRegistration && (
          <DeleteDogConfirmation
            registration={selectedRegistration}
            isOpen={isDeleteModalOpen}
            onClose={handleModalClose}
            onConfirm={handleDeleteDogSuccess}
            isProcessing={isDeletingDog}
            onDeleteDog={deleteDog}
          />
        )}
      </div>
    </>
  );
};

export default ShowDetailsView;
