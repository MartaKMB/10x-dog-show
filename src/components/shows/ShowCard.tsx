import React from "react";
import type { ShowResponseDto } from "../../types";

interface ShowCardProps {
  show: ShowResponseDto;
}

const ShowCard: React.FC<ShowCardProps> = ({ show }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "open_for_registration":
        return "bg-green-100 text-green-800";
      case "registration_closed":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "open_for_registration":
        return "Otwarta rejestracja";
      case "registration_closed":
        return "Zamknięta rejestracja";
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

  const getShowTypeText = (showType: string) => {
    switch (showType) {
      case "national":
        return "Krajowa";
      case "international":
        return "Międzynarodowa";
      default:
        return showType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCardClick = () => {
    window.location.href = `/shows/${show.id}`;
  };
  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {show.name}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            show.status,
          )}`}
        >
          {getStatusText(show.status)}
        </span>
      </div>

      {/* Show Type */}
      <div className="mb-3">
        <span className="text-sm text-gray-600">
          Typ: {getShowTypeText(show.show_type)}
        </span>
      </div>

      {/* Date */}
      <div className="mb-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Data wystawy:</span>{" "}
          {formatDate(show.show_date)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Termin rejestracji:</span>{" "}
          {formatDate(show.registration_deadline)}
        </div>
      </div>

      {/* Branch */}
      {show.branch && (
        <div className="mb-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Oddział:</span> {show.branch.name},{" "}
            {show.branch.city}
          </div>
        </div>
      )}

      {/* Organizer */}
      {show.organizer && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Organizator:</span>{" "}
            {show.organizer.first_name} {show.organizer.last_name}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {show.max_participants && (
            <span>Maks. uczestników: {show.max_participants}</span>
          )}
        </div>
        <div>{show.entry_fee && <span>Opłata: {show.entry_fee} PLN</span>}</div>
      </div>

      {/* Language */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 uppercase">
          Język: {show.language === "pl" ? "Polski" : "English"}
        </span>
      </div>
    </div>
  );
};

export default ShowCard;
