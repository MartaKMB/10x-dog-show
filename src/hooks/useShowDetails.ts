import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  ShowDetailResponseDto,
  RegistrationResponseDto,
  FilterState,
} from "../types";

interface UseShowDetailsReturn {
  show: ShowDetailResponseDto | null;
  registrations: RegistrationResponseDto[];
  isLoading: boolean;
  error: string | null;
  loadShowData: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateFilters: (filters: FilterState) => Promise<void>;
  filteredRegistrations: RegistrationResponseDto[];
  stats: {
    totalDogs: number;
    byClass: Record<string, number>;
    byGender: Record<string, number>;
    byCoat: Record<string, number>;
  };
}

export const useShowDetails = (showId: string): UseShowDetailsReturn => {
  const [show, setShow] = useState<ShowDetailResponseDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    gender: undefined,
    dogClass: undefined,
    coat: undefined,
    search: "",
  });

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

      // Load registrations from API
      const registrationsResponse = await fetch(
        `/api/shows/${showId}/registrations`,
      );
      if (!registrationsResponse.ok) {
        throw new Error(
          `Błąd ładowania rejestracji: ${registrationsResponse.statusText}`,
        );
      }
      const registrationsData = await registrationsResponse.json();
      setRegistrations(registrationsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  const refreshData = useCallback(async () => {
    await loadShowData();
  }, [loadShowData]);

  const updateFilters = useCallback(async (newFilters: FilterState) => {
    setFilters(newFilters);
    // Filters are applied client-side in getFilteredRegistrations
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      // Gender filter
      if (
        filters.gender !== undefined &&
        registration.dog.gender !== filters.gender
      ) {
        return false;
      }

      // Dog class filter
      if (
        filters.dogClass !== undefined &&
        registration.dog_class !== filters.dogClass
      ) {
        return false;
      }

      // Coat filter
      if (
        filters.coat !== undefined &&
        registration.dog.coat !== filters.coat
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const dogName = registration.dog.name.toLowerCase();
        const ownerNames = registration.dog.owners
          .map((owner) => owner.name.toLowerCase())
          .join(" ");

        if (
          !dogName.includes(searchLower) &&
          !ownerNames.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, filters]);

  // Obliczanie statystyk wystawy
  const stats = useMemo(() => {
    if (!registrations || registrations.length === 0) {
      return {
        totalDogs: 0,
        byClass: {},
        byGender: {},
        byCoat: {},
      };
    }

    const statsData = {
      totalDogs: registrations.length,
      byClass: {} as Record<string, number>,
      byGender: {} as Record<string, number>,
      byCoat: {} as Record<string, number>,
    };

    registrations.forEach((registration) => {
      // Klasa psa
      const dogClass = registration.dog_class;
      statsData.byClass[dogClass] = (statsData.byClass[dogClass] || 0) + 1;

      // Płeć psa
      const gender = registration.dog.gender;
      if (gender) {
        statsData.byGender[gender] = (statsData.byGender[gender] || 0) + 1;
      }

      // Maść psa
      const coat = registration.dog.coat;
      if (coat) {
        statsData.byCoat[coat] = (statsData.byCoat[coat] || 0) + 1;
      }
    });

    return statsData;
  }, [registrations]);

  useEffect(() => {
    loadShowData();
  }, [loadShowData]);

  return {
    show,
    registrations,
    isLoading,
    error,
    loadShowData,
    refreshData,
    updateFilters,
    filteredRegistrations,
    stats,
  };
};
