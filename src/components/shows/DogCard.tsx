import React, { useState } from "react";
import type { DogCardViewModel, UserRole, ShowStatus } from "../../types";
import QuickActionMenu from "./QuickActionMenu";

interface DogCardProps {
  dog: DogCardViewModel;
  onAction: (action: string) => void;
  userRole: UserRole;
  showStatus: ShowStatus;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onAction, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(dog.isExpanded);

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

  const getGradeLabel = (grade: string | null): string => {
    if (!grade) return "Brak oceny";

    const gradeLabels: Record<string, string> = {
      excellent: "Doskonały",
      very_good: "Bardzo dobry",
      good: "Dobry",
      sufficient: "Dostateczny",
      insufficient: "Niedostateczny",
      disqualified: "Zdyskwalifikowany",
    };
    return gradeLabels[grade] || grade;
  };

  const getTitleLabel = (title: string | null): string => {
    if (!title) return "Brak tytułu";

    const titleLabels: Record<string, string> = {
      champion: "Champion",
      junior_champion: "Junior Champion",
      veteran_champion: "Veteran Champion",
      best_in_show: "Best in Show",
      best_of_breed: "Best of Breed",
      best_of_opposite_sex: "Best of Opposite Sex",
    };
    return titleLabels[title] || title;
  };

  const getPlacementLabel = (placement: number | null): string => {
    if (!placement) return "Brak lokaty";

    const placementLabels: Record<number, string> = {
      1: "1. miejsce",
      2: "2. miejsce",
      3: "3. miejsce",
      4: "4. miejsce",
    };
    return placementLabels[placement] || `${placement}. miejsce`;
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
      onAction(action);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Mock evaluation data - w przyszłości będzie pobierane z API
  const evaluation = {
    grade: "excellent",
    title: "champion",
    placement: 1,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {dog.registration.dog.name}
              </h3>
              <span className="text-lg">
                {getGenderIcon(dog.registration.dog.gender)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p>
                  <strong>Klasa:</strong>{" "}
                  {getClassLabel(dog.registration.dog_class)}
                </p>
              </div>
              <div>
                <p>
                  <strong>Wiek:</strong>{" "}
                  {calculateAge(dog.registration.dog.birth_date)}
                </p>
                <p>
                  <strong>Data urodzenia:</strong>{" "}
                  {formatDate(dog.registration.dog.birth_date)}
                </p>
              </div>
            </div>

            {/* Owner Information - Always Visible */}
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Właściciel</h4>
              {dog.registration.dog.owners &&
              dog.registration.dog.owners.length > 0 ? (
                dog.registration.dog.owners.map((owner, index) => (
                  <div key={owner.id} className="text-sm">
                    <p className="text-gray-700">
                      <strong>
                        {owner.is_primary
                          ? "Główny właściciel:"
                          : "Współwłaściciel:"}
                      </strong>{" "}
                      {owner.name || "Brak danych"}
                    </p>
                    {owner.email && (
                      <p className="text-gray-600">{owner.email}</p>
                    )}
                    {index < dog.registration.dog.owners.length - 1 && (
                      <hr className="my-2 border-gray-200" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">
                  Brak danych o właścicielu
                </p>
              )}
            </div>

            {/* Evaluation Results */}
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Wyniki wystawy</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Ocena:</span>{" "}
                  <span className="text-blue-700">
                    {getGradeLabel(evaluation.grade)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Tytuł:</span>{" "}
                  <span className="text-blue-700">
                    {getTitleLabel(evaluation.title)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Lokata:</span>{" "}
                  <span className="text-blue-700">
                    {getPlacementLabel(evaluation.placement)}
                  </span>
                </div>
              </div>
            </div>
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
                  requiresPermission: ["club_board"],
                },
                {
                  id: "delete",
                  label: "Usuń",
                  icon: "🗑️",
                  action: "delete",
                  disabled: !dog.canDelete,
                  requiresPermission: ["club_board"],
                },
              ]}
              onAction={handleAction}
              userRole={userRole}
              canEdit={dog.canEdit}
              canDelete={dog.canDelete}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Szczegóły psa</h4>
              <div className="space-y-1 text-gray-600">
                <p>
                  <strong>Numer chipa:</strong>{" "}
                  {dog.registration.dog.microchip_number || "Brak"}
                </p>
                {dog.registration.dog.kennel_name && (
                  <p>
                    <strong>Hodowla:</strong> {dog.registration.dog.kennel_name}
                  </p>
                )}
                {dog.registration.dog.father_name && (
                  <p>
                    <strong>Ojciec:</strong> {dog.registration.dog.father_name}
                  </p>
                )}
                {dog.registration.dog.mother_name && (
                  <p>
                    <strong>Matka:</strong> {dog.registration.dog.mother_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Szczegóły rejestracji
              </h4>
              <div className="space-y-1 text-gray-600">
                <p>
                  <strong>Data rejestracji:</strong>{" "}
                  {formatDate(dog.registration.registered_at)}
                </p>
                {dog.registration.catalog_number && (
                  <p>
                    <strong>Numer katalogowy:</strong>{" "}
                    {dog.registration.catalog_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogCard;
