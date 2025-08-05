import React, { useState, useEffect } from "react";
import type {
  DogsFilterState,
  BreedResponseDto,
  DogGender,
  DogClass,
  DescriptionStatus,
} from "../../types";
import { Button } from "../ui/button.tsx";

interface FilterPanelProps {
  filters: DogsFilterState;
  onFiltersChange: (filters: Partial<DogsFilterState>) => void;
  onSearch: (searchTerm: string) => void;
  onClearFilters: () => void;
  searchValue: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  searchValue,
}) => {
  const [breeds, setBreeds] = useState<BreedResponseDto[]>([]);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        onSearch(localSearchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchValue, onSearch, searchValue]);

  // Load breeds on mount
  useEffect(() => {
    const fetchBreeds = async () => {
      setIsLoadingBreeds(true);
      try {
        const response = await fetch("/api/breeds");
        if (response.ok) {
          const data = await response.json();
          setBreeds(data.data || data);
        }
      } catch (error) {
        console.error("Failed to fetch breeds:", error);
      } finally {
        setIsLoadingBreeds(false);
      }
    };

    fetchBreeds();
  }, []);

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof DogsFilterState, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters =
    Object.values(filters).some(
      (value) => value !== undefined && value !== "" && value !== null,
    ) || searchValue.length > 0;

  const genderOptions: { value: DogGender; label: string }[] = [
    { value: "male", label: "Samiec" },
    { value: "female", label: "Suczka" },
  ];

  const classOptions: { value: DogClass; label: string }[] = [
    { value: "baby", label: "Baby" },
    { value: "puppy", label: "Szczenię" },
    { value: "junior", label: "Junior" },
    { value: "intermediate", label: "Młodzież" },
    { value: "open", label: "Otwarta" },
    { value: "working", label: "Pracująca" },
    { value: "champion", label: "Champion" },
    { value: "veteran", label: "Weteran" },
  ];

  const statusOptions: { value: DescriptionStatus; label: string }[] = [
    { value: { status: "none" }, label: "Brak opisu" },
    { value: { status: "draft" }, label: "Szkic" },
    { value: { status: "completed" }, label: "Ukończony" },
    { value: { status: "finalized" }, label: "Sfinalizowany" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wyszukiwanie
          </label>
          <input
            id="search"
            type="text"
            value={localSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Szukaj po nazwie psa, właścicielu..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={2}
            maxLength={100}
          />
        </div>

        {/* Breed Filter */}
        <div>
          <label
            htmlFor="breed"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rasa
          </label>
          <select
            id="breed"
            value={filters.breedId || ""}
            onChange={(e) =>
              handleFilterChange("breedId", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoadingBreeds}
          >
            <option value="">Wszystkie rasy</option>
            {breeds.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name_pl}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Płeć
          </label>
          <select
            id="gender"
            value={filters.gender || ""}
            onChange={(e) =>
              handleFilterChange("gender", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Wszystkie</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <label
            htmlFor="class"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Klasa
          </label>
          <select
            id="class"
            value={filters.dogClass || ""}
            onChange={(e) =>
              handleFilterChange("dogClass", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Wszystkie klasy</option>
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Row */}
      <div className="mt-4">
        <label
          htmlFor="description-status"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Status opisu
        </label>
        <div
          className="flex flex-wrap gap-2"
          id="description-status"
          role="group"
        >
          {statusOptions.map((option) => (
            <button
              key={option.value.status}
              onClick={() =>
                handleFilterChange("descriptionStatus", option.value)
              }
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.descriptionStatus?.status === option.value.status
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            Wyczyść wszystkie filtry
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
