import { useState, useCallback } from "react";
import { ShowDetailResponseDto, RegistrationResponseDto } from "../types";

interface FilterState {
  dogClass?: string;
  isPaid?: boolean;
  search?: string;
  gender?: string;
}

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

      // Load registrations
      const registrationsResponse = await fetch(
        `/api/shows/${showId}/registrations`,
      );
      if (!registrationsResponse.ok) {
        throw new Error(
          `Błąd ładowania rejestracji: ${registrationsResponse.statusText}`,
        );
      }
      const registrationsData: RegistrationResponseDto[] =
        await registrationsResponse.json();
      setRegistrations(registrationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  const refreshData = useCallback(async () => {
    await loadShowData();
  }, [loadShowData]);

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const getFilteredRegistrations = useCallback(() => {
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
    registrations: getFilteredRegistrations(),
    allRegistrations: registrations,
    isLoading,
    error,
    filters,
    loadShowData,
    refreshData,
    updateFilters,
  };
};
