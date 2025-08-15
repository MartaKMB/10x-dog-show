import React from "react";
import DogFilters from "./DogFilters";
import DogsTable from "./DogsTable";
import Pagination from "../shows/Pagination";
import LoadingSpinner from "../shows/LoadingSpinner";
import ErrorDisplay from "../shows/ErrorDisplay";
import EmptyState from "../shows/EmptyState";
import { useDogsCatalog } from "../../hooks/useDogsCatalog";

type DogsListViewProps = {
  isAuthenticated: boolean;
};

const DogsListView: React.FC<DogsListViewProps> = ({ isAuthenticated }) => {
  const {
    state,
    updateFilters,
    updateSearch,
    updatePagination,
    clearFilters,
    fetchDogs,
  } = useDogsCatalog();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRowClick = (dogId: string) => {
    // Optional navigation to details when page exists
    // window.location.href = `/dogs/${dogId}`;
  };

  if (state.error) {
    return (
      <ErrorDisplay
        error={state.error}
        onRetry={() => fetchDogs()}
        title="Błąd podczas ładowania psów"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista psów</h1>
            <p className="text-gray-600">Wyszukuj i filtruj psy w systemie</p>
          </div>
        </div>

        <DogFilters
          filters={state.filters}
          searchValue={state.search}
          onFiltersChange={updateFilters}
          onSearch={updateSearch}
          onClearFilters={clearFilters}
        />
      </div>

      <div className="bg-white shadow rounded-lg">
        {state.isLoading ? (
          <div className="p-8">
            <LoadingSpinner text="Ładowanie psów..." />
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
            <DogsTable
              dogs={state.dogs}
              isLoading={state.isLoading}
              onRowClick={handleRowClick}
              isAuthenticated={isAuthenticated}
            />
            {state.pagination.pages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={state.pagination.page}
                  totalPages={state.pagination.pages}
                  totalItems={state.pagination.total}
                  onPageChange={updatePagination}
                  itemsPerPage={state.pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DogsListView;
