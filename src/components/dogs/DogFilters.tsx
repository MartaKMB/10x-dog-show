import React, { useEffect, useMemo, useState } from "react";
import type { DogGender } from "../../types";

export type DogFiltersState = {
  gender?: DogGender;
  coat?: "czarny" | "czarny_podpalany" | "blond";
  kennel_name?: string;
  owner_id?: string;
};

type DogFiltersProps = {
  filters: DogFiltersState;
  searchValue: string;
  onFiltersChange: (filters: Partial<DogFiltersState>) => void;
  onSearch: (value: string) => void;
  onClearFilters: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
};

const DogFilters: React.FC<DogFiltersProps> = ({
  filters,
  searchValue,
  onFiltersChange,
  onSearch,
  onClearFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue || "");
  const [errors, setErrors] = useState<{
    search?: string;
    coat?: string;
  }>({});

  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    // validate
    if (value.length > 0 && (value.length < 2 || value.length > 100)) {
      setErrors((prev) => ({ ...prev, search: "Wpisz od 2 do 100 znaków" }));
    } else {
      setErrors((prev) => ({ ...prev, search: undefined }));
      debouncedSearch(value);
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DogGender | "";
    onFiltersChange({ gender: value === "" ? undefined : value });
  };

  const handleCoatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as
      | "czarny"
      | "czarny_podpalany"
      | "blond"
      | "";
    onFiltersChange({ coat: value === "" ? undefined : value });
  };

  const handleKennelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ kennel_name: e.target.value || undefined });
  };

  const handleClear = () => {
    setLocalSearch("");
    setErrors({});
    onClearFilters();
  };

  const hasErrors = Boolean(errors.search || errors.coat);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Szukaj
          </label>
          <input
            id="search"
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Imię psa lub nazwa hodowli"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {errors.search && (
            <p className="mt-1 text-xs text-red-600">{errors.search}</p>
          )}
        </div>
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
            onChange={handleGenderChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Wszystkie</option>
            <option value="male">samiec</option>
            <option value="female">suka</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="coat"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Maść
          </label>
          <select
            id="coat"
            value={filters.coat || ""}
            onChange={handleCoatChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Wszystkie</option>
            <option value="czarny">czarny</option>
            <option value="czarny_podpalany">czarny_podpalany</option>
            <option value="blond">blond</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="kennel"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hodowla
          </label>
          <input
            id="kennel"
            type="text"
            value={filters.kennel_name || ""}
            onChange={handleKennelChange}
            placeholder="Nazwa hodowli"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {hasErrors && "Popraw błędy w filtrach, aby zastosować wyszukiwanie."}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          Wyczyść filtry
        </button>
      </div>
    </div>
  );
};

export default DogFilters;
