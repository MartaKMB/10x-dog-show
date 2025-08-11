import React from "react";

interface ActionButtonsProps {
  onSave: () => void;
  onFinalize: () => void;
  onCancel: () => void;
  disabled?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
}

export function ActionButtons({
  onSave,
  onFinalize,
  onCancel,
  disabled,
  isDirty,
  isSaving,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3" data-testid="action-buttons-container">
      {/* Przyciski akcji - responsywne */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          data-testid="action-button-cancel"
        >
          <span className="hidden sm:inline">Anuluj</span>
          <span className="sm:hidden">Anuluj (Esc)</span>
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || !isDirty || isSaving}
          className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          data-testid="action-button-save"
        >
          <span className="hidden sm:inline">
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </span>
          <span className="sm:hidden">
            {isSaving ? "Zapisywanie..." : "Zapisz (Ctrl+S)"}
          </span>
        </button>
        <button
          type="button"
          onClick={onFinalize}
          disabled={disabled || !isDirty || isSaving}
          className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          data-testid="action-button-finalize"
        >
          <span className="hidden sm:inline">
            {isSaving ? "Finalizowanie..." : "Finalizuj"}
          </span>
          <span className="sm:hidden">
            {isSaving ? "Finalizowanie..." : "Finalizuj (Ctrl+Enter)"}
          </span>
        </button>
      </div>

      {/* Informacja o skrótach klawiszowych - tylko na desktop */}
      <div
        className="hidden sm:block text-xs text-gray-500 text-right"
        data-testid="keyboard-shortcuts"
      >
        <span className="mr-4">Ctrl+S - Zapisz</span>
        <span className="mr-4">Ctrl+Enter - Finalizuj</span>
        <span>Esc - Anuluj</span>
      </div>
    </div>
  );
}
