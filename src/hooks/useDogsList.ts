import { useState, useCallback, useEffect } from "react";
import type {
  DogsListState,
  DogsFilterState,
  HierarchyNode,
  UserRole,
  ShowStatus,
  RegistrationResponseDto,
} from "../types";

const useDogsList = (
  showId: string,
  userRole: UserRole,
  showStatus: ShowStatus,
) => {
  const [state, setState] = useState<DogsListState>({
    showId,
    dogs: [],
    filters: {},
    search: "",
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
    canEdit:
      userRole === "department_representative" ||
      userRole === "admin" ||
      (userRole === "secretary" && showStatus !== "in_progress"),
    canDelete:
      (userRole === "department_representative" || userRole === "admin") && showStatus !== "in_progress",
    userRole,
  });

  const transformToHierarchy = useCallback(
    (registrations: RegistrationResponseDto[]): HierarchyNode[] => {
      const hierarchy: Record<string, HierarchyNode> = {};

      // Group by FCI Group
      registrations.forEach((registration) => {
        const fciGroup = registration.dog.breed.fci_group;
        const breedId = registration.dog.breed.name_pl; // Use name_pl as id since id is not available in Pick type
        const dogClass = registration.dog_class;

        // Create FCI Group node if not exists
        if (!hierarchy[fciGroup]) {
          hierarchy[fciGroup] = {
            type: "fci_group",
            id: fciGroup,
            name: fciGroup,
            children: [],
            isExpanded: true,
            count: 0,
            data: fciGroup,
          };
        }

        // Find or create breed node
        let breedNode = hierarchy[fciGroup].children.find(
          (child) => child.id === breedId,
        );
        if (!breedNode) {
          breedNode = {
            type: "breed",
            id: breedId,
            name: registration.dog.breed.name_pl,
            children: [],
            isExpanded: true,
            count: 0,
            data: {
              id: breedId,
              name_pl: registration.dog.breed.name_pl,
              name_en: registration.dog.breed.name_en,
              fci_group: registration.dog.breed.fci_group,
              fci_number: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
          hierarchy[fciGroup].children.push(breedNode);
        }

        // Find or create class node
        let classNode = breedNode.children.find(
          (child) => child.id === `${breedId}-${dogClass}`,
        );
        if (!classNode) {
          classNode = {
            type: "class",
            id: `${breedId}-${dogClass}`,
            name: dogClass,
            children: [],
            isExpanded: true,
            count: 0,
            data: dogClass,
          };
          breedNode.children.push(classNode);
        }

        // Add dog node
        const dogNode: HierarchyNode = {
          type: "dog",
          id: registration.dog.id,
          name: registration.dog.name,
          children: [],
          isExpanded: false,
          count: 1,
          data: {
            ...registration.dog,
            registration,
            descriptionStatus: { status: "none" }, // Will be fetched separately
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any, // Type assertion for complex data structure
        };

        classNode.children.push(dogNode);
      });

      // Calculate counts
      Object.values(hierarchy).forEach((fciGroup) => {
        fciGroup.count = fciGroup.children.reduce((sum, breed) => {
          breed.count = breed.children.reduce((sum, classNode) => {
            classNode.count = classNode.children.length;
            return sum + classNode.count;
          }, 0);
          return sum + breed.count;
        }, 0);
      });

      return Object.values(hierarchy);
    },
    [],
  );

  const fetchDogs = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("show_id", showId);

      if (state.filters.breedId)
        params.append("breed_id", state.filters.breedId);
      if (state.filters.gender) params.append("gender", state.filters.gender);
      if (state.filters.dogClass)
        params.append("dog_class", state.filters.dogClass);
      if (state.search) params.append("search", state.search);
      params.append("page", state.pagination.page.toString());
      params.append("limit", state.pagination.limit.toString());

      const response = await fetch(
        `/api/shows/${showId}/registrations-mock?${params}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const registrations = data.data || data;
      const pagination = data.pagination || {
        page: 1,
        limit: 20,
        total: registrations.length,
        pages: 1,
      };

      // Transform to hierarchy
      const hierarchy = transformToHierarchy(registrations);

      setState((prev) => ({
        ...prev,
        dogs: hierarchy,
        pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch dogs:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Nie udało się pobrać psów",
        isLoading: false,
      }));
    }
  }, [
    showId,
    state.filters,
    state.search,
    state.pagination.page,
    state.pagination.limit,
    transformToHierarchy,
  ]);

  const updateFilters = useCallback((newFilters: Partial<DogsFilterState>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const searchDogs = useCallback((searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      search: searchTerm,
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

  // Fetch dogs when dependencies change
  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  return {
    state,
    fetchDogs,
    updateFilters,
    searchDogs,
    clearFilters,
    updatePagination,
  };
};

export default useDogsList;
