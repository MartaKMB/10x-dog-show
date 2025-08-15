import React from "react";
import type { ShowResponse } from "../../types";

interface RecentShowsProps {
  shows: ShowResponse[];
  isLoading?: boolean;
  onShowClick?: (showId: string) => void;
}

const RecentShows: React.FC<RecentShowsProps> = ({
  shows,
  isLoading = false,
  onShowClick,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "completed":
        return "Uzupełniona";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div
        className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
        data-testid="recent-shows-loading"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ostatnie wystawy
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show only draft and completed statuses
  const filteredShows = shows.filter(
    (s) => s.status === "draft" || s.status === "completed",
  );

  if (filteredShows.length === 0) {
    return (
      <div
        className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
        data-testid="recent-shows-empty"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ostatnie wystawy
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak wystaw
          </h3>
          <p className="text-gray-600">
            Nie ma jeszcze żadnych wystaw w systemie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
      data-testid="recent-shows-container"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Rejestr wystaw klubowych
        </h2>
        <a
          href="/shows"
          className="text-sm text-amber-500 hover:text-amber-600 font-medium transition-colors"
          data-testid="recent-shows-view-all-link"
        >
          Zobacz wszystkie →
        </a>
      </div>

      <div className="space-y-4">
        {filteredShows.slice(0, 5).map((show) => (
          <button
            key={show.id}
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            onClick={() => onShowClick?.(show.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onShowClick?.(show.id);
              }
            }}
            data-testid={`recent-show-card-${show.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className="font-medium text-gray-900 mb-1"
                  data-testid={`recent-show-name-${show.id}`}
                >
                  {show.name}
                </h3>
                <p
                  className="text-sm text-gray-600 mb-2"
                  data-testid={`recent-show-details-${show.id}`}
                >
                  {formatDate(show.show_date)} • {show.location}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span data-testid={`recent-show-judge-${show.id}`}>
                    Sędzia: {show.judge_name}
                  </span>
                  <span data-testid={`recent-show-dogs-${show.id}`}>
                    Psy: {show.registered_dogs}
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  show.status,
                )}`}
                data-testid={`recent-show-status-${show.id}`}
              >
                {getStatusLabel(show.status)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentShows;
