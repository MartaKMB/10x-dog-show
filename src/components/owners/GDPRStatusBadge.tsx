import React from "react";
import type { OwnerResponseDto } from "../../types";

interface GDPRStatusBadgeProps {
  owner: OwnerResponseDto;
  onWithdrawConsent: (ownerId: string) => void;
  canWithdraw: boolean;
}

const GDPRStatusBadge: React.FC<GDPRStatusBadgeProps> = ({
  owner,
  onWithdrawConsent,
  canWithdraw,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const getStatusConfig = () => {
    if (owner.gdpr_consent) {
      return {
        label: "Zgoda udzielona",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "✅",
        tooltip: `Zgoda udzielona: ${formatDate(owner.gdpr_consent_date || owner.created_at)}`,
      };
    } else {
      return {
        label: "Brak zgody",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: "❌",
        tooltip: "Brak zgody na przetwarzanie danych osobowych",
      };
    }
  };

  const config = getStatusConfig();

  const handleWithdrawClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canWithdraw && owner.gdpr_consent) {
      if (
        confirm("Czy na pewno chcesz wycofać zgodę RODO dla tego właściciela?")
      ) {
        onWithdrawConsent(owner.id);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleWithdrawClick}
        disabled={!canWithdraw || !owner.gdpr_consent}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
          ${config.color}
          ${
            canWithdraw && owner.gdpr_consent
              ? "cursor-pointer hover:opacity-80 transition-opacity"
              : "cursor-default"
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
        title={config.tooltip}
        aria-label={`Status RODO: ${config.label}`}
      >
        <span className="text-xs">{config.icon}</span>
        <span>{config.label}</span>
      </button>

      {canWithdraw && owner.gdpr_consent && (
        <button
          onClick={handleWithdrawClick}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
          title="Wycofaj zgodę RODO"
        >
          Wycofaj
        </button>
      )}
    </div>
  );
};

export default GDPRStatusBadge;
