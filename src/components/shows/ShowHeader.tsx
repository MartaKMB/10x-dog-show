import React from "react";
import type { ShowResponse, UserRole, ShowStatus } from "../../types";

interface ShowHeaderProps {
  show: ShowResponse;
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
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: ShowStatus): string => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "completed":
        return "Opisana";
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Data wystawy:</span>{" "}
              {formatDate(show.show_date)}
            </div>
            <div>
              <span className="font-medium">Lokalizacja:</span> {show.location}
            </div>
            <div>
              <span className="font-medium">Sędzia:</span> {show.judge_name}
            </div>
            <div>
              <span className="font-medium">Dodane psy:</span>{" "}
              {show.registered_dogs}
            </div>
          </div>

          {show.description && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Opis:</span> {show.description}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Status Change */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-select"
              className="text-sm font-medium text-gray-700"
            >
              Status:
            </label>
            <select
              id="status-select"
              value={show.status}
              onChange={(e) => handleStatusChange(e.target.value as ShowStatus)}
              disabled={isUpdating}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Szkic</option>
              <option value="completed">Opisana</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() =>
                  (window.location.href = `/shows/${show.id}/edit`)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edytuj
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowHeader;
