import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useDescriptionEditor } from "../lib/hooks/useDescriptionEditor";
import { useEvaluationValidation } from "../lib/hooks/useEvaluationValidation";
import type {
  DescriptionResponseDto,
  CreateDescriptionDto,
  UpdateDescriptionDto,
  CreateEvaluationDto,
  DescriptionVersionDto,
} from "../types";
import { RichTextEditor } from "./ui/RichTextEditor";
import { EvaluationForm } from "./ui/EvaluationForm";
import { ActionButtons } from "./ui/ActionButtons";
import { ChangeHistory } from "./ChangeHistory";
import { SimpleDiffViewer } from "./SimpleDiffViewer";
import { OfflineDetector } from "./OfflineDetector";
import { DescriptionHeader } from "./DescriptionHeader";
import { FormWithConfirmation } from "./FormWithConfirmation";
import {
  parseError,
  isConflictError,
  isPermissionError,
  isShowCompletedError,
  getErrorMessage,
} from "../lib/services/errorHandler";
import {
  checkDescriptionPermissions,
  type PermissionCheck,
} from "../lib/services/permissionService";

interface DescriptionEditorProps {
  descriptionId?: string;
  showId?: string;
  dogId?: string;
  mode: "create" | "edit";
}

interface ApiState {
  isLoading: boolean;
  error: string | null;
  initialData: DescriptionResponseDto | null;
}

interface OfflineState {
  isOffline: boolean;
  hasDraft: boolean;
  draftData: {
    formState: {
      content_pl: string;
      content_en: string;
      evaluation: CreateEvaluationDto;
    };
    timestamp: string;
  } | null;
}

// Stan animacji
interface AnimationState {
  isVisible: boolean;
  isSaving: boolean;
  showSuccess: boolean;
  showError: boolean;
  fadeIn: boolean;
}

