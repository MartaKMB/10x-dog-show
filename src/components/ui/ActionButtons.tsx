import React from "react";

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
}

export function ActionButtons({
  onSave,
  onCancel,
  disabled,
  isDirty,
  isSaving,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Przyciski akcji - responsywne */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <span className="hidden sm:inline">Anuluj</span>
          <span className="sm:hidden">Anuluj (Esc)</span>
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || !isDirty || isSaving}
          className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="hidden sm:inline">
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </span>
          <span className="sm:hidden">
            {isSaving ? "Zapisywanie..." : "Zapisz (Ctrl+S)"}
          </span>
        </button>
      </div>

      {/* Informacja o skrótach klawiszowych - tylko na desktop */}
      <div className="hidden sm:block text-xs text-gray-500 text-right">
        <span className="mr-4">Ctrl+S - Zapisz</span>
        <span className="mr-4">Ctrl+Enter - Zapisz</span>
        <span>Esc - Anuluj</span>
      </div>
    </div>
  );
}
