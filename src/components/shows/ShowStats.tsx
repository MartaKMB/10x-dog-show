import React from "react";

interface ShowStatsProps {
  stats: {
    totalDogs: number;
    paidRegistrations: number;
    unpaidRegistrations: number;
    byClass: Record<string, number>;
    byGender: Record<string, number>;
  };
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
        Statystyki rejestracji
      </h2>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalDogs}
          </div>
          <div className="text-sm text-blue-800 font-medium">Łącznie psów</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.paidRegistrations}
          </div>
          <div className="text-sm text-green-800 font-medium">Opłacone</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {stats.unpaidRegistrations}
          </div>
          <div className="text-sm text-yellow-800 font-medium">Nieopłacone</div>
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
              <p className="text-gray-500 text-sm">Brak rejestracji</p>
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
              <p className="text-gray-500 text-sm">Brak rejestracji</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      {stats.totalDogs > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Status płatności
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${stats.totalDogs > 0 ? (stats.paidRegistrations / stats.totalDogs) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Opłacone: {stats.paidRegistrations}</span>
            <span>Nieopłacone: {stats.unpaidRegistrations}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowStats;
