import React from "react";
import type { ShowDetailResponseDto, UserRole, ShowStatus } from "../../types";

interface ShowHeaderProps {
  show: ShowDetailResponseDto;
  userRole: UserRole;
  canEdit: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onDelete: () => void;
  onStatusUpdate: (status: ShowStatus) => void;
}

const ShowHeader: React.FC<ShowHeaderProps> = ({
  show,
  userRole,
  canEdit,
  canDelete,
  isDeleting,
  isUpdating,
  onDelete,
  onStatusUpdate,
}) => {
  const getStatusColor = (status: ShowStatus): string => {
    switch (status) {
      case "draft":
        return "bg-gray-500 text-white";
      case "open_for_registration":
        return "bg-green-500 text-white";
      case "registration_closed":
        return "bg-yellow-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-purple-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: ShowStatus): string => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "open_for_registration":
        return "Otwarta rejestracja";
      case "registration_closed":
        return "Rejestracja zamknięta";
      case "in_progress":
        return "W trakcie";
      case "completed":
        return "Zakończona";
      case "cancelled":
        return "Anulowana";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStatusChange = (newStatus: ShowStatus) => {
    if (
      confirm(
        `Czy na pewno chcesz zmienić status wystawy na "${getStatusText(newStatus)}"?`,
      )
    ) {
      onStatusUpdate(newStatus);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć tę wystawę? Ta operacja jest nieodwracalna.",
      )
    ) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Show Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{show.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(show.status)}`}
            >
              {getStatusText(show.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Data wystawy:</span>
              <br />
              {formatDate(show.show_date)}
            </div>
            <div>
              <span className="font-medium">Deadline rejestracji:</span>
              <br />
              {formatDate(show.registration_deadline)}
            </div>
            <div>
              <span className="font-medium">Oddział:</span>
              <br />
              {show.branch.name}, {show.branch.city}
            </div>
            <div>
              <span className="font-medium">Organizator:</span>
              <br />
              {show.organizer.first_name} {show.organizer.last_name}
            </div>
          </div>

          {show.description && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Opis:</span>
              <p className="text-gray-600 mt-1">{show.description}</p>
            </div>
          )}

          {show.entry_fee && (
            <div className="mt-2">
              <span className="font-medium text-gray-700">Opłata wpisowa:</span>
              <span className="text-gray-600 ml-2">{show.entry_fee} PLN</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {userRole === "department_representative" && (
          <div className="flex flex-col gap-2">
            {/* Temporarily disabled - edit show functionality
            {canEdit && (
              <button
                onClick={() =>
                  (window.location.href = `/shows/${show.id}/edit`)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isUpdating}
              >
                Edytuj wystawę
              </button>
            )}
            */}

            {/* Status Management */}
            {canEdit && show.status === "draft" && (
              <button
                onClick={() => handleStatusChange("open_for_registration")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? "Aktualizowanie..." : "Otwórz rejestrację"}
              </button>
            )}

            {canEdit && show.status === "open_for_registration" && (
              <button
                onClick={() => handleStatusChange("registration_closed")}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? "Aktualizowanie..." : "Zamknij rejestrację"}
              </button>
            )}

            {canEdit && show.status === "registration_closed" && (
              <button
                onClick={() => handleStatusChange("in_progress")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? "Aktualizowanie..." : "Rozpocznij wystawę"}
              </button>
            )}

            {canEdit && show.status === "in_progress" && (
              <button
                onClick={() => handleStatusChange("completed")}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? "Aktualizowanie..." : "Zakończ wystawę"}
              </button>
            )}

            {canEdit &&
              (show.status === "draft" ||
                show.status === "open_for_registration") && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Aktualizowanie..." : "Anuluj wystawę"}
                </button>
              )}

            {canDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? "Usuwanie..." : "Usuń wystawę"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowHeader;
