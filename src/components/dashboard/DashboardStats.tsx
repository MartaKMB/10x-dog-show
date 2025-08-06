import React from "react";

interface DashboardStatsProps {
  stats: {
    totalShows: number;
    activeShows: number;
    totalDogs: number;
    totalOwners: number;
    upcomingShows: number;
    completedShows: number;
  };
  isLoading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Wszystkie wystawy",
      value: stats.totalShows,
      icon: "📋",
      color: "bg-blue-500",
      description: "Łączna liczba wystaw",
    },
    {
      title: "Aktywne wystawy",
      value: stats.activeShows,
      icon: "🟢",
      color: "bg-green-500",
      description: "Wystawy w trakcie",
    },
    {
      title: "Zarejestrowane psy",
      value: stats.totalDogs,
      icon: "🐕",
      color: "bg-purple-500",
      description: "Łączna liczba psów",
    },
    {
      title: "Właściciele",
      value: stats.totalOwners,
      icon: "👥",
      color: "bg-orange-500",
      description: "Zarejestrowani właściciele",
    },
    {
      title: "Nadchodzące wystawy",
      value: stats.upcomingShows,
      icon: "📅",
      color: "bg-indigo-500",
      description: "Planowane wystawy",
    },
    {
      title: "Zakończone wystawy",
      value: stats.completedShows,
      icon: "✅",
      color: "bg-gray-500",
      description: "Ukończone wystawy",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
            <div
              className={`${card.color} text-white p-3 rounded-full text-2xl`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
