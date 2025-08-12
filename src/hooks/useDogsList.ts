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
    canEdit: userRole === "club_board" && showStatus === "draft",
    canDelete: userRole === "club_board" && showStatus === "draft",
    userRole,
  });

  const transformToHierarchy = useCallback(
    (registrations: RegistrationResponseDto[]): HierarchyNode[] => {
      const hierarchy: Record<string, HierarchyNode> = {};

      // Group by dog class only (no FCI groups or breeds in MVP)
      registrations.forEach((registration) => {
        const dogClass = registration.dog_class;

        // Find or create class node
        let classNode = hierarchy[dogClass];
        if (!classNode) {
          classNode = {
            type: "class",
            id: dogClass,
            name: dogClass,
            children: [],
            isExpanded: true,
            count: 0,
            data: dogClass,
          };
          hierarchy[dogClass] = classNode;
        }

        // Add dog node
        const dogNode: HierarchyNode = {
          type: "dog",
          id: registration.dog.id,
          name: registration.dog.name,
          children: [],
          isExpanded: true,
          count: 1,
          data: {
            ...registration.dog,
            created_at: new Date().toISOString(),
          },
        };

        classNode.children.push(dogNode);
        classNode.count += 1;
      });

      // Convert to array and sort by class name
      const result = Object.values(hierarchy).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      // Update counts for all nodes
      result.forEach((node) => {
        if (node.type === "class") {
          node.count = node.children.reduce(
            (sum, child) => sum + child.count,
            0,
          );
        }
      });

      return result;
    },
    [],
  );

  const fetchDogs = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(
        `/api/shows/${showId}/registrations?limit=1000`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const hierarchyNodes = transformToHierarchy(data.data || []);

      setState((prev) => ({
        ...prev,
        dogs: hierarchyNodes,
        pagination: {
          ...prev.pagination,
          total: hierarchyNodes.length,
          pages: Math.ceil(hierarchyNodes.length / prev.pagination.limit),
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching dogs:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      }));
    }
  }, [showId, transformToHierarchy]);

  const updateFilters = useCallback((newFilters: Partial<DogsFilterState>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const searchDogs = useCallback((searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      search: searchTerm,
      pagination: { ...prev.pagination, page: 1 },
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
