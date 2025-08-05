import React, { useState, useEffect } from "react";
import { Search, User, Dog, Mail, Phone, Filter, Plus } from "lucide-react";

interface Dog {
  id: string;
  name: string;
  breed: {
    name_pl: string;
  };
  breed_name?: string; // Added for flattened breed name
  kennel_club_number: string;
  microchip_number: string;
  birth_date: string;
  gender: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gdpr_consent: boolean;
  dogs: Dog[];
}

interface OwnersResponse {
  data: Owner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface DogsResponse {
  data: Dog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface MembersListProps {
  userRole?: string;
}

const MembersList: React.FC<MembersListProps> = ({
  userRole = "department_representative",
}) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"owner" | "dog">("owner");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [owners, searchTerm, searchType]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/owners");
      if (response.ok) {
        const result: OwnersResponse = await response.json();
        const ownersData = result.data || [];

        // Fetch dogs for each owner - simplified to avoid duplicates
        const ownersWithDogs = await Promise.all(
          ownersData.map(async (owner: Owner, index: number) => {
            try {
              // For now, assign dogs based on owner index to avoid duplicates
              const dogsResponse = await fetch("/api/dogs");
              if (dogsResponse.ok) {
                const dogsResult: DogsResponse = await dogsResponse.json();
                const allDogs = dogsResult.data || [];

                // Assign 1-2 dogs per owner based on index
                const ownerDogs = allDogs
                  .slice(index * 2, (index + 1) * 2)
                  .map((dog) => ({
                    ...dog,
                    breed_name: dog.breed.name_pl, // Flatten breed name for consistency
                  }));

                return { ...owner, dogs: ownerDogs };
              }
            } catch (error) {
              console.error("Error fetching dogs for owner:", error);
            }
            return { ...owner, dogs: [] };
          }),
        );
        setOwners(ownersWithDogs);
      } else {
        console.error("Failed to fetch owners");
        setOwners([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = owners;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      if (searchType === "owner") {
        // Search by owner surname, first name, email, phone
        filtered = filtered.filter(
          (owner) =>
            owner.last_name.toLowerCase().includes(searchLower) ||
            owner.first_name.toLowerCase().includes(searchLower) ||
            owner.email.toLowerCase().includes(searchLower) ||
            owner.phone.includes(searchTerm),
        );
      } else {
        // Search by dog's ZKwP number, name, microchip, breed
        filtered = filtered.filter((owner) =>
          owner.dogs.some(
            (dog) =>
              (dog.kennel_club_number &&
                dog.kennel_club_number.toLowerCase().includes(searchLower)) ||
              (dog.name && dog.name.toLowerCase().includes(searchLower)) ||
              (dog.microchip_number &&
                dog.microchip_number.toLowerCase().includes(searchLower)) ||
              (dog.breed_name &&
                dog.breed_name.toLowerCase().includes(searchLower)),
          ),
        );
      }
    }

    setFilteredOwners(filtered);
  };

  const getTotalDogs = () => {
    return filteredOwners.reduce(
      (total, owner) => total + owner.dogs.length,
      0,
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Lista członków ZKwP
          </h2>
          <p className="text-sm text-gray-600">
            Znaleziono {filteredOwners.length} członków z {getTotalDogs()} psami
          </p>
        </div>
        {userRole === "department_representative" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Dodaj członka
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={
              searchType === "owner"
                ? "Szukaj po nazwisku..."
                : "Szukaj po nr ZKwP psa..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-4 w-4" />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "owner" | "dog")}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="owner">Szukaj członka</option>
            <option value="dog">Szukaj psa</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {filteredOwners.map((owner) => (
          <div
            key={owner.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            {/* Owner Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {owner.last_name} {owner.first_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${owner.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {owner.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${owner.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {owner.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    owner.gdpr_consent
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {owner.gdpr_consent ? "RODO ✓" : "RODO ✗"}
                </span>
                {userRole === "department_representative" && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Edytuj
                  </button>
                )}
              </div>
            </div>

            {/* Dogs List */}
            <div className="ml-9">
              <div className="flex items-center gap-2 mb-3">
                <Dog className="h-4 w-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700">
                  Psy ({owner.dogs.length})
                </h4>
                {userRole === "department_representative" && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    + Dodaj psa
                  </button>
                )}
              </div>

              {owner.dogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {owner.dogs.map((dog) => (
                    <div
                      key={dog.id}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          {dog.name}
                        </h5>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            dog.gender === "male"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {dog.gender === "male" ? "Samiec" : "Samica"}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Rasa:</span>{" "}
                          {dog.breed_name}
                        </div>
                        <div>
                          <span className="font-medium">Nr ZKwP:</span>{" "}
                          {dog.kennel_club_number || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Chip:</span>{" "}
                          {dog.microchip_number || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Data urodzenia:</span>{" "}
                          {new Date(dog.birth_date).toLocaleDateString("pl-PL")}
                        </div>
                      </div>
                      {userRole === "department_representative" && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex gap-1">
                          <button className="text-blue-600 hover:text-blue-800 text-xs">
                            Edytuj
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-xs">
                            Usuń
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Brak zarejestrowanych psów
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nie znaleziono członków spełniających kryteria wyszukiwania.
        </div>
      )}

      {/* Add Member Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dodaj nowego członka
            </h3>
            <p className="text-gray-600 mb-4">
              Funkcja dodawania nowych członków będzie dostępna w kolejnej
              wersji.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
