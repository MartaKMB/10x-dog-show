import React from "react";
import { useNextShow } from "../../hooks/useNextShow";

interface NextShowCardProps {
  userRole: string;
}

const NextShowCard: React.FC<NextShowCardProps> = ({ userRole }) => {
  const { nextShow, isLoading, error } = useNextShow(userRole);

  // Explicitly check if user is a secretary - if not, don't render anything
  if (userRole !== "secretary") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Błąd ładowania
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!nextShow) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak nadchodzących wystaw
          </h3>
          <p className="text-gray-600">
            Nie masz przypisanych żadnych nadchodzących wystaw.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Szkic";
      case "completed":
        return "Opisana";
      default:
        return status;
    }
  };

  const getShowTypeLabel = (showType: string): string => {
    switch (showType) {
      case "national":
        return "Krajowa";
      case "international":
        return "Międzynarodowa";
      default:
        return showType;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Wystawa do opisów
          </h3>
          <p className="text-sm text-gray-600">
            Najbliższa lub aktualna wystawa podczas której dodajesz opisy
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            nextShow.status,
          )}`}
        >
          {getStatusLabel(nextShow.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {nextShow.name}
          </h4>
          <p className="text-gray-600 text-sm">
            {getShowTypeLabel(nextShow.show_type)} •{" "}
            {formatDate(nextShow.show_date)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Data wystawy:</span>
            <p className="text-gray-900">{formatDate(nextShow.show_date)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">
              Deadline rejestracji:
            </span>
            <p className="text-gray-900">
              {formatDate(nextShow.registration_deadline)}
            </p>
          </div>
        </div>

        {nextShow.description && (
          <div>
            <span className="font-medium text-gray-700 text-sm">Opis:</span>
            <p className="text-gray-600 text-sm mt-1">{nextShow.description}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <a
            href={`/shows/${nextShow.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zobacz szczegóły
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NextShowCard;
