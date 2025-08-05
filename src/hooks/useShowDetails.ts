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
            name: "Azor",
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
          id: "reg-2",
          show_id: showId,
          dog: {
            id: "dog-2",
            name: "Luna",
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
          id: "reg-3",
          show_id: showId,
          dog: {
            id: "dog-3",
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

      // Fetch descriptions and update registrations with status
      try {
        const descriptionsResponse = await fetch(
          `/api/descriptions?show_id=${showId}`,
        );
        if (descriptionsResponse.ok) {
          const descriptions = await descriptionsResponse.json();

          // Create a map of dog ID to description status
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const descriptionMap = new Map<string, any>();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          descriptions.forEach((desc: any) => {
            descriptionMap.set(desc.dog.id, {
              status: desc.is_final ? "finalized" : "completed",
              lastModified: desc.updated_at,
              secretaryName: `${desc.secretary.first_name} ${desc.secretary.last_name}`,
              version: desc.version,
              descriptionId: desc.id, // Add description ID for editing
            });
          });

          // Update registrations with description status
          const updatedRegistrations = mockRegistrations.map((reg) => ({
            ...reg,
            descriptionStatus: descriptionMap.get(reg.dog.id) || {
              status: "none",
            },
          }));

          setRegistrations(updatedRegistrations);
        } else {
          setRegistrations(mockRegistrations);
        }
      } catch (error) {
        console.error("Failed to fetch descriptions:", error);
        setRegistrations(mockRegistrations);
      }
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
      // Mapowanie ID ras na nazwy
      const breedNames: Record<string, string> = {
        "breed-1": "Owczarek Niemiecki",
        "breed-2": "Labrador Retriever",
        "breed-3": "Border Collie",
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
