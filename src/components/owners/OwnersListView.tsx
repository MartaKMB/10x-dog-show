import React, { useState } from "react";
import type {
  UserRole,
  OwnerResponseDto,
  OwnerQueryParams,
  UpdateOwnerDto,
  CreateOwnerDto,
} from "../../types";
import useOwnersList from "../../hooks/useOwnersList";
import OwnerFilters from "./OwnerFilters";
import OwnerTable from "./OwnerTable";
import OwnerForm from "./OwnerForm";
import DeleteConfirmation from "./DeleteConfirmation";
import LoadingSpinner from "../shows/LoadingSpinner";
import ErrorDisplay from "../shows/ErrorDisplay";
import EmptyState from "../shows/EmptyState";
import Pagination from "../shows/Pagination";
import { Button } from "../ui/button";

interface OwnersListViewProps {
  userRole: UserRole;
}

const OwnersListView: React.FC<OwnersListViewProps> = ({ userRole }) => {
  const {
    state,
    fetchOwners,
    updateFilters,
    updateSearch,
    updateSort,
    clearFilters,
    updatePagination,
    createOwner,
    updateOwner,
    deleteOwner,
    withdrawGDPRConsent,
  } = useOwnersList(userRole);

  const [modalState, setModalState] = useState({
    isAddModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    selectedOwner: null as OwnerResponseDto | null,
  });

  const handleFiltersChange = (newFilters: Partial<OwnerQueryParams>) => {
    updateFilters(newFilters);
  };

  const handleSearch = (searchTerm: string) => {
    updateSearch(searchTerm);
  };

  const handleSort = (field: keyof OwnerResponseDto) => {
    updateSort(field);
  };

  const handleAddOwner = () => {
    setModalState({
      ...modalState,
      isAddModalOpen: true,
      selectedOwner: null,
    });
  };

  const handleEditOwner = (owner: OwnerResponseDto) => {
    setModalState({
      ...modalState,
      isEditModalOpen: true,
      selectedOwner: owner,
    });
  };

  const handleDeleteOwner = (owner: OwnerResponseDto) => {
    setModalState({
      ...modalState,
      isDeleteModalOpen: true,
      selectedOwner: owner,
    });
  };

  const handleViewDetails = (owner: OwnerResponseDto) => {
    // TODO: Navigate to owner details page
    // eslint-disable-next-line no-console
    console.log("View details for owner:", owner.id);
  };

  const closeModals = () => {
    setModalState({
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      selectedOwner: null,
    });
  };

  const handleCreateOwner = async (data: CreateOwnerDto | UpdateOwnerDto) => {
    try {
      await createOwner(data as CreateOwnerDto);
      closeModals();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleUpdateOwner = async (data: CreateOwnerDto | UpdateOwnerDto) => {
    if (!modalState.selectedOwner) return;

    try {
      await updateOwner(modalState.selectedOwner.id, data as UpdateOwnerDto);
      closeModals();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!modalState.selectedOwner) return;

    try {
      await deleteOwner(modalState.selectedOwner.id);
      closeModals();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleWithdrawGDPRConsent = async (ownerId: string) => {
    try {
      await withdrawGDPRConsent(ownerId);
    } catch {
      // Error is handled in the hook
    }
  };

  if (state.error) {
    return (
      <ErrorDisplay
        error={state.error}
        onRetry={fetchOwners}
        title="Błąd podczas ładowania właścicieli"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Zarządzanie właścicielami
          </h1>
          <p className="text-gray-600 mt-1">
            Lista właścicieli psów z możliwością zarządzania danymi i zgodami
            RODO
          </p>
        </div>

        {state.canCreate && (
          <Button
            onClick={handleAddOwner}
            disabled={state.isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Dodaj właściciela
          </Button>
        )}
      </div>

      {/* Filters */}
      <OwnerFilters
        filters={state.filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        searchValue={state.search}
      />

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md">
        {state.isLoading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : state.owners.length === 0 ? (
          <EmptyState
            title="Brak właścicieli"
            description="Nie znaleziono właścicieli spełniających kryteria wyszukiwania."
            actionLabel="Wyczyść filtry"
            onAction={clearFilters}
          />
        ) : (
          <>
            <OwnerTable
              owners={state.owners}
              onEdit={handleEditOwner}
              onDelete={handleDeleteOwner}
              onViewDetails={handleViewDetails}
              canEdit={state.canEdit}
              canDelete={state.canDelete}
              sortConfig={state.sortConfig}
              onSort={handleSort}
              onWithdrawGDPRConsent={handleWithdrawGDPRConsent}
            />

            {state.pagination.pages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={state.pagination.page}
                  totalPages={state.pagination.pages}
                  totalItems={state.pagination.total}
                  onPageChange={updatePagination}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <OwnerForm
        isOpen={modalState.isAddModalOpen}
        onClose={closeModals}
        onSubmit={handleCreateOwner}
        isLoading={state.isLoading}
        error={state.error}
        isEdit={false}
      />

      <OwnerForm
        isOpen={modalState.isEditModalOpen}
        onClose={closeModals}
        onSubmit={handleUpdateOwner}
        owner={modalState.selectedOwner}
        isLoading={state.isLoading}
        error={state.error}
        isEdit={true}
      />

      <DeleteConfirmation
        isOpen={modalState.isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
        owner={modalState.selectedOwner}
        isLoading={state.isLoading}
      />
    </div>
  );
};

export default OwnersListView;
