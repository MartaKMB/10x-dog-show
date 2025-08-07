import React, { useState } from "react";
import type { RegistrationResponse, ShowStatus, UserRole } from "../../types";
import DogCard from "./DogCard.tsx";

interface DogsListProps {
  registrations: RegistrationResponse[];
  showStatus: ShowStatus;
  canAddDogs: boolean;
  canEdit: boolean;
  canDelete: boolean;
  userRole?: UserRole;
  onAddDog: () => void;
  onEditDog: (registration: RegistrationResponse) => void;
  onDeleteDog: (registration: RegistrationResponse) => void;
}

const DogsList: React.FC<DogsListProps> = ({
  registrations,
  showStatus,
  canAddDogs,
  canEdit,
  canDelete,
  userRole = "club_board",
  onAddDog,
  onEditDog,
  onDeleteDog,
}) => {
  const [sortBy, setSortBy] = useState<"name" | "class">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const getClassLabel = (dogClass: string): string => {
    const classLabels: Record<string, string> = {
      baby: "Baby",
      puppy: "Szczenię",
      junior: "Junior",
      intermediate: "Młodzież",
      open: "Otwarta",
      working: "Pracująca",
      champion: "Champion",
      veteran: "Weteran",
    };
    return classLabels[dogClass] || dogClass;
  };

  const getClassOrder = (dogClass: string): number => {
    const classOrder: Record<string, number> = {
      baby: 1,
      puppy: 2,
      junior: 3,
      intermediate: 4,
      open: 5,
      working: 6,
      champion: 7,
      veteran: 8,
    };
    return classOrder[dogClass] || 999;
  };

  const getGroupedRegistrations = () => {
    const grouped: Record<string, Record<string, RegistrationResponse[]>> = {
      female: {},
      male: {},
    };

    registrations.forEach((registration) => {
      const gender = registration.dog.gender;
      const dogClass = registration.dog_class;

      if (!grouped[gender][dogClass]) {
        grouped[gender][dogClass] = [];
      }
      grouped[gender][dogClass].push(registration);
    });

    // Sort dogs within each class group
    Object.keys(grouped).forEach((gender) => {
      Object.keys(grouped[gender]).forEach((dogClass) => {
        grouped[gender][dogClass].sort((a, b) => {
          let aValue: string | number;
          let bValue: string | number;

          switch (sortBy) {
            case "name":
              aValue = a.dog.name.toLowerCase();
              bValue = b.dog.name.toLowerCase();
              break;
            case "class":
              aValue = a.dog_class;
              bValue = b.dog_class;
              break;
            default:
              aValue = a.dog.name.toLowerCase();
              bValue = b.dog.name.toLowerCase();
          }

          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      });
    });

    return grouped;
  };

  const handleSort = (field: "name" | "class") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: "name" | "class") => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const groupedRegistrations = getGroupedRegistrations();

  const getGenderLabel = (gender: string): string => {
    return gender === "female" ? "Suki" : "Samce";
  };

  const getGenderIcon = (gender: string): string => {
    return gender === "female" ? "♀️" : "♂️";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dodane psy</h2>
          <p className="text-gray-600 mt-1">
            {registrations.length}{" "}
            {registrations.length === 1
              ? "pies"
              : registrations.length < 5
                ? "psy"
                : "psów"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sortuj:</span>
            <button
              onClick={() => handleSort("name")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === "name"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Nazwa {getSortIcon("name")}
            </button>
          </div>

          {/* Add Dog Button */}
          {canAddDogs && (
            <button
              onClick={onAddDog}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Dodaj psa
            </button>
          )}
        </div>
      </div>

      {/* Dogs List */}
      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🐕</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak dodanych psów
          </h3>
          <p className="text-gray-600 mb-4">
            Nie ma jeszcze żadnych psów dodanych do tej wystawy.
          </p>
          {canAddDogs && (
            <button
              onClick={onAddDog}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Dodaj pierwszego psa
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Females Section */}
          {Object.keys(groupedRegistrations.female).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getGenderIcon("female")}</span>
                <h3 className="text-xl font-bold text-gray-900">
                  {getGenderLabel("female")}
                </h3>
              </div>

              <div className="space-y-4">
                {Object.keys(groupedRegistrations.female)
                  .sort((a, b) => getClassOrder(a) - getClassOrder(b))
                  .map((dogClass) => {
                    const dogs = groupedRegistrations.female[dogClass];
                    return (
                      <div
                        key={`female-${dogClass}`}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="bg-pink-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Klasa {getClassLabel(dogClass)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dogs.length}{" "}
                            {dogs.length === 1
                              ? "suka"
                              : dogs.length < 5
                                ? "suki"
                                : "suk"}
                          </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {dogs.map((registration) => (
                            <DogCard
                              key={registration.id}
                              dog={{
                                registration: registration,
                                canEdit,
                                canDelete,
                                isExpanded: false,
                                isProcessing: false,
                              }}
                              onAction={(action) => {
                                switch (action) {
                                  case "edit":
                                    onEditDog(registration);
                                    break;
                                  case "delete":
                                    onDeleteDog(registration);
                                    break;
                                  default:
                                    console.warn("Unknown action:", action);
                                }
                              }}
                              userRole={userRole}
                              showStatus={showStatus}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Males Section */}
          {Object.keys(groupedRegistrations.male).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getGenderIcon("male")}</span>
                <h3 className="text-xl font-bold text-gray-900">
                  {getGenderLabel("male")}
                </h3>
              </div>

              <div className="space-y-4">
                {Object.keys(groupedRegistrations.male)
                  .sort((a, b) => getClassOrder(a) - getClassOrder(b))
                  .map((dogClass) => {
                    const dogs = groupedRegistrations.male[dogClass];
                    return (
                      <div
                        key={`male-${dogClass}`}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Klasa {getClassLabel(dogClass)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dogs.length}{" "}
                            {dogs.length === 1
                              ? "pies"
                              : dogs.length < 5
                                ? "psy"
                                : "psów"}
                          </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {dogs.map((registration) => (
                            <DogCard
                              key={registration.id}
                              dog={{
                                registration: registration,
                                canEdit,
                                canDelete,
                                isExpanded: false,
                                isProcessing: false,
                              }}
                              onAction={(action) => {
                                switch (action) {
                                  case "edit":
                                    onEditDog(registration);
                                    break;
                                  case "delete":
                                    onDeleteDog(registration);
                                    break;
                                  default:
                                    console.warn("Unknown action:", action);
                                }
                              }}
                              userRole={userRole}
                              showStatus={showStatus}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DogsList;
