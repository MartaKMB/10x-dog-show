import React, { useEffect, useState, useRef } from "react";
import type { UserRole } from "../../types";
import ShowCard from "./ShowCard.tsx";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";
import { Button } from "../ui/button.tsx";
import { useShowsList } from "../../hooks/useShowsList.ts";

type ShowsListViewProps = {
  userRole?: UserRole;
};

interface ShowFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

const ShowsListView: React.FC<ShowsListViewProps> = () => {
  const [filters, setFilters] = useState<ShowFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const { shows, pagination, isLoading, error, loadShows } = useShowsList();
  const isInitialMount = useRef(true);

  // Load shows on component mount and filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      loadShows(filters, { page: currentPage, limit: itemsPerPage });
      isInitialMount.current = false;
    }
  }, [loadShows, filters, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!isInitialMount.current) {
      loadShows(filters, { page: currentPage, limit: itemsPerPage });
    }
  }, [loadShows, filters, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: Partial<ShowFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    handleFilterChange({ search: term });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() =>
          loadShows(filters, { page: currentPage, limit: itemsPerPage })
        }
        title="Błąd ładowania wystaw"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Wyszukaj wystawy
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Nazwa wystawy, lokalizacja, sędzia..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange({ status: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Wszystkie</option>
              <option value="draft">Szkic</option>
              <option value="completed">Opisana</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="lg:w-48">
            <label
              htmlFor="fromDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Od daty
            </label>
            <input
              type="date"
              id="fromDate"
              value={filters.fromDate || ""}
              onChange={(e) =>
                handleFilterChange({ fromDate: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="lg:w-48">
            <label
              htmlFor="toDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Do daty
            </label>
            <input
              type="date"
              id="toDate"
              value={filters.toDate || ""}
              onChange={(e) =>
                handleFilterChange({ toDate: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="px-4 py-2"
              >
                Wyczyść filtry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Shows Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Ładowanie wystaw..." />
        </div>
      ) : shows.length === 0 ? (
        <EmptyState
          title="Brak wystaw"
          description={
            hasActiveFilters
              ? "Nie znaleziono wystaw spełniających kryteria wyszukiwania."
              : "Nie ma jeszcze żadnych wystaw w systemie."
          }
          icon="📋"
          actionLabel={
            hasActiveFilters ? "Wyczyść filtry" : "Dodaj pierwszą wystawę"
          }
          onAction={
            hasActiveFilters
              ? handleClearFilters
              : () => (window.location.href = "/shows/new")
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShowsListView;
