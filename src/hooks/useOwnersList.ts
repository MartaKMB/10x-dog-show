import { useState, useCallback, useEffect } from "react";
import type {
  OwnerResponseDto,
  OwnerQueryParams,
  PaginationDto,
  UserRole,
  CreateOwnerDto,
  UpdateOwnerDto,
} from "../types";

interface OwnersListState {
  owners: OwnerResponseDto[];
  pagination: PaginationDto;
  filters: OwnerQueryParams;
  search: string;
  isLoading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  sortConfig: {
    field: keyof OwnerResponseDto;
    direction: "asc" | "desc";
  };
}

const useOwnersList = (userRole: UserRole) => {
  const [state, setState] = useState<OwnersListState>({
    owners: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    filters: {},
    search: "",
    isLoading: false,
    error: null,
    canCreate: userRole === "club_board",
    canEdit: userRole === "club_board",
    canDelete: userRole === "club_board",
    userRole,
    sortConfig: { field: "created_at", direction: "desc" },
  });

  const fetchOwners = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (state.filters.email) params.append("email", state.filters.email);
      if (state.filters.city) params.append("city", state.filters.city);
      if (state.filters.gdpr_consent !== undefined)
        params.append("gdpr_consent", state.filters.gdpr_consent.toString());
      if (state.search) params.append("search", state.search);
      params.append("page", state.pagination.page.toString());
      params.append("limit", state.pagination.limit.toString());
      params.append("sort_by", state.sortConfig.field);
      params.append("sort_direction", state.sortConfig.direction);

      const response = await fetch(`/api/owners?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const owners = data.data || data;
      const pagination = data.pagination || {
        page: 1,
        limit: 20,
        total: owners.length,
        pages: 1,
      };

      setState((prev) => ({
        ...prev,
        owners,
        pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch owners:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać właścicieli",
        isLoading: false,
      }));
    }
  }, [
    state.filters,
    state.search,
    state.pagination.page,
    state.pagination.limit,
    state.sortConfig,
  ]);

  const updateFilters = useCallback((newFilters: Partial<OwnerQueryParams>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const updateSearch = useCallback((searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      search: searchTerm,
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const updateSort = useCallback((field: keyof OwnerResponseDto) => {
    setState((prev) => ({
      ...prev,
      sortConfig: {
        field,
        direction:
          prev.sortConfig.field === field && prev.sortConfig.direction === "asc"
            ? "desc"
            : "asc",
      },
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      search: "",
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const updatePagination = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  const createOwner = useCallback(
    async (data: CreateOwnerDto) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/owners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd tworzenia właściciela",
          );
        }

        // Refresh the list after successful creation
        await fetchOwners();
      } catch (error) {
        console.error("Failed to create owner:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Nie udało się utworzyć właściciela",
          isLoading: false,
        }));
        throw error;
      }
    },
    [fetchOwners],
  );

  const updateOwner = useCallback(
    async (id: string, data: UpdateOwnerDto) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/owners/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd aktualizacji właściciela",
          );
        }

        // Refresh the list after successful update
        await fetchOwners();
      } catch (error) {
        console.error("Failed to update owner:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Nie udało się zaktualizować właściciela",
          isLoading: false,
        }));
        throw error;
      }
    },
    [fetchOwners],
  );

  const deleteOwner = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/owners/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd usuwania właściciela",
          );
        }

        // Refresh the list after successful deletion
        await fetchOwners();
      } catch (error) {
        console.error("Failed to delete owner:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Nie udało się usunąć właściciela",
          isLoading: false,
        }));
        throw error;
      }
    },
    [fetchOwners],
  );

  const withdrawGDPRConsent = useCallback(
    async (ownerId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/owners/${ownerId}/gdpr-withdraw`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Błąd wycofania zgody RODO",
          );
        }

        // Refresh the list after successful withdrawal
        await fetchOwners();
      } catch (error) {
        console.error("Failed to withdraw GDPR consent:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Nie udało się wycofać zgody RODO",
          isLoading: false,
        }));
        throw error;
      }
    },
    [fetchOwners],
  );

  // Fetch owners when dependencies change
  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  return {
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
  };
};

export default useOwnersList;
