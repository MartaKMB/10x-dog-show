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
          id: "reg-1",
          show_id: showId,
          dog: {
            id: "dog-1",
            name: "Bella",
            breed: {
              name_pl: "Owczarek Niemiecki",
              name_en: "German Shepherd",
              fci_group: "G1",
            },
            gender: "female",
            birth_date: "2022-01-15",
          },
          dog_class: "open",
          catalog_number: 1,
          registration_fee: 150,
          is_paid: true,
          registered_at: "2024-01-15T10:00:00Z",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "reg-2",
          show_id: showId,
          dog: {
            id: "dog-2",
            name: "Rex",
            breed: {
              name_pl: "Labrador Retriever",
              name_en: "Labrador Retriever",
              fci_group: "G8",
            },
            gender: "male",
            birth_date: "2021-06-20",
          },
          dog_class: "champion",
          catalog_number: 2,
          registration_fee: 200,
          is_paid: false,
          registered_at: "2024-01-16T14:30:00Z",
          created_at: "2024-01-16T14:30:00Z",
          updated_at: "2024-01-16T14:30:00Z",
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

    if (filters.isPaid !== undefined) {
      filtered = filtered.filter((reg) => reg.is_paid === filters.isPaid);
    }

    if (filters.gender) {
      filtered = filtered.filter((reg) => reg.dog.gender === filters.gender);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.dog.name.toLowerCase().includes(searchLower) ||
          reg.dog.breed.name_pl.toLowerCase().includes(searchLower) ||
          reg.dog.breed.name_en.toLowerCase().includes(searchLower),
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
