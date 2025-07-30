import React from "react";

interface OfflineDetectorProps {
  isOffline: boolean;
  hasDraft: boolean;
  onRestoreDraft: () => void;
  onSaveDraft: () => void;
}

export function OfflineDetector({
  isOffline,
  hasDraft,
  onRestoreDraft,
  onSaveDraft,
}: OfflineDetectorProps) {
  if (!isOffline) return null;
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
      <div className="font-semibold text-yellow-800 mb-2">
        Brak połączenia z siecią
      </div>
      <div className="text-sm text-yellow-700 mb-2">
        Zmiany nie zostaną zapisane do czasu przywrócenia połączenia.
      </div>
      {hasDraft ? (
        <button
          onClick={onRestoreDraft}
          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-2"
        >
          Przywróć lokalny szkic
        </button>
      ) : (
        <button
          onClick={onSaveDraft}
          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Zapisz lokalny szkic
        </button>
      )}
    </div>
  );
}
