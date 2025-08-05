import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter } from "lucide-react";

interface Breed {
  id: string;
  name_pl: string;
  name_en: string;
  fci_group: string;
  fci_number: number;
  is_active: boolean;
}

interface BreedsResponse {
  data: Breed[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BreedsDictionaryProps {}

const BreedsDictionary: React.FC<BreedsDictionaryProps> = () => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const fciGroups = [
    "G1",
    "G2",
    "G3",
    "G4",
    "G5",
    "G6",
    "G7",
    "G8",
    "G9",
    "G10",
  ];

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    filterBreeds();
  }, [breeds, searchTerm, selectedGroup]);

  const fetchBreeds = async () => {
    try {
      const response = await fetch("/api/breeds?limit=200");
      if (response.ok) {
        const result: BreedsResponse = await response.json();
        setBreeds(result.data || []);
      } else {
        console.error("Failed to fetch breeds");
        setBreeds([]);
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
      setBreeds([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBreeds = useCallback(() => {
    let filtered = breeds;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (breed) =>
          breed.name_pl.toLowerCase().includes(searchLower) ||
          breed.name_en.toLowerCase().includes(searchLower) ||
          breed.fci_number?.toString().includes(searchLower),
      );
    }

    // Filter by FCI group
    if (selectedGroup !== "all") {
      filtered = filtered.filter((breed) => breed.fci_group === selectedGroup);
    }

    setFilteredBreeds(filtered);
  }, [breeds, searchTerm, selectedGroup]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Szukaj rasy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-4 w-4" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Wszystkie grupy FCI</option>
            {fciGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Znaleziono {filteredBreeds.length} z {breeds.length} ras
      </div>

      {/* Breeds Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazwa (PL)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazwa (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupa FCI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nr FCI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBreeds.map((breed) => (
                <tr key={breed.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {breed.name_pl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {breed.name_en}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {breed.fci_group}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {breed.fci_number || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBreeds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nie znaleziono ras spełniających kryteria wyszukiwania.
        </div>
      )}
    </div>
  );
};

export default BreedsDictionary;
