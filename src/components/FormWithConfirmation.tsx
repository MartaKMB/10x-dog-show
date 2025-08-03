import React, { useEffect, useCallback } from "react";

interface FormWithConfirmationProps {
  children: React.ReactNode;
  isDirty: boolean;
  onBeforeUnload?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showConfirmation?: boolean;
  confirmationMessage?: string;
}

export function FormWithConfirmation({
  children,
  isDirty,
  onBeforeUnload,
  onConfirm,
  onCancel,
  showConfirmation = false,
  confirmationMessage = "Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?",
}: FormWithConfirmationProps) {
  // Obsługa beforeunload event
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        return confirmationMessage;
      }
    },
    [isDirty, confirmationMessage],
  );

  // Obsługa popstate event (nawigacja wstecz/naprzód)
  const handlePopState = useCallback(
    (event: PopStateEvent) => {
      if (isDirty) {
        event.preventDefault();
        if (onBeforeUnload) {
          onBeforeUnload();
        }
      }
    },
    [isDirty, onBeforeUnload],
  );

  // Dodanie event listenerów
  useEffect(() => {
    if (isDirty) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isDirty, handleBeforeUnload, handlePopState]);

  // Modal potwierdzenia
  if (showConfirmation) {
    return (
      <>
        {children}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Uwaga - niezapisane zmiany
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">{confirmationMessage}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Opuść stronę
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
