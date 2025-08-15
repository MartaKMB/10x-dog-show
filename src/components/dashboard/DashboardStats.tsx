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
      title: "Wystawy klubowe w bazie",
      value: stats.totalShows,
      icon: "📋",
      color: "bg-amber-500",
    },
    {
      title: "Wystawy z uzupełnionymi danymi",
      value: stats.completedShows,
      icon: "✅",
      color: "bg-amber-500",
    },
    {
      title: "Psy w bazie",
      value: stats.totalDogs,
      icon: "🐕",
      color: "bg-amber-500",
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
            </div>
            <div className="bg-amber-500 text-gray-900 p-3 rounded-full text-2xl shadow-lg">
              <img src="/bar-icon.png" alt="Statystyki" className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
