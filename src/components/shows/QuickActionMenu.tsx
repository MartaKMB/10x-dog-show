import React, { useState, useRef, useEffect } from "react";
import type { QuickAction, UserRole } from "../../types";

interface QuickActionMenuProps {
  actions: QuickAction[];
  userRole: UserRole;
  canEdit: boolean;
  canDelete: boolean;
  onAction: (action: string) => void;
}

const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  actions,
  userRole,
  canEdit,
  canDelete,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;

    // Check permissions
    if (
      action.requiresPermission &&
      !action.requiresPermission.includes(userRole)
    ) {
      return;
    }

    onAction(action.action);
    setIsOpen(false);
  };

  const filteredActions = actions.filter((action) => {
    // Filter by permissions
    if (
      action.requiresPermission &&
      !action.requiresPermission.includes(userRole)
    ) {
      return false;
    }

    // Filter by specific permissions
    if (action.action === "edit" && !canEdit) return false;
    if (action.action === "delete" && !canDelete) return false;

    return true;
  });

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Menu akcji"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {filteredActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center gap-2
                  ${
                    action.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                  }
                  focus:outline-none focus:bg-gray-100
                `}
                title={action.disabled ? "Akcja niedostępna" : action.label}
              >
                <span className="text-base">{action.icon}</span>
                <span>{action.label}</span>
                {action.disabled && (
                  <span className="ml-auto text-xs text-gray-400">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionMenu;
