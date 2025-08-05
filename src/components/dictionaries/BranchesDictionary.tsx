import React, { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  region: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  is_active: boolean;
}

interface BranchesResponse {
  data: Branch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BranchesDictionaryProps {}

const BranchesDictionary: React.FC<BranchesDictionaryProps> = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    filterBranches();
  }, [branches, searchTerm]);

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches?limit=100");
      if (response.ok) {
        const result: BranchesResponse = await response.json();
        setBranches(result.data || []);
      } else {
        console.error("Failed to fetch branches");
        setBranches([]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBranches = () => {
    let filtered = branches;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (branch) =>
          branch.name.toLowerCase().includes(searchLower) ||
          branch.region.toLowerCase().includes(searchLower) ||
          (branch.city && branch.city.toLowerCase().includes(searchLower)) ||
          (branch.address &&
            branch.address.toLowerCase().includes(searchLower)),
      );
    }

    setFilteredBranches(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Szukaj oddziału..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Znaleziono {filteredBranches.length} z {branches.length} oddziałów
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {branch.name}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{branch.region}</span>
              </div>

              {branch.city && (
                <div className="text-gray-500">
                  <span className="font-medium">Miasto:</span> {branch.city}
                </div>
              )}

              {branch.address && (
                <div className="text-gray-500">
                  <span className="font-medium">Adres:</span> {branch.address}
                </div>
              )}

              {branch.postal_code && (
                <div className="text-gray-500">
                  <span className="font-medium">Kod pocztowy:</span>{" "}
                  {branch.postal_code}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nie znaleziono oddziałów spełniających kryteria wyszukiwania.
        </div>
      )}
    </div>
  );
};

export default BranchesDictionary;
