import React from "react";

interface ShowStatsProps {
  stats: {
    totalDogs: number;
    byClass: Record<string, number>;
    byGender: Record<string, number>;
  };
  userRole?: string;
}

const ShowStats: React.FC<ShowStatsProps> = ({ stats }) => {
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

  const getGenderLabel = (gender: string): string => {
    return gender === "male" ? "Samce" : "Suki";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Statystyki wystawy
      </h2>

      {/* Main Stats */}
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-1">
        <div className="bg-amber-500/60 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalDogs}
          </div>
          <div className="text-sm text-gray-900 font-medium">
            Łącznie dodanych psów
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* By Class */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Według klas
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byClass)
              .sort(([, a], [, b]) => b - a)
              .map(([dogClass, count]) => (
                <div
                  key={dogClass}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-700">
                    {getClassLabel(dogClass)}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            {Object.keys(stats.byClass).length === 0 && (
              <p className="text-gray-500 text-sm">Brak dodanych psów</p>
            )}
          </div>
        </div>

        {/* By Gender */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Według płci
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byGender)
              .sort(([, a], [, b]) => b - a)
              .map(([gender, count]) => (
                <div key={gender} className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {getGenderLabel(gender)}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            {Object.keys(stats.byGender).length === 0 && (
              <p className="text-gray-500 text-sm">Brak dodanych psów</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowStats;
