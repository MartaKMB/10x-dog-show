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
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
      >
        Anuluj
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled || !isDirty || isSaving}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Zapisywanie..." : "Zapisz"}
      </button>
      <button
        type="button"
        onClick={onFinalize}
        disabled={disabled || !isDirty || isSaving}
        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Finalizowanie..." : "Finalizuj"}
      </button>
    </div>
  );
}
