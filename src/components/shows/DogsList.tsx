import React, { useState } from "react";
import type { RegistrationResponse, ShowStatus } from "../../types";
import DogCard from "./DogCard.tsx";

interface DogsListProps {
  registrations: RegistrationResponse[];
  showStatus: ShowStatus;
  canAddDogs: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onAddDog: () => void;
  onEditDog: (registration: RegistrationResponse) => void;
  onDeleteDog: (registration: RegistrationResponse) => void;
  isAuthenticated: boolean;
}

const DogsList: React.FC<DogsListProps> = ({
  registrations,
  showStatus,
  canAddDogs,
  canEdit,
  canDelete,
  onAddDog,
  onEditDog,
  onDeleteDog,
  isAuthenticated,
}) => {
  const [sortBy] = useState<"name" | "class">("name");
  const [sortOrder] = useState<"asc" | "desc">("asc");
  const [genderOrder, setGenderOrder] = useState<"female_first" | "male_first">(
    "female_first",
  );

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

  // previous sort controls removed from UI; keep simple alphabetical inside class

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
          {/* Gender order toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Kolejność płci:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setGenderOrder("female_first")}
                className={`px-3 py-1 text-sm border rounded-l-md ${
                  genderOrder === "female_first"
                    ? "bg-amber-500 text-gray-900 border-amber-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Najpierw suki
              </button>
              <button
                type="button"
                onClick={() => setGenderOrder("male_first")}
                className={`px-3 py-1 text-sm border rounded-r-md -ml-px ${
                  genderOrder === "male_first"
                    ? "bg-amber-500 text-gray-900 border-amber-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Najpierw samce
              </button>
            </div>
          </div>

          {/* Add Dog Button */}
          {canAddDogs && (
            <button
              onClick={onAddDog}
              className="px-4 py-2 bg-amber-500 text-gray-900 rounded-md hover:bg-amber-400 transition-colors text-sm font-medium"
            >
              + Dodaj psa do wystawy
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
              className="px-4 py-2 bg-amber-500 text-gray-900 rounded-md hover:bg-amber-400 transition-colors"
            >
              Dodaj pierwszego psa do wystawy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {(["female", "male"] as const)
            .slice()
            .sort((a) =>
              genderOrder === "female_first"
                ? a === "female"
                  ? -1
                  : 1
                : a === "male"
                  ? -1
                  : 1,
            )
            .map((genderKey: "female" | "male") => {
              const classKeys = Object.keys(
                groupedRegistrations[genderKey] || {},
              );
              if (classKeys.length === 0) return null;
              return (
                <div key={genderKey} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getGenderIcon(genderKey)}</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {getGenderLabel(genderKey)}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {classKeys
                      .sort((a, b) => getClassOrder(a) - getClassOrder(b))
                      .map((dogClass) => {
                        const dogs = groupedRegistrations[genderKey][dogClass];
                        const headerBg =
                          genderKey === "female" ? "bg-pink-50" : "bg-blue-50";
                        return (
                          <div
                            key={`${genderKey}-${dogClass}`}
                            className="border border-gray-200 rounded-lg"
                          >
                            <div
                              className={`${headerBg} px-4 py-3 border-b border-gray-200`}
                            >
                              <h4 className="text-lg font-semibold text-gray-900">
                                Klasa {getClassLabel(dogClass)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {dogs.length}{" "}
                                {genderKey === "female"
                                  ? dogs.length === 1
                                    ? "suka"
                                    : dogs.length < 5
                                      ? "suki"
                                      : "suk"
                                  : dogs.length === 1
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
                                  showStatus={showStatus}
                                  isAuthenticated={isAuthenticated}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default DogsList;
