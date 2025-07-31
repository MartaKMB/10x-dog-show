import React, { useState, useEffect, useCallback } from "react";
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
import { ApiErrorHandler } from "../lib/services/errorHandler";
import {
  PermissionService,
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
    showStatus: "unknown",
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
      } else {
        // Tryb tworzenia - nie ma danych początkowych
        setApiState({
          isLoading: false,
          error: null,
          initialData: null,
        });
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

  // Sprawdzenie uprawnień
  const checkPermissions = useCallback(async () => {
    try {
      // TODO: pobrać userRole z kontekstu użytkownika
      const userRole = "secretary" as const;

      const permissionCheck =
        await PermissionService.checkDescriptionPermissions(
          showId || "",
          dogId || "",
          userRole,
        );

      setPermissions({
        canEdit: permissionCheck.canEdit,
        canFinalize: permissionCheck.canFinalize,
        showStatus: permissionCheck.showStatus,
      });

      // Jeśli nie ma uprawnień, wyświetl błąd
      if (!permissionCheck.canEdit && permissionCheck.reason) {
        setApiState((prev) => ({
          ...prev,
          error: permissionCheck.reason || null,
        }));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error checking permissions:", error);
      setApiState((prev) => ({
        ...prev,
        error: "Błąd podczas sprawdzania uprawnień",
      }));
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
  const saveDescription = useCallback(
    async (finalize = false) => {
      if (!permissions.canEdit && !finalize) return;

      try {
        setSavingState(true);

        let response: Response;

        if (mode === "create") {
          // Tworzenie nowego opisu
          const createData: CreateDescriptionDto = {
            show_id: showId || "",
            dog_id: dogId || "",
            judge_id: "judge-id", // TODO: pobrać z kontekstu użytkownika
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
          const errorData = await response.json();
          const apiError = ApiErrorHandler.parseError(response, errorData);

          // Obsługa konkretnych błędów
          if (ApiErrorHandler.isConflictError(apiError)) {
            // Przekieruj do edycji istniejącego opisu
            window.location.href = `/descriptions/${errorData.existing_id}/edit`;
            return;
          }

          if (ApiErrorHandler.isPermissionError(apiError)) {
            // Blokada edycji - sprawdź uprawnienia ponownie
            await checkPermissions();
            setError(ApiErrorHandler.getErrorMessage(apiError));
            return;
          }

          if (ApiErrorHandler.isShowCompletedError(apiError)) {
            // Wystawa zakończona - zaktualizuj status
            setPermissions((prev) => ({
              ...prev,
              canEdit: false,
              canFinalize: false,
            }));
            setError(ApiErrorHandler.getErrorMessage(apiError));
            return;
          }

          throw new Error(ApiErrorHandler.getErrorMessage(apiError));
        }

        const savedDescription: DescriptionResponseDto = await response.json();

        // Jeśli finalizujemy, wywołaj endpoint finalizacji
        if (finalize) {
          const finalizeResponse = await fetch(
            `/api/descriptions/${savedDescription.id}/finalize`,
            {
              method: "PATCH",
            },
          );

          if (!finalizeResponse.ok) {
            const finalizeErrorData = await finalizeResponse.json();
            const finalizeApiError = ApiErrorHandler.parseError(
              finalizeResponse,
              finalizeErrorData,
            );
            throw new Error(ApiErrorHandler.getErrorMessage(finalizeApiError));
          }
        }

        // Animacja sukcesu
        setAnimationState((prev) => ({
          ...prev,
          isSaving: false,
          showSuccess: true,
        }));

        setTimeout(() => {
          setAnimationState((prev) => ({ ...prev, showSuccess: false }));
        }, 3000);

        // Zapisz ocenę jeśli istnieje
        if (
          formState.evaluation.grade ||
          formState.evaluation.baby_puppy_grade
        ) {
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
            ApiErrorHandler.parseError(evaluationResponse, evalErrorData);
            // Błąd podczas zapisywania oceny - logujemy ale nie przerywamy
          }
        }

        updateSaveState(new Date().toISOString());

        // Przekieruj do trybu edycji jeśli był w trybie tworzenia
        if (mode === "create") {
          window.location.href = `/descriptions/${savedDescription.id}/edit`;
        }
      } catch (error) {
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
    },
    [
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
    ],
  );

  const handleSave = useCallback(
    () => saveDescription(false),
    [saveDescription],
  );
  const handleFinalize = useCallback(
    () => saveDescription(true),
    [saveDescription],
  );
  const handleCancel = useCallback(() => {
    if (permissions.canEdit) {
      if (confirm("Masz niezapisane zmiany. Czy na pewno chcesz anulować?")) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  }, [permissions.canEdit]);

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

      // Ctrl/Cmd + Enter - Finalizuj
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (
          permissions.canEdit &&
          permissions.canFinalize &&
          !saveState.isSaving
        ) {
          handleFinalize();
        }
      }

      // Escape - Anuluj
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
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
    permissions.canFinalize,
    saveState.isSaving,
    offlineState.hasDraft,
    handleSave,
    handleFinalize,
    handleCancel,
    restoreDraft,
  ]);

  // Inicjalizacja
  useEffect(() => {
    if (descriptionId) {
      // loadVersions(); // This function is not defined in the original file, so it's commented out.
      checkPermissions();
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

      {/* Header */}
      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 ${
          animationState.isVisible ? "animate-fade-in-up" : "opacity-0"
        }`}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          {mode === "create" ? "Nowy opis psa" : "Edycja opisu psa"}
        </h1>
        {/* Status wystawy */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-gray-600">
            Status wystawy:
          </span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              permissions.showStatus !== "in_progress"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {permissions.showStatus !== "in_progress"
              ? "Zakończona"
              : "W trakcie"}
          </span>
        </div>
        {/* Informacje o psie i wystawie */}
        {apiState.initialData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-medium">Pies:</span>{" "}
              {apiState.initialData.dog.name}
            </div>
            <div>
              <span className="font-medium">Wystawa:</span>{" "}
              {apiState.initialData.show.name}
            </div>
          </div>
        )}
      </div>

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
          onFinalize={handleFinalize}
          onCancel={handleCancel}
          disabled={!permissions.canEdit}
          isDirty={permissions.canEdit}
          isSaving={saveState.isSaving}
        />
        {/* Status zapisu */}
        {saveState.lastSaved && (
          <div
            className={`mt-3 text-sm text-gray-600 transition-all duration-300 ${
              animationState.showSuccess ? "animate-fade-in" : ""
            }`}
          >
            Ostatnio zapisano: {new Date(saveState.lastSaved).toLocaleString()}
          </div>
        )}
        {/* Błędy */}
        {saveState.error && (
          <div
            className={`mt-3 p-3 bg-red-50 border border-red-200 rounded-lg transition-all duration-300 ${
              animationState.showError ? "animate-shake" : ""
            }`}
          >
            <p className="text-sm text-red-700">{saveState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
