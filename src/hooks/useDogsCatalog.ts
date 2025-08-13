import { useCallback, useEffect, useState } from "react";
import type {
  DogResponse,
  PaginationInfo,
  PaginatedResponse,
  DogGender,
} from "../types";

export type DogFiltersState = {
  gender?: DogGender;
  coat?: "czarny" | "czarny_podpalany" | "blond";
  kennel_name?: string;
  owner_id?: string;
};

type DogsCatalogState = {
  dogs: DogResponse[];
  filters: DogFiltersState;
  search: string;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
};

export const useDogsCatalog = () => {
  const [state, setState] = useState<DogsCatalogState>({
    dogs: [],
    filters: {},
    search: "",
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  });

  const performFetch = useCallback(
    async (
      filters: DogFiltersState,
      search: string,
      page: number,
      limit: number,
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const params = new URLSearchParams();
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.coat) params.append("coat", filters.coat);
        if (filters.kennel_name)
          params.append("kennel_name", filters.kennel_name);
        if (filters.owner_id) params.append("owner_id", filters.owner_id);
        if (search) params.append("search", search);
        params.append("page", String(page));
        params.append("limit", String(limit));

        const response = await fetch(`/api/dogs?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data:
          | PaginatedResponse<DogResponse>
          | {
              data: DogResponse[];
              pagination: PaginationInfo;
            } = await response.json();
        const dogs =
          (data as PaginatedResponse<DogResponse>).data ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any).dogs ||
          [];
        const pagination = (data as PaginatedResponse<DogResponse>)
          .pagination ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any).pagination || {
            page,
            limit,
            total: dogs.length,
            pages: 1,
          };

        setState((prev) => ({
          ...prev,
          dogs,
          pagination,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Nie udało się pobrać psów",
        }));
      }
    },
    [],
  );

  const fetchDogs = useCallback(() => {
    return performFetch(
      state.filters,
      state.search,
      state.pagination.page,
      state.pagination.limit,
    );
  }, [
    performFetch,
    state.filters,
    state.search,
    state.pagination.page,
    state.pagination.limit,
  ]);

  const updateFilters = useCallback((newFilters: Partial<DogFiltersState>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const updateSearch = useCallback((searchValue: string) => {
    setState((prev) => ({
      ...prev,
      search: searchValue,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const updatePagination = useCallback((page: number) => {
    setState((prev) => ({ ...prev, pagination: { ...prev.pagination, page } }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      search: "",
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  useEffect(() => {
    performFetch(
      state.filters,
      state.search,
      state.pagination.page,
      state.pagination.limit,
    );
    // Only re-run when query inputs change
  }, [
    performFetch,
    state.filters,
    state.search,
    state.pagination.page,
    state.pagination.limit,
  ]);

  return {
    state,
    fetchDogs,
    updateFilters,
    updateSearch,
    updatePagination,
    clearFilters,
  };
};

export default useDogsCatalog;
