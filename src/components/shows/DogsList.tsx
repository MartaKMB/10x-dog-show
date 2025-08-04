import React, { useState } from "react";
import type { RegistrationResponseDto, ShowStatus } from "../../types";
import DogCard from "./DogCard.tsx";

interface DogsListProps {
  registrations: RegistrationResponseDto[];
  showStatus: ShowStatus;
  canAddDogs: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onAddDog: () => void;
  onEditDog: (registration: RegistrationResponseDto) => void;
  onDeleteDog: (registration: RegistrationResponseDto) => void;
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
}) => {
  const [sortBy, setSortBy] = useState<"name" | "breed" | "class" | "payment">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const getSortedRegistrations = () => {
    return [...registrations].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.dog.name.toLowerCase();
          bValue = b.dog.name.toLowerCase();
          break;
        case "breed":
          aValue = a.dog.breed.name_pl.toLowerCase();
          bValue = b.dog.breed.name_pl.toLowerCase();
          break;
        case "class":
          aValue = a.dog_class;
          bValue = b.dog_class;
          break;
        case "payment":
          aValue = a.is_paid ? 1 : 0;
          bValue = b.is_paid ? 1 : 0;
          break;
        default:
          aValue = a.dog.name.toLowerCase();
          bValue = b.dog.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const sortedRegistrations = getSortedRegistrations();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Zarejestrowane psy
          </h2>
          <p className="text-gray-600 mt-1">
            {registrations.length}{" "}
            {registrations.length === 1
              ? "pies"
              : registrations.length < 5
                ? "psy"
                : "psów"}
          </p>
        </div>

        {canAddDogs && (
          <button
            onClick={onAddDog}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={
              showStatus === "in_progress" || showStatus === "completed"
            }
          >
            + Dodaj psa
          </button>
        )}
      </div>

      {/* Sort Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">
            Sortuj według:
          </span>

          <button
            onClick={() => handleSort("name")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === "name"
                ? "bg-blue-100 text-blue-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Nazwa {getSortIcon("name")}
          </button>

          <button
            onClick={() => handleSort("breed")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === "breed"
                ? "bg-blue-100 text-blue-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Rasa {getSortIcon("breed")}
          </button>

          <button
            onClick={() => handleSort("class")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === "class"
                ? "bg-blue-100 text-blue-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Klasa {getSortIcon("class")}
          </button>

          <button
            onClick={() => handleSort("payment")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === "payment"
                ? "bg-blue-100 text-blue-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Płatność {getSortIcon("payment")}
          </button>
        </div>
      </div>

      {/* Dogs Grid */}
      {sortedRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRegistrations.map((registration) => (
            <DogCard
              key={registration.id}
              dog={{
                dog: {
                  id: registration.dog.id,
                  name: registration.dog.name,
                  breed: {
                    id: "",
                    name_pl: registration.dog.breed.name_pl,
                    name_en: registration.dog.breed.name_en,
                    fci_group: registration.dog.breed.fci_group,
                  },
                  gender: registration.dog.gender,
                  birth_date: registration.dog.birth_date,
                  microchip_number: "",
                  kennel_club_number: null,
                  kennel_name: null,
                  father_name: null,
                  mother_name: null,
                  created_at: "",
                  updated_at: "",
                  deleted_at: null,
                  scheduled_for_deletion: false,
                  owners: [],
                },
                registration: registration,
                descriptionStatus: { status: "none" },
                canEdit,
                canDelete,
                canCreateDescription: true,
                isExpanded: false,
                isProcessing: false,
              }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onAction={(action, _dogId) => {
                if (action === "edit") onEditDog(registration);
                if (action === "delete") onDeleteDog(registration);
                if (action === "create_description") {
                  // Navigate to description creation page
                  window.location.href = `/shows/${registration.show_id}/dogs/${registration.dog.id}/description/new`;
                }
              }}
              userRole="secretary"
              showStatus={showStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🐕</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Brak zarejestrowanych psów
          </h3>
          <p className="text-gray-500 mb-6">
            {canAddDogs
              ? "Dodaj pierwszego psa do tej wystawy."
              : "Nie ma jeszcze żadnych rejestracji na tę wystawę."}
          </p>
          {canAddDogs && (
            <button
              onClick={onAddDog}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={
                showStatus === "in_progress" || showStatus === "completed"
              }
            >
              Dodaj pierwszego psa
            </button>
          )}
        </div>
      )}

      {/* Status Warning */}
      {(showStatus === "in_progress" || showStatus === "completed") &&
        canAddDogs && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  {showStatus === "in_progress"
                    ? "Wystawa w trakcie"
                    : "Wystawa zakończona"}
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {showStatus === "in_progress"
                    ? "Nie można już dodawać nowych psów do wystawy w trakcie."
                    : "Nie można dodawać psów do zakończonej wystawy."}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DogsList;
