import React, { useState, useEffect } from "react";
import type { OwnerQueryParams } from "../../types";
import { Button } from "../ui/button";

interface OwnerFiltersProps {
  filters: OwnerQueryParams;
  onFiltersChange: (filters: Partial<OwnerQueryParams>) => void;
  onSearch: (searchTerm: string) => void;
  onClearFilters: () => void;
  searchValue: string;
}

const OwnerFilters: React.FC<OwnerFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  searchValue,
}) => {
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

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
  };

  const handleFilterChange = (
    key: keyof OwnerQueryParams,
    value: string | boolean | undefined,
  ) => {
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters =
    Object.values(filters).some(
      (value) => value !== undefined && value !== "" && value !== null,
    ) || searchValue.length > 0;

  const gdprConsentOptions = [
    { value: undefined, label: "Wszystkie" },
    { value: true, label: "Z zgodą RODO" },
    { value: false, label: "Bez zgody RODO" },
  ];

  const countryOptions = [
    { value: "", label: "Wszystkie kraje" },
    { value: "Polska", label: "Polska" },
    { value: "Niemcy", label: "Niemcy" },
    { value: "Czechy", label: "Czechy" },
    { value: "Słowacja", label: "Słowacja" },
    { value: "Ukraina", label: "Ukraina" },
    { value: "Białoruś", label: "Białoruś" },
    { value: "Litwa", label: "Litwa" },
    { value: "Łotwa", label: "Łotwa" },
    { value: "Estonia", label: "Estonia" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            placeholder="Szukaj po imieniu, nazwisku, email..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={2}
            maxLength={100}
          />
        </div>

        {/* Email Filter */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={filters.email || ""}
            onChange={(e) =>
              handleFilterChange("email", e.target.value || undefined)
            }
            placeholder="Filtruj po email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City Filter */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Miasto
          </label>
          <input
            id="city"
            type="text"
            value={filters.city || ""}
            onChange={(e) =>
              handleFilterChange("city", e.target.value || undefined)
            }
            placeholder="Filtruj po mieście"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country Filter */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kraj
          </label>
          <select
            id="country"
            value={filters.country || ""}
            onChange={(e) =>
              handleFilterChange("country", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* GDPR Consent Filter */}
        <div>
          <label
            htmlFor="gdpr_consent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Zgoda RODO
          </label>
          <select
            id="gdpr_consent"
            value={filters.gdpr_consent?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange(
                "gdpr_consent",
                value === "" ? undefined : value === "true",
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {gdprConsentOptions.map((option) => (
              <option
                key={option.value?.toString() || "all"}
                value={option.value?.toString() || ""}
              >
                {option.label}
              </option>
            ))}
          </select>
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

export default OwnerFilters;
