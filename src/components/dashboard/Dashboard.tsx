import React from "react";
import DashboardStats from "./DashboardStats";
import RecentShows from "./RecentShows";
import QuickActions from "./QuickActions";
import { useDashboard } from "../../hooks/useDashboard";
import type { UserRole } from "../../types";

interface DashboardProps {
  userRole: UserRole;
  showQuickActions?: boolean;
  isAuthenticated?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  userRole,
  showQuickActions = false,
  isAuthenticated = false,
}) => {
  const { stats, recentShows, isLoading, error, refreshData } = useDashboard();

  const handleShowClick = (showId: string) => {
    // Navigate to show details
    window.location.href = `/shows/${showId}`;
  };

  if (error) {
    return (
      <div className="space-y-6" data-testid="dashboard-error">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Błąd ładowania dashboardu
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-4 py-2 rounded-lg transition-colors"
              data-testid="dashboard-retry-button"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      {/* Stats Section - only for club board members */}
      {userRole === "club_board" && (
        <div data-testid="dashboard-stats-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statystyki systemu
          </h2>
          <DashboardStats stats={stats} isLoading={isLoading} />
        </div>
      )}

      {/* Recent Shows Section */}
      <div data-testid="dashboard-recent-shows-section">
        <RecentShows
          shows={recentShows}
          isLoading={isLoading}
          onShowClick={handleShowClick}
        />
      </div>

      {/* Quick Actions Section - only for authenticated club board */}
      {showQuickActions && userRole === "club_board" && (
        <div data-testid="dashboard-quick-actions-section">
          <QuickActions userRole={userRole} />
        </div>
      )}

      {/* System Info - keep existing */}
      <div
        className="bg-white shadow rounded-lg p-6"
        data-testid="dashboard-system-info"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informacje o systemie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className="text-center p-3 bg-gray-50 rounded-lg"
            data-testid="dashboard-version-info"
          >
            <div className="font-medium text-gray-900">Wersja</div>
            <div className="text-gray-600">2.0.0</div>
          </div>
          <div
            className="text-center p-3 bg-gray-50 rounded-lg"
            data-testid="dashboard-status-info"
          >
            <div className="font-medium text-gray-900">Status</div>
            <div className="text-green-600">Aktywny</div>
          </div>
          <div
            className="text-center p-3 bg-gray-50 rounded-lg"
            data-testid="dashboard-role-info"
          >
            <div className="font-medium text-gray-900">Rola użytkownika</div>
            <div className="text-gray-600">
              {isAuthenticated && userRole === "club_board"
                ? "Członek zarządu klubu"
                : "Gość (tylko podgląd)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
