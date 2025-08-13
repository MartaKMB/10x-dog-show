import React from "react";

interface DashboardStatsProps {
  stats: {
    totalShows: number;
    completedShows: number;
    totalDogs: number;
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
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 animate-pulse border border-gray-200"
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
      color: "bg-amber-500",
      description: "Łączna liczba wystaw",
    },
    {
      title: "Uzupełnione wystawy",
      value: stats.completedShows,
      icon: "✅",
      color: "bg-amber-500",
      description: "Uzupełnione wystawy",
    },
    {
      title: "Dodane psy",
      value: stats.totalDogs,
      icon: "🐕",
      color: "bg-amber-500",
      description: "Łączna liczba psów w serwisie",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
            <div className="bg-gray-900 text-amber-400 p-3 rounded-full text-2xl shadow-lg">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
