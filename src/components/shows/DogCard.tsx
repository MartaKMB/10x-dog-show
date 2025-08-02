import React, { useState } from "react";
import type { RegistrationResponseDto, ShowStatus } from "../../types";

interface DogCardProps {
  registration: RegistrationResponseDto;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  showStatus: ShowStatus;
}

const DogCard: React.FC<DogCardProps> = ({
  registration,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  showStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getGenderIcon = (gender: string): string => {
    return gender === "male" ? "♂️" : "♀️";
  };

  const getPaymentStatusColor = (isPaid: boolean): string => {
    return isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getPaymentStatusText = (isPaid: boolean): string => {
    return isPaid ? "Opłacone" : "Nieopłacone";
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

  const canEditRegistration =
    canEdit &&
    (showStatus === "draft" || showStatus === "open_for_registration");
  const canDeleteRegistration =
    canDelete &&
    (showStatus === "draft" || showStatus === "open_for_registration");

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {registration.dog.name}
              </h3>
              <span className="text-lg">
                {getGenderIcon(registration.dog.gender)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {registration.dog.breed.name_pl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(registration.is_paid)}`}
            >
              {getPaymentStatusText(registration.is_paid)}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Klasa:</span>
            <p className="text-gray-900">
              {getClassLabel(registration.dog_class)}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Wiek:</span>
            <p className="text-gray-900">
              {calculateAge(registration.dog.birth_date)}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Data urodzenia:</span>
            <p className="text-gray-900">
              {formatDate(registration.dog.birth_date)}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Nr katalogowy:</span>
            <p className="text-gray-900">
              {registration.catalog_number || "Nie przypisano"}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Rasa (EN):</span>
                <p className="text-gray-900">
                  {registration.dog.breed.name_en}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Grupa FCI:</span>
                <p className="text-gray-900">
                  {registration.dog.breed.fci_group}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Data rejestracji:
                </span>
                <p className="text-gray-900">
                  {formatDate(registration.registered_at)}
                </p>
              </div>
              {registration.registration_fee && (
                <div>
                  <span className="font-medium text-gray-700">
                    Opłata wpisowa:
                  </span>
                  <p className="text-gray-900">
                    {registration.registration_fee} PLN
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {(canEditRegistration || canDeleteRegistration) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            {canEditRegistration && (
              <button
                onClick={onEdit}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Edytuj
              </button>
            )}
            {canDeleteRegistration && (
              <button
                onClick={onDelete}
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Usuń
              </button>
            )}
          </div>
        )}

        {/* Status Warning */}
        {!canEditRegistration &&
          (showStatus === "in_progress" || showStatus === "completed") && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                {showStatus === "in_progress"
                  ? "Wystawa w trakcie - edycja niedostępna"
                  : "Wystawa zakończona - edycja niedostępna"}
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default DogCard;