export function DescriptionEditor({
  descriptionId,
  showId,
  dogId,
  mode,
}: DescriptionEditorProps) {
  // Stan API
  const [apiState, setApiState] = useState<ApiState>({
    isLoading: true,
    error: null,
    initialData: null,
  });
  // Stan uprawnień
  const [permissions, setPermissions] = useState<PermissionCheck>({
    canEdit: false,
    canFinalize: false,
    showStatus: "draft",
  });

  // Stan offline
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOffline: false,
    hasDraft: false,
    draftData: null,
  });

  // Stan animacji
  const [animationState, setAnimationState] = useState<AnimationState>({
    isVisible: false,
    isSaving: false,
    showSuccess: false,
    showError: false,
    fadeIn: false,
  });

  // Stan potwierdzenia
  const [confirmationState, setConfirmationState] = useState({
    showConfirmation: false,
    pendingAction: null as (() => void) | null,
  });

  // Animacja wejścia
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, fadeIn: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Pobieranie danych początkowych
  useEffect(() => {
    const loadInitialData = async () => {
      if (mode === "edit" && descriptionId) {
        try {
          setApiState((prev) => ({ ...prev, isLoading: true, error: null }));

          const response = await fetch(`/api/descriptions/${descriptionId}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Opis nie został znaleziony");
            }
            throw new Error("Błąd podczas pobierania opisu");
          }

          const data: DescriptionResponseDto = await response.json();
          setApiState({
            isLoading: false,
            error: null,
            initialData: data,
          });

          // Animacja po załadowaniu danych
          setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, isVisible: true }));
          }, 200);
        } catch (error) {
          setApiState({
            isLoading: false,
            error: error instanceof Error ? error.message : "Nieznany błąd",
            initialData: null,
          });
        }
      } else if (mode === "create" && showId && dogId) {
        // Tryb tworzenia - sprawdź czy opis już istnieje
        try {
          setApiState((prev) => ({ ...prev, isLoading: true, error: null }));

          const response = await fetch(
            `/api/descriptions?show_id=${showId}&dog_id=${dogId}`,
          );
          if (response.ok) {
            const descriptions = await response.json();

            if (descriptions.length > 0) {
              // Opis już istnieje - przełącz w tryb edycji
              const existingDescription = descriptions[0];
              setApiState({
                isLoading: false,
                error: null,
                initialData: existingDescription,
              });

              // Przekieruj do trybu edycji
              window.location.href = `/shows/${showId}/dogs/${dogId}/description/${existingDescription.id}`;
              return;
            }
          }

          // Brak istniejącego opisu - kontynuuj w trybie tworzenia
          setApiState({
            isLoading: false,
            error: null,
            initialData: null,
          });

          // Animacja po załadowaniu danych w trybie tworzenia
          setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, isVisible: true }));
          }, 200);
        } catch (error) {
          console.error("Error checking for existing description:", error);
          // W przypadku błędu, kontynuuj w trybie tworzenia
          setApiState({
            isLoading: false,
            error: null,
            initialData: null,
          });

          setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, isVisible: true }));
          }, 200);
        }
      } else {
        // Tryb tworzenia - nie ma danych początkowych
        setApiState({
          isLoading: false,
          error: null,
          initialData: null,
        });

        // Animacja po załadowaniu danych w trybie tworzenia
        setTimeout(() => {
          setAnimationState((prev) => ({ ...prev, isVisible: true }));
        }, 200);
      }
    };

    loadInitialData();
  }, [descriptionId, mode]);

  // Custom hook do zarządzania stanem edytora
  const {
    formState,
    saveState,
    historyState,
    updateContent,
    updateEvaluation,
    setSavingState,
    updateSaveState,
    setError,
    selectVersion,
    updateFormState,
  } = useDescriptionEditor({
    descriptionId,
    dogId: dogId || "",
    showId: showId || "",
    initialData: apiState.initialData || undefined,
  });

  // Custom hook do walidacji oceny
  const { validationResult } = useEvaluationValidation(
    formState.evaluation,
    formState.evaluation.dog_class,
  );

  // Obsługa potwierdzeń
  const handleConfirmAction = useCallback(
    (action: () => void) => {
      if (saveState.isDirty) {
        setConfirmationState({
          showConfirmation: true,
          pendingAction: action,
        });
      } else {
        action();
      }
    },
    [saveState.isDirty],
  );

  const handleConfirm = useCallback(() => {
    if (confirmationState.pendingAction) {
      confirmationState.pendingAction();
    }
    setConfirmationState({
      showConfirmation: false,
      pendingAction: null,
    });
  }, [confirmationState]);

  const handleCancelConfirmation = useCallback(() => {
    setConfirmationState({
      showConfirmation: false,
      pendingAction: null,
    });
  }, []);

  // Sprawdzenie uprawnień
  const checkPermissions = useCallback(async () => {
    if (!showId || !dogId) return;

    try {
      // Mock user role - w rzeczywistej aplikacji pobierane z kontekstu użytkownika
      const userRole = "admin" as const;

      const permissions = await checkDescriptionPermissions(
        showId,
        dogId,
        userRole,
      );

      setPermissions(permissions);

      // Jeśli nie ma uprawnień, pokaż błąd
      if (!permissions.canEdit && permissions.reason) {
        setApiState((prev) => ({
          ...prev,
          error: permissions.reason || null,
        }));
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissions({
        canEdit: false,
        canFinalize: false,
        showStatus: "completed",
        reason: "Błąd podczas sprawdzania uprawnień",
      });
    }
  }, [showId, dogId]);

  // Obsługa offline
  useEffect(() => {
    const handleOnline = () =>
      setOfflineState((prev) => ({ ...prev, isOffline: false }));
    const handleOffline = () =>
      setOfflineState((prev) => ({ ...prev, isOffline: true }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sprawdź czy jest draft w localStorage
    const draftKey = `description-draft-${descriptionId || `${showId}-${dogId}`}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setOfflineState((prev) => ({ ...prev, hasDraft: true, draftData }));
      } catch {
        localStorage.removeItem(draftKey);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [descriptionId, showId, dogId]);

  // Funkcje obsługi draftu
  const saveDraft = useCallback(() => {
    const draftKey = `description-draft-${descriptionId || `${showId}-${dogId}`}`;
    const draftData = {
      formState,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setOfflineState((prev) => ({ ...prev, hasDraft: true, draftData }));
  }, [descriptionId, showId, dogId, formState]);

  const restoreDraft = useCallback(() => {
    if (offlineState.draftData) {
      updateFormState(offlineState.draftData.formState);
      setSavingState(false);
    }
  }, [offlineState.draftData, updateFormState, setSavingState]);

  // Funkcja do generowania diff
  const generateDiff = (
    oldVersion: DescriptionVersionDto,
    newVersion: DescriptionVersionDto,
  ) => {
    const changes = [];

    if (oldVersion.content_pl !== newVersion.content_pl) {
      changes.push({
        field: "Treść (PL)",
        oldValue: oldVersion.content_pl || "(brak)",
        newValue: newVersion.content_pl || "(brak)",
        author:
          newVersion.changed_by.first_name +
          " " +
          newVersion.changed_by.last_name,
        timestamp: newVersion.created_at,
      });
    }

    if (oldVersion.content_en !== newVersion.content_en) {
      changes.push({
        field: "Treść (EN)",
        oldValue: oldVersion.content_en || "(brak)",
        newValue: newVersion.content_en || "(brak)",
        author:
          newVersion.changed_by.first_name +
          " " +
          newVersion.changed_by.last_name,
        timestamp: newVersion.created_at,
      });
    }

    return changes;
  };

  // Funkcje API z obsługą błędów
  const saveDescription = useCallback(async () => {
    console.log("saveDescription called");
    console.log("permissions.canEdit:", permissions.canEdit);

    if (!permissions.canEdit) {
      console.log("Early return - no edit permissions");
      return;
    }

    try {
      setSavingState(true);

      let response: Response;

      if (mode === "create") {
        // Tworzenie nowego opisu
        const createData: CreateDescriptionDto = {
          show_id: showId || "",
          dog_id: dogId || "",
          judge_id: "550e8400-e29b-41d4-a716-446655440001", // Mock judge ID
          content_pl: formState.content_pl || undefined,
          content_en: formState.content_en || undefined,
        };

        response = await fetch("/api/descriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });
      } else {
        // Aktualizacja istniejącego opisu
        const updateData: UpdateDescriptionDto = {
          content_pl: formState.content_pl || undefined,
          content_en: formState.content_en || undefined,
        };

        response = await fetch(`/api/descriptions/${descriptionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        console.log("Response not ok:", response.status, response.statusText);
        const errorData = await response.json();
        console.log("Error data:", errorData);
        const apiError = parseError(response, errorData);

        // Obsługa konkretnych błędów
        if (isConflictError(apiError)) {
          // Przekieruj do edycji istniejącego opisu
          window.location.href = `/descriptions/${errorData.existing_id}/edit`;
          return;
        }

        if (isPermissionError(apiError)) {
          // Blokada edycji - sprawdź uprawnienia ponownie
          await checkPermissions();
          setError(getErrorMessage(apiError));
          return;
        }

        if (isShowCompletedError(apiError)) {
          // Wystawa zakończona - zaktualizuj status
          setPermissions((prev) => ({
            ...prev,
            canEdit: false,
            canFinalize: false,
          }));
          setError(getErrorMessage(apiError));
          return;
        }

        throw new Error(getErrorMessage(apiError));
      }

      const savedDescription: DescriptionResponseDto = await response.json();
      console.log("Saved description response:", savedDescription);

      // Reset saving state and show success animation
      setSavingState(false);
      setAnimationState((prev) => ({
        ...prev,
        isSaving: false,
        showSuccess: true,
      }));

      setTimeout(() => {
        setAnimationState((prev) => ({ ...prev, showSuccess: false }));
      }, 3000);

      // Zapisz ocenę jeśli istnieje
      if (formState.evaluation.grade || formState.evaluation.baby_puppy_grade) {
        const evaluationData: CreateEvaluationDto = formState.evaluation;

        const evaluationResponse = await fetch(
          `/api/descriptions/${savedDescription.id}/evaluations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evaluationData),
          },
        );

        if (!evaluationResponse.ok) {
          const evalErrorData = await evaluationResponse.json();
          parseError(evaluationResponse, evalErrorData);
          // Błąd podczas zapisywania oceny - logujemy ale nie przerywamy
        }
      }

      updateSaveState(new Date().toISOString());

      // Reset dirty state przed przekierowaniem
      setSavingState(false);

      // Małe opóźnienie przed przekierowaniem aby przeglądarka zaktualizowała stan
      setTimeout(async () => {
        // Po zapisie przekieruj do widoku wystawy z filtrem na rasę
        const dogResponse = await fetch(`/api/dogs/${dogId}`);
        if (dogResponse.ok) {
          const dog = await dogResponse.json();
          // Przekieruj do widoku wystawy z filtrem na rasę
          window.location.href = `/shows/${showId}?breed=${dog.breed.id}`;
        } else {
          // Fallback - przekieruj do widoku wystawy bez filtra
          window.location.href = `/shows/${showId}`;
        }
      }, 100);
    } catch (error) {
      console.error("Error saving description:", error);
      setError(error instanceof Error ? error.message : "Nieznany błąd");

      // Animacja błędu
      setAnimationState((prev) => ({
        ...prev,
        isSaving: false,
        showError: true,
      }));

      setTimeout(() => {
        setAnimationState((prev) => ({ ...prev, showError: false }));
      }, 5000);
    }
  }, [
    permissions.canEdit,
    mode,
    descriptionId,
    showId,
    dogId,
    formState,
    setSavingState,
    setError,
    updateSaveState,
    checkPermissions,
    setPermissions,
    setAnimationState,
  ]);

  const handleSave = useCallback(() => saveDescription(), [saveDescription]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S - Zapisz
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (permissions.canEdit && !saveState.isSaving) {
          handleSave();
        }
      }

      // Ctrl/Cmd + Enter - Zapisz
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (permissions.canEdit && !saveState.isSaving) {
          handleSave();
        }
      }

      // Escape - Anuluj
      if (event.key === "Escape") {
        event.preventDefault();
        if (saveState.isDirty) {
          handleConfirmAction(() => window.history.back());
        } else {
          window.history.back();
        }
      }

      // Ctrl/Cmd + Z - Przywróć draft (tylko w trybie offline)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        offlineState.hasDraft
      ) {
        event.preventDefault();
        restoreDraft();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    permissions.canEdit,
    saveState.isSaving,
    offlineState.hasDraft,
    handleSave,
    handleConfirmAction,
    saveState.isDirty,
    restoreDraft,
  ]);

  // Inicjalizacja
  useEffect(() => {
    // Sprawdź uprawnienia zarówno w trybie edycji jak i tworzenia
    checkPermissions();

    if (descriptionId) {
      // loadVersions(); // This function is not defined in the original file, so it's commented out.
    }
  }, [descriptionId, checkPermissions]);

  // Renderowanie stanu ładowania
  if (apiState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  // Renderowanie błędu
  if (apiState.error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Błąd</h2>
          <p className="text-red-700">{apiState.error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormWithConfirmation
      isDirty={saveState.isDirty}
      showConfirmation={confirmationState.showConfirmation}
      onConfirm={handleConfirm}
      onCancel={handleCancelConfirmation}
    >
      <div
        className={`max-w-4xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 transition-all duration-500 ${
          animationState.fadeIn
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {/* OfflineDetector */}
        <OfflineDetector
          isOffline={offlineState.isOffline}
          hasDraft={offlineState.hasDraft}
          onRestoreDraft={restoreDraft}
          onSaveDraft={saveDraft}
        />

        {/* DescriptionHeader */}
        <DescriptionHeader
          description={apiState.initialData || undefined}
          showId={showId}
          dogId={dogId}
          mode={mode}
        />

        {/* Edytor treści */}
        <div
          className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 delay-100 ${
            animationState.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Treść opisu
          </h2>
          <RichTextEditor
            value={{
              content_pl: formState.content_pl,
              content_en: formState.content_en,
            }}
            onChange={(val) => {
              updateContent("pl", val.content_pl);
              updateContent("en", val.content_en);
            }}
            disabled={!permissions.canEdit}
          />
        </div>

        {/* Formularz oceny */}
        <div
          className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 delay-200 ${
            animationState.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Ocena psa
          </h2>
          <EvaluationForm
            value={formState.evaluation}
            onChange={updateEvaluation}
            dogClass={formState.evaluation.dog_class}
            language="pl"
            disabled={!permissions.canEdit}
            errors={validationResult.errors}
          />
        </div>

        {/* Historia wersji */}
        {mode === "edit" && historyState.versions.length > 0 && (
          <div
            className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 delay-300 ${
              animationState.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Historia wersji
            </h2>
            <ChangeHistory
              versions={historyState.versions}
              onSelect={selectVersion}
              selectedVersion={historyState.selectedVersion}
            />

            {/* Podgląd zmian */}
            {historyState.selectedVersion && (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">
                  Zmiany w wybranej wersji
                </h3>
                <SimpleDiffViewer
                  changes={generateDiff(
                    historyState.versions[historyState.versions.length - 1],
                    historyState.selectedVersion,
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Przyciski akcji */}
        <div
          className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 delay-400 ${
            animationState.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <ActionButtons
            onSave={handleSave}
            onCancel={() => handleConfirmAction(() => window.history.back())}
            disabled={!permissions.canEdit}
            isDirty={saveState.isDirty}
            isSaving={saveState.isSaving}
          />
          {/* Status zapisu */}
          {saveState.lastSaved && (
            <div
              className={`mt-3 text-sm text-gray-600 transition-all duration-300 ${
                animationState.showSuccess ? "animate-fade-in" : ""
              }`}
            >
              Ostatnio zapisano:{" "}
              {new Date(saveState.lastSaved).toLocaleString()}
            </div>
          )}
          {/* Błędy */}
          {saveState.error && (
            <div
              className={`mt-3 p-3 bg-red-50 border border-red-200 rounded-lg transition-all duration-300 ${
                animationState.showError ? "animate-shake" : ""
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Błąd podczas zapisywania
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{saveState.error}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="text-sm text-red-600 hover:text-red-500 font-medium"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormWithConfirmation>
  );
}
