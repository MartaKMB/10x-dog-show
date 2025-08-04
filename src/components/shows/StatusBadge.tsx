import React from "react";
import type { DescriptionStatus } from "../../types";

interface StatusBadgeProps {
  status: DescriptionStatus;
  onClick?: () => void;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onClick }) => {
  const getStatusConfig = (statusType: string) => {
    switch (statusType) {
      case "none":
        return {
          label: "Brak opisu",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: "📄",
        };
      case "draft":
        return {
          label: "Szkic",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: "📝",
        };
      case "completed":
        return {
          label: "Ukończony",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: "✅",
        };
      case "finalized":
        return {
          label: "Sfinalizowany",
          color: "bg-green-100 text-green-800 border-green-300",
          icon: "🔒",
        };
      default:
        return {
          label: "Nieznany",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: "❓",
        };
    }
  };

  const config = getStatusConfig(status.status);

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
        ${config.color}
        ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
      title={onClick ? "Kliknij aby zobaczyć szczegóły" : undefined}
      aria-label={`Status opisu: ${config.label}`}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.label}</span>
      {status.version && (
        <span className="ml-1 text-xs opacity-75">v{status.version}</span>
      )}
    </button>
  );
};

export default StatusBadge;
