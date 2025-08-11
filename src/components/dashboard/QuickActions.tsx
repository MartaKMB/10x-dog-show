import React from "react";
import type { UserRole } from "../../types";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  requiredRole?: UserRole[];
}

interface QuickActionsProps {
  userRole: UserRole;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const allActions: QuickAction[] = [
    {
      id: "new-show",
      title: "Nowa wystawa",
      description: "Utwórz nową wystawę klubową",
      icon: "📋",
      href: "/shows/new",
      color: "bg-blue-600 hover:bg-blue-700",
      requiredRole: ["club_board"],
    },
    {
      id: "new-dog",
      title: "Dodaj psa",
      description: "Dodaj nowego psa do serwisu",
      icon: "🐕",
      href: "/dogs/new",
      color: "bg-green-600 hover:bg-green-700",
      requiredRole: ["club_board"],
    },
    {
      id: "statistics",
      title: "Statystyki",
      description: "Przeglądaj statystyki systemu",
      icon: "📊",
      href: "/statistics",
      color: "bg-gray-600 hover:bg-gray-700",
      requiredRole: ["club_board"],
    },
  ];

  // Filter actions based on user role
  const availableActions = allActions.filter((action) => {
    if (!action.requiredRole) return true;
    return action.requiredRole.includes(userRole);
  });

  return (
    <div
      className="bg-white shadow rounded-lg p-6"
      data-testid="quick-actions-container"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Szybkie akcje
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableActions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className={`${action.color} text-white p-4 rounded-lg text-center transition-colors hover:shadow-md`}
            data-testid={`quick-action-${action.id}`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div
              className="font-medium text-sm"
              data-testid={`quick-action-title-${action.id}`}
            >
              {action.title}
            </div>
            <div
              className="text-xs opacity-90 mt-1"
              data-testid={`quick-action-description-${action.id}`}
            >
              {action.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
