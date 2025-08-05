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
          show_id: showId,
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440011",
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
          registered_at: "2025-01-15T10:00:00Z",
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440012",
          show_id: showId,
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440013",
            name: "Max",
            breed: {
              name_pl: "Owczarek Niemiecki",
              name_en: "German Shepherd",
              fci_group: "G1",
            },
            gender: "male",
            birth_date: "2021-08-10",
          },
          dog_class: "champion",
          catalog_number: 2,
          registration_fee: 200,
          is_paid: true,
          registered_at: "2025-01-16T14:30:00Z",
          created_at: "2025-01-16T14:30:00Z",
          updated_at: "2025-01-16T14:30:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440014",
          show_id: showId,
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440015",
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
          catalog_number: 3,
          registration_fee: 200,
          is_paid: false,
          registered_at: "2025-01-17T09:15:00Z",
          created_at: "2025-01-17T09:15:00Z",
          updated_at: "2025-01-17T09:15:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440016",
          show_id: showId,
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440017",
            name: "Luna",
            breed: {
              name_pl: "Labrador Retriever",
              name_en: "Labrador Retriever",
              fci_group: "G8",
            },
            gender: "female",
            birth_date: "2022-03-12",
          },
          dog_class: "open",
          catalog_number: 4,
          registration_fee: 150,
          is_paid: true,
          registered_at: "2025-01-18T11:45:00Z",
          created_at: "2025-01-18T11:45:00Z",
          updated_at: "2025-01-18T11:45:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440018",
          show_id: showId,
          dog: {
            id: "550e8400-e29b-41d4-a716-446655440019",
            name: "Rocky",
            breed: {
              name_pl: "Golden Retriever",
              name_en: "Golden Retriever",
              fci_group: "G8",
            },
            gender: "male",
            birth_date: "2021-12-05",
          },
          dog_class: "intermediate",
          catalog_number: 5,
          registration_fee: 180,
          is_paid: true,
          registered_at: "2025-01-19T16:20:00Z",
          created_at: "2025-01-19T16:20:00Z",
          updated_at: "2025-01-19T16:20:00Z",
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

    // Only filter by payment if user is department representative
    if (filters.isPaid !== undefined) {
      // For now, we'll always apply payment filter, but in real implementation
      // this would be controlled by user role
      filtered = filtered.filter((reg) => reg.is_paid === filters.isPaid);
    }

    if (filters.gender) {
      filtered = filtered.filter((reg) => reg.dog.gender === filters.gender);
    }

    if (filters.fciGroup) {
      filtered = filtered.filter(
        (reg) => reg.dog.breed.fci_group === filters.fciGroup,
      );
    }

    if (filters.breedId) {
      // For now, we'll filter by breed name since we don't have breed IDs in mock data
      // In real implementation, this would filter by breed_id
      const breedNames: Record<string, string> = {
        "550e8400-e29b-41d4-a716-446655440101": "Owczarek Niemiecki",
        "550e8400-e29b-41d4-a716-446655440102": "Labrador Retriever",
        "550e8400-e29b-41d4-a716-446655440103": "Golden Retriever",
        "550e8400-e29b-41d4-a716-446655440104": "Border Collie",
      };
      const breedName = breedNames[filters.breedId];
      if (breedName) {
        filtered = filtered.filter(
          (reg) => reg.dog.breed.name_pl === breedName,
        );
      }
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
