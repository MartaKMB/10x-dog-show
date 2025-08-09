import { useState, useCallback, useMemo } from "react";
import type {
  ShowDetailResponseDto,
  RegistrationResponseDto,
  FilterState,
} from "../types";

export const useShowDetails = (showId: string) => {
  const [show, setShow] = useState<ShowDetailResponseDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});

  const loadShowData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load show details
      const showResponse = await fetch(`/api/shows/${showId}`);
      if (!showResponse.ok) {
        throw new Error(`Błąd ładowania wystawy: ${showResponse.statusText}`);
      }
      const showData: ShowDetailResponseDto = await showResponse.json();
      setShow(showData);

      // Load registrations using mock data for development
      const mockRegistrations: RegistrationResponseDto[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440010",
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440011",
            name: "Bella",
            gender: "female",
            birth_date: "2022-01-15",
            microchip_number: null,
            kennel_name: null,
            father_name: null,
            mother_name: null,
            owners: [],
          },
          dog_class: "open",
          catalog_number: 1,
          registered_at: "2025-01-15T10:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440012",
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440013",
            name: "Max",
            gender: "male",
            birth_date: "2021-08-10",
            microchip_number: null,
            kennel_name: null,
            father_name: null,
            mother_name: null,
            owners: [],
          },
          dog_class: "champion",
          catalog_number: 2,
          registered_at: "2025-01-16T14:30:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440014",
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440015",
            name: "Rex",
            gender: "male",
            birth_date: "2021-06-20",
            microchip_number: null,
            kennel_name: null,
            father_name: null,
            mother_name: null,
            owners: [],
          },
          dog_class: "champion",
          catalog_number: 3,
          registered_at: "2025-01-17T09:15:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440016",
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440017",
            name: "Luna",
            gender: "female",
            birth_date: "2022-03-12",
            microchip_number: null,
            kennel_name: null,
            father_name: null,
            mother_name: null,
            owners: [],
          },
          dog_class: "open",
          catalog_number: 4,
          registered_at: "2025-01-18T11:45:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440018",
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440019",
            name: "Rocky",
            gender: "male",
            birth_date: "2021-12-05",
            microchip_number: null,
            kennel_name: null,
            father_name: null,
            mother_name: null,
            owners: [],
          },
          dog_class: "intermediate",
          catalog_number: 5,
          registered_at: "2025-01-19T16:20:00Z",
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setRegistrations(mockRegistrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  const refreshData = useCallback(async () => {
    await loadShowData();
  }, []);

  const updateFilters = useCallback(async (newFilters: FilterState) => {
    setFilters(newFilters);
    // Filters are applied client-side in getFilteredRegistrations
    // No need to reload from server when using mocks
  }, []);

  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    if (filters.dogClass) {
      filtered = filtered.filter((reg) => reg.dog_class === filters.dogClass);
    }

    // Payment filtering is not supported in MVP types; skip if provided

    if (filters.gender) {
      filtered = filtered.filter((reg) => reg.dog.gender === filters.gender);
    }

    // Breed group filtering is not supported in MVP types; skip

    // Breed filtering is not supported in MVP types; skip

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((reg) =>
        reg.dog.name.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [registrations, filters]);

  return {
    show,
    registrations: filteredRegistrations,
    allRegistrations: registrations,
    isLoading,
    error,
    filters,
    loadShowData,
    refreshData,
    updateFilters,
  };
};
