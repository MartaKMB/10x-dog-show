import React, { useEffect, useState } from "react";
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
import RegistrationFilters from "./RegistrationFilters.tsx";
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
  showId?: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      byCoat: {
        czarny: 0,
        czarny_podpalany: 0,
        blond: 0,
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

  const resolvedShowId = showId as string;
  const { show, registrations, isLoading, error, loadShowData } =
    useShowDetails(resolvedShowId);
  const { isDeleting, isUpdating, deleteShow, updateShowStatus } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useShowActions((show ?? null) as any);
  const {
    isAdding,
    isEditing,
    isDeleting: isDeletingDog,
    deleteDog,
  } = useDogManagement(resolvedShowId, loadShowData);

  useEffect(() => {
    // detect auth from SSR body dataset (client only)
    if (typeof document !== "undefined") {
      const isAuth = document.body.dataset.authenticated === "true";
      setIsAuthenticated(isAuth);
    }
    loadShowData();
  }, [resolvedShowId, loadShowData]);

  useEffect(() => {
    if (show && registrations) {
      const stats = calculateStats(registrations);
      const canEdit = isAuthenticated && canUserEditShow();
      const canDelete = isAuthenticated && canUserDeleteShow(show);

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

      // Fetch evaluations for this show and build map by dog id
      (async () => {
        try {
          const res = await fetch(
            `/api/shows/${show.id}/evaluations?page=1&limit=100`,
          );
          if (res.ok) {
            const data = await res.json();
            const list = (data.data || data.evaluations || []) as Array<{
              dog: { id: string };
              dog_class: string;
              grade: string | null;
              baby_puppy_grade: string | null;
              club_title: string | null;
              placement: string | null;
            }>;
            const byDog: Record<
              string,
              {
                grade: string | null;
                baby_puppy_grade: string | null;
                club_title: string | null;
                placement: string | null;
              }
            > = {};
            list.forEach((ev) => {
              byDog[ev.dog.id] = {
                grade: ev.grade ?? null,
                baby_puppy_grade: ev.baby_puppy_grade ?? null,
                club_title: ev.club_title ?? null,
                placement: ev.placement ?? null,
              };
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
          // ignore for now
        }
      })();
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const byCoat: Record<string, number> = {
      czarny: 0,
      czarny_podpalany: 0,
      blond: 0,
    };

    registrations.forEach((registration) => {
      byClass[registration.dog_class] =
        (byClass[registration.dog_class] || 0) + 1;
      byGender[registration.dog.gender] =
        (byGender[registration.dog.gender] || 0) + 1;
      byCoat[registration.dog.coat] = (byCoat[registration.dog.coat] || 0) + 1;
    });

    return {
      totalDogs: registrations.length,
      byClass,
      byGender,
      byCoat,
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

      {/* Registration Filters */}
      <RegistrationFilters
        onFiltersChange={() => {
          // TODO: Implement filter handling
        }}
        currentFilters={viewModel.filters}
        userRole={userRole}
      />

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
        showId={resolvedShowId as string}
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAddDogSuccess}
        isProcessing={isAdding}
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
            isProcessing={isEditing}
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
