import React, { useState, useEffect } from "react";

interface FilterState {
  dogClass?: string;
  isPaid?: boolean;
  search?: string;
  gender?: string;
}

interface RegistrationFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

const RegistrationFilters: React.FC<RegistrationFiltersProps> = ({
  onFiltersChange,
  currentFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean | undefined,
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, search: value }));

    // Debounce search input
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onFiltersChange({ ...localFilters, search: value });
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const dogClasses = [
    { value: "baby", label: "Baby" },
    { value: "puppy", label: "Szczenię" },
    { value: "junior", label: "Junior" },
    { value: "intermediate", label: "Młodzież" },
    { value: "open", label: "Otwarta" },
    { value: "working", label: "Pracująca" },
    { value: "champion", label: "Champion" },
    { value: "veteran", label: "Weteran" },
  ];

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== undefined && value !== "" && value !== false,
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Filtry rejestracji
        </h2>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Wyszukaj
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nazwa psa, rasa..."
            value={localFilters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dog Class */}
        <div>
          <label
            htmlFor="dogClass"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Klasa psa
          </label>
          <select
            id="dogClass"
            value={localFilters.dogClass || ""}
            onChange={(e) =>
              handleFilterChange("dogClass", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Wszystkie klasy</option>
            {dogClasses.map((dogClass) => (
              <option key={dogClass.value} value={dogClass.value}>
                {dogClass.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Płeć
          </label>
          <select
            id="gender"
            value={localFilters.gender || ""}
            onChange={(e) =>
              handleFilterChange("gender", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Wszystkie</option>
            <option value="male">Samce</option>
            <option value="female">Suki</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label
            htmlFor="paymentStatus"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status płatności
          </label>
          <select
            id="paymentStatus"
            value={
              localFilters.isPaid === undefined
                ? ""
                : localFilters.isPaid.toString()
            }
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange(
                "isPaid",
                value === "" ? undefined : value === "true",
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Wszystkie</option>
            <option value="true">Opłacone</option>
            <option value="false">Nieopłacone</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {localFilters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Wyszukiwanie: {localFilters.search}
                <button
                  onClick={() => handleFilterChange("search", undefined)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.dogClass && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Klasa:{" "}
                {
                  dogClasses.find((c) => c.value === localFilters.dogClass)
                    ?.label
                }
                <button
                  onClick={() => handleFilterChange("dogClass", undefined)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.gender && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Płeć: {localFilters.gender === "male" ? "Samce" : "Suki"}
                <button
                  onClick={() => handleFilterChange("gender", undefined)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.isPaid !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                Płatność: {localFilters.isPaid ? "Opłacone" : "Nieopłacone"}
                <button
                  onClick={() => handleFilterChange("isPaid", undefined)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationFilters;
