import React, { useEffect, useState, useRef } from "react";
import type { ShowResponseDto } from "../../types";
import ShowCard from "./ShowCard.tsx";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";
import { useShowsList } from "../../hooks/useShowsList.ts";

type ShowsListViewProps = {
  userRole?: string;
};

interface ShowsListViewModel {
  shows: ShowResponseDto[];
  isLoading: boolean;
  error: string | null;
  filters: ShowFilters;
  pagination: PaginationState;
  canCreateShow: boolean;
}

interface ShowFilters {
  status?: string;
  showType?: string;
  fromDate?: string;
  toDate?: string;
  organizerId?: string;
  search?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ShowsListView: React.FC<ShowsListViewProps> = ({ userRole }) => {
  const [viewModel, setViewModel] = useState<ShowsListViewModel>({
    shows: [],
    isLoading: true,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
    canCreateShow: userRole === "department_representative",
  });

  const { shows, pagination, isLoading, error, loadShows } = useShowsList();
  const isInitialMount = useRef(true);

  // Load shows on component mount only
  useEffect(() => {
    if (isInitialMount.current) {
      loadShows(viewModel.filters, viewModel.pagination);
      isInitialMount.current = false;
    }
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    setViewModel((prev) => ({
      ...prev,
      isLoading,
      error,
    }));
  }, [isLoading, error]);

  useEffect(() => {
    if (shows && pagination) {
      setViewModel((prev) => ({
        ...prev,
        shows,
        pagination,
      }));
    }
  }, [shows, pagination]);

  const handleFilterChange = (newFilters: Partial<ShowFilters>) => {
    const updatedFilters = { ...viewModel.filters, ...newFilters };
    setViewModel((prev) => ({
      ...prev,
      filters: updatedFilters,
      pagination: { ...prev.pagination, page: 1 },
    }));
    loadShows(updatedFilters, { ...viewModel.pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setViewModel((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page: newPage },
    }));
    loadShows(viewModel.filters, { ...viewModel.pagination, page: newPage });
  };

  const handleCreateShow = () => {
    // Navigate to show creation page
    window.location.href = "/shows/new";
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (viewModel.shows.length === 0) {
    return (
      <EmptyState
        title="Brak wystaw"
        description="Nie znaleziono żadnych wystaw spełniających kryteria wyszukiwania."
        actionLabel="Utwórz pierwszą wystawę"
        onAction={handleCreateShow}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Zarządzanie wystawami
          </h1>
          {viewModel.canCreateShow && (
            <button
              onClick={handleCreateShow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Nowa wystawa
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={viewModel.filters.status || ""}
                onChange={(e) =>
                  handleFilterChange({ status: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wszystkie</option>
                <option value="draft">Szkic</option>
                <option value="open_for_registration">
                  Otwarta rejestracja
                </option>
                <option value="registration_closed">
                  Zamknięta rejestracja
                </option>
                <option value="in_progress">W trakcie</option>
                <option value="completed">Zakończona</option>
                <option value="cancelled">Anulowana</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="show-type-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Typ wystawy
              </label>
              <select
                id="show-type-filter"
                value={viewModel.filters.showType || ""}
                onChange={(e) =>
                  handleFilterChange({ showType: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wszystkie</option>
                <option value="national">Krajowa</option>
                <option value="international">Międzynarodowa</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="fromDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Od daty
              </label>
              <input
                id="fromDate"
                type="date"
                value={viewModel.filters.fromDate || ""}
                onChange={(e) =>
                  handleFilterChange({ fromDate: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="toDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Do daty
              </label>
              <input
                id="toDate"
                type="date"
                value={viewModel.filters.toDate || ""}
                onChange={(e) =>
                  handleFilterChange({ toDate: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wyszukaj
            </label>
            <input
              id="search"
              type="text"
              placeholder="Szukaj po nazwie wystawy..."
              value={viewModel.filters.search || ""}
              onChange={(e) =>
                handleFilterChange({ search: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {viewModel.shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>

      {/* Pagination */}
      {viewModel.pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(viewModel.pagination.page - 1)}
            disabled={viewModel.pagination.page <= 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Poprzednia
          </button>

          <span className="px-3 py-2 text-sm text-gray-700">
            Strona {viewModel.pagination.page} z {viewModel.pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(viewModel.pagination.page + 1)}
            disabled={viewModel.pagination.page >= viewModel.pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Następna
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-gray-600 mt-4">
        Wyświetlono {viewModel.shows.length} z {viewModel.pagination.total}{" "}
        wystaw
      </div>
    </div>
  );
};

export default ShowsListView;
