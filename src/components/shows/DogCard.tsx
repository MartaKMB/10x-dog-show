import React, { useState } from "react";
import type { DogCardViewModel, UserRole, ShowStatus } from "../../types";
import StatusBadge from "./StatusBadge";
import QuickActionMenu from "./QuickActionMenu";

interface DogCardProps {
  dog: DogCardViewModel;
  onAction: (action: string, dogId: string) => void;
  userRole: UserRole;
  showStatus: ShowStatus;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onAction, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(dog.isExpanded);
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);

  const getGenderIcon = (gender: string): string => {
    return gender === "male" ? "♂️" : "♀️";
  };

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      return `${ageInYears - 1} lat`;
    }

    if (ageInYears === 0) {
      const ageInMonths = Math.floor(
        (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );
      return `${ageInMonths} miesięcy`;
    }

    return `${ageInYears} lat`;
  };

  const handleAction = (action: string) => {
    if (action === "view") {
      // Toggle expanded view for details
      toggleExpanded();
    } else {
      onAction(action, dog.dog.id);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleOwnerInfo = () => {
    setShowOwnerInfo(!showOwnerInfo);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {dog.dog.name}
              </h3>
              <span className="text-lg">{getGenderIcon(dog.dog.gender)}</span>
              <StatusBadge
                status={dog.descriptionStatus}
                onClick={() => {
                  if (dog.descriptionStatus.status === "none") {
                    handleAction("create_description");
                  } else {
                    handleAction("view_description");
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p>
                  <strong>Rasa:</strong> {dog.dog.breed.name_pl}
                </p>
                <p>
                  <strong>Klasa:</strong>{" "}
                  {getClassLabel(dog.registration.dog_class)}
                </p>
              </div>
              <div>
                <p>
                  <strong>Wiek:</strong> {calculateAge(dog.dog.birth_date)}
                </p>
                <p>
                  <strong>Data urodzenia:</strong>{" "}
                  {formatDate(dog.dog.birth_date)}
                </p>
              </div>
            </div>

            {/* Owner Information */}
            {dog.dog.owners && dog.dog.owners.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={toggleOwnerInfo}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showOwnerInfo ? "Ukryj" : "Pokaż"} informacje o właścicielu
                </button>

                {showOwnerInfo && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    {dog.dog.owners.map((owner, index) => (
                      <div key={owner.id} className="text-sm">
                        <p>
                          <strong>
                            {owner.is_primary
                              ? "Główny właściciel:"
                              : "Współwłaściciel:"}
                          </strong>{" "}
                          {owner.first_name} {owner.last_name}
                        </p>
                        <p className="text-gray-600">{owner.email}</p>
                        {index < dog.dog.owners.length - 1 && (
                          <hr className="my-2 border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <QuickActionMenu
              actions={[
                {
                  id: "edit",
                  label: "Edytuj",
                  icon: "✏️",
                  action: "edit",
                  disabled: !dog.canEdit,
                  requiresPermission: ["department_representative", "admin"],
                },
                {
                  id: "delete",
                  label: "Usuń",
                  icon: "🗑️",
                  action: "delete",
                  disabled: !dog.canDelete,
                  requiresPermission: ["department_representative", "admin"],
                },
                {
                  id: "create_description",
                  label: "Utwórz opis",
                  icon: "📝",
                  action: "create_description",
                  disabled: !dog.canCreateDescription,
                  requiresPermission: [
                    "secretary",
                    "department_representative",
                    "admin",
                  ],
                },
              ]}
              userRole={userRole}
              canEdit={dog.canEdit}
              canDelete={dog.canDelete}
              onAction={handleAction}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Informacje dodatkowe
              </h4>
              <p>
                <strong>Numer mikrochipu:</strong> {dog.dog.microchip_number}
              </p>
              {dog.dog.kennel_club_number && (
                <p>
                  <strong>Numer ZKwP:</strong> {dog.dog.kennel_club_number}
                </p>
              )}
              {dog.dog.kennel_name && (
                <p>
                  <strong>Hodowla:</strong> {dog.dog.kennel_name}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rodowód</h4>
              {dog.dog.father_name && (
                <p>
                  <strong>Ojciec:</strong> {dog.dog.father_name}
                </p>
              )}
              {dog.dog.mother_name && (
                <p>
                  <strong>Matka:</strong> {dog.dog.mother_name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {dog.dog.id}</span>
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? "Ukryj szczegóły" : "Pokaż szczegóły"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DogCard;
