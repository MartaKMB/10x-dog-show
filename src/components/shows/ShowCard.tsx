import React from "react";
import type { ShowResponse } from "../../types";

interface ShowCardProps {
  show: ShowResponse;
}

const ShowCard: React.FC<ShowCardProps> = ({ show }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "completed":
        return "Opisana";
      default:
        return status;
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

      {/* Date */}
      <div className="mb-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Data wystawy:</span>{" "}
          {formatDate(show.show_date)}
        </div>
      </div>

      {/* Location and Judge */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Lokalizacja:</span> {show.location}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Sędzia:</span> {show.judge_name}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          <span>Dodane psy: {show.registered_dogs}</span>
        </div>
      </div>

      {/* Description */}
      {show.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {show.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowCard;
