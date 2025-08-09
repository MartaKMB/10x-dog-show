import React from "react";
import DashboardStats from "./DashboardStats";
import { useDashboard } from "../../hooks/useDashboard";

const Statistics: React.FC = () => {
  const { stats, isLoading, error, refreshData } = useDashboard();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Błąd ładowania statystyk
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Statystyki</h1>
        <p className="text-gray-600 text-sm">
          Ta strona będzie rozwijana w przyszłości o dodatkowe statystyki i
          wykresy. Póki co prezentuje te same statystyki co na dashboardzie.
        </p>
      </div>

      <DashboardStats stats={stats} isLoading={isLoading} />
    </div>
  );
};

export default Statistics;
