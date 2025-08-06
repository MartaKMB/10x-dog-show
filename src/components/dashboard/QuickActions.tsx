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
      description: "Zarejestruj nowego psa",
      icon: "🐕",
      href: "/dogs/new",
      color: "bg-green-600 hover:bg-green-700",
      requiredRole: ["club_board"],
    },
    {
      id: "new-owner",
      title: "Dodaj właściciela",
      description: "Zarejestruj nowego właściciela",
      icon: "👥",
      href: "/owners/new",
      color: "bg-purple-600 hover:bg-purple-700",
      requiredRole: ["club_board"],
    },
    {
      id: "view-shows",
      title: "Wystawy",
      description: "Przeglądaj wszystkie wystawy",
      icon: "📅",
      href: "/shows",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      id: "view-dogs",
      title: "Psy",
      description: "Przeglądaj zarejestrowane psy",
      icon: "🐾",
      href: "/dogs",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      id: "view-owners",
      title: "Właściciele",
      description: "Przeglądaj właścicieli",
      icon: "👤",
      href: "/owners",
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      id: "evaluations",
      title: "Oceny",
      description: "Zarządzaj ocenami wystaw",
      icon: "⭐",
      href: "/evaluations",
      color: "bg-yellow-600 hover:bg-yellow-700",
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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Szybkie akcje
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableActions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className={`${action.color} text-white p-4 rounded-lg text-center transition-colors hover:shadow-md`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="font-medium text-sm">{action.title}</div>
            <div className="text-xs opacity-90 mt-1">{action.description}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
