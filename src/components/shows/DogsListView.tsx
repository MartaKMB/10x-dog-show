import React, { useEffect } from "react";
import type { UserRole, ShowStatus, DogsFilterState } from "../../types";
import FilterPanel from "./FilterPanel";
import HierarchicalList from "./HierarchicalList";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";
import HierarchyControls from "./HierarchyControls";
import AddDogModal from "./AddDogModal.tsx";
// import EditDogModal from "./EditDogModal.tsx";
// import DeleteDogConfirmation from "./DeleteDogConfirmation.tsx";
import useDogsList from "../../hooks/useDogsList";
import useDogActions from "../../hooks/useDogActions";
import useHierarchy from "../../hooks/useHierarchy";

interface DogsListViewProps {
  showId: string;
  userRole?: UserRole;
  showStatus?: ShowStatus;
}

const DogsListView: React.FC<DogsListViewProps> = ({
  showId,
  userRole = "secretary",
  showStatus = "open_for_registration",
}) => {
  const { state, fetchDogs, updateFilters, searchDogs, clearFilters } =
    useDogsList(showId, userRole, showStatus);

  const {
    isProcessing,
    modalState,
    createDescription,
    openAddModal,
    closeModals,
  } = useDogActions();

  // Initialize hierarchy hook
  const {
    nodes: hierarchyNodes,
    toggleNode,
    expandAll,
    collapseAll,
    getVisibleNodes,
    getNodeCount,
  } = useHierarchy(state.dogs);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  const handleFiltersChange = (newFilters: Partial<DogsFilterState>) => {
    updateFilters(newFilters);
  };

  const handleSearch = (searchTerm: string) => {
    searchDogs(searchTerm);
  };

  const handleNodeToggle = (nodeId: string) => {
    toggleNode(nodeId);
  };

  const handleHierarchySearch = (query: string) => {
    // Implementacja wyszukiwania w hierarchii
    // eslint-disable-next-line no-console
    console.log("Searching hierarchy for:", query);
  };

  const handleDogAction = (action: string, dogId: string) => {
    switch (action) {
      case "view":
        // Navigate to dog details
        break;
      case "edit":
        // TODO: Implement edit modal
        // eslint-disable-next-line no-console
        console.log("Edit dog:", dogId);
        break;
      case "delete":
        // TODO: Implement delete modal
        // eslint-disable-next-line no-console
        console.log("Delete dog:", dogId);
        break;
      case "create_description":
        createDescription(dogId);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn("Unknown action:", action);
    }
  };

  const handleAddDog = () => {
    openAddModal();
  };

  // TODO: Implement delete dog functionality when modals are ready
  // const handleDeleteDog = async (dogId: string) => {
  //   await deleteDog(dogId);
  //   fetchDogs(); // Refresh list after deletion
  // };

  if (state.error) {
    return (
      <ErrorDisplay
        error={state.error}
        onRetry={fetchDogs}
        title="Błąd podczas ładowania psów"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Zarządzanie psami
          </h1>
          <p className="text-gray-600 mt-1">
            Hierarchiczny widok psów uczestniczących w wystawie
          </p>
        </div>

        <button
          onClick={handleAddDog}
          disabled={!state.canEdit || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Dodaj psa
        </button>
      </div>

      {/* Filters */}
      <FilterPanel
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
        ) : state.dogs.length === 0 ? (
          <EmptyState
            title="Brak psów"
            description="Nie znaleziono psów spełniających kryteria wyszukiwania."
            actionLabel="Wyczyść filtry"
            onAction={clearFilters}
          />
        ) : (
          <>
            {/* Hierarchy Controls */}
            <HierarchyControls
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              onSearch={handleHierarchySearch}
              totalNodes={getNodeCount()}
              visibleNodes={getVisibleNodes().length}
            />

            {/* Debug: Log hierarchy nodes */}
            {/* eslint-disable-next-line no-console */}
            {console.log(
              "Rendering HierarchicalList with nodes:",
              hierarchyNodes,
            )}

            <HierarchicalList
              nodes={hierarchyNodes}
              onNodeToggle={handleNodeToggle}
              onDogAction={handleDogAction}
              canEdit={state.canEdit}
              canDelete={state.canDelete}
              userRole={userRole}
              showStatus={showStatus}
            />

            {state.pagination.pages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={state.pagination.page}
                  totalPages={state.pagination.pages}
                  totalItems={state.pagination.total}
                  onPageChange={(page: number) => {
                    // TODO: Implementacja zmiany strony
                    // eslint-disable-next-line no-console
                    console.log("Page change to:", page);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddDogModal
        isOpen={modalState.isAddModalOpen}
        onClose={closeModals}
        showId={showId}
        isProcessing={isProcessing}
        onAddDog={async (data) => {
          // TODO: Implement add dog logic
          // eslint-disable-next-line no-console
          console.log("Add dog with data:", data);
          return Promise.resolve();
        }}
        onSuccess={() => {
          closeModals();
          fetchDogs();
        }}
      />

      {/* EditDogModal and DeleteDogConfirmation will be implemented when modal components are ready */}
      {/* For now, we'll comment them out to avoid type errors */}
      {/*
      <EditDogModal
        isOpen={modalState.isEditModalOpen}
        onClose={closeModals}
        showId={showId}
        onSuccess={() => {
          closeModals();
          fetchDogs();
        }}
      />

      <DeleteDogConfirmation
        isOpen={modalState.isDeleteModalOpen}
        onClose={closeModals}
        dogId={selectedDog}
        onConfirm={() => selectedDog && handleDeleteDog(selectedDog)}
        isProcessing={isProcessing}
      />
      */}
    </div>
  );
};

export default DogsListView;
