import { useState, useCallback, useEffect } from "react";
import type {
  DescriptionResponseDto,
  CreateDescriptionDto,
  UpdateDescriptionDto,
  CreateEvaluationDto,
  EvaluationResponseDto,
  DescriptionVersionDto,
} from "../../types";

interface UseDescriptionEditorProps {
  descriptionId?: string;
  dogId: string;
  showId: string;
  initialData?: DescriptionResponseDto;
}

interface DescriptionFormState {
  content_pl: string;
  content_en: string;
  evaluation: CreateEvaluationDto;
}

interface SaveState {
  isSaving: boolean;
  lastSaved: string | null;
  error: string | null;
  isDirty: boolean;
}

interface HistoryState {
  versions: DescriptionVersionDto[];
  selectedVersion: DescriptionVersionDto | null;
  isLoading: boolean;
}

export function useDescriptionEditor({
  descriptionId,
  dogId,
  showId,
  initialData,
}: UseDescriptionEditorProps) {
  // Stan formularza
  const [formState, setFormState] = useState<DescriptionFormState>({
    content_pl: initialData?.content_pl || "",
    content_en: initialData?.content_en || "",
    evaluation: {
      dog_class: initialData?.evaluation?.dog_class || "open",
      grade: initialData?.evaluation?.grade || undefined,
      baby_puppy_grade: initialData?.evaluation?.baby_puppy_grade || undefined,
      title: initialData?.evaluation?.title || undefined,
      placement: initialData?.evaluation?.placement || undefined,
      points: initialData?.evaluation?.points || undefined,
      is_best_in_group: initialData?.evaluation?.is_best_in_group || false,
      is_best_in_show: initialData?.evaluation?.is_best_in_show || false,
    },
  });

  // Stan zapisu
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    isDirty: false,
  });

  // Stan historii wersji
  const [historyState, setHistoryState] = useState<HistoryState>({
    versions: [],
    selectedVersion: null,
    isLoading: false,
  });

  // Stan uprawnień i statusu wystawy
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canFinalize: true,
    showStatus: "in_progress" as const,
  });

  // Aktualizacja stanu formularza
  const updateFormState = useCallback(
    (updates: Partial<DescriptionFormState>) => {
      setFormState((prev) => ({ ...prev, ...updates }));
      setSaveState((prev) => ({ ...prev, isDirty: true, error: null }));
    },
    [],
  );

  // Aktualizacja treści opisu
  const updateContent = useCallback(
    (language: "pl" | "en", content: string) => {
      updateFormState({
        [`content_${language}`]: content,
      });
    },
    [updateFormState],
  );

  // Aktualizacja oceny
  const updateEvaluation = useCallback(
    (updates: Partial<CreateEvaluationDto>) => {
      updateFormState({
        evaluation: { ...formState.evaluation, ...updates },
      });
    },
    [formState.evaluation, updateFormState],
  );

  // Sprawdzenie czy formularz jest kompletny
  const isFormComplete = useCallback(() => {
    const hasContent =
      formState.content_pl.trim() || formState.content_en.trim();
    const hasEvaluation =
      formState.evaluation.grade || formState.evaluation.baby_puppy_grade;
    return hasContent && hasEvaluation;
  }, [formState]);

  // Resetowanie stanu błędu
  const clearError = useCallback(() => {
    setSaveState((prev) => ({ ...prev, error: null }));
  }, []);

  // Ustawienie stanu zapisu
  const setSavingState = useCallback((isSaving: boolean) => {
    setSaveState((prev) => ({ ...prev, isSaving, error: null }));
  }, []);

  // Aktualizacja stanu zapisu po sukcesie
  const updateSaveState = useCallback((lastSaved: string) => {
    setSaveState((prev) => ({
      ...prev,
      isSaving: false,
      lastSaved,
      isDirty: false,
    }));
  }, []);

  // Ustawienie błędu
  const setError = useCallback((error: string) => {
    setSaveState((prev) => ({
      ...prev,
      isSaving: false,
      error,
    }));
  }, []);

  // Pobieranie historii wersji
  const loadVersions = useCallback(async () => {
    if (!descriptionId) return;

    setHistoryState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(
        `/api/descriptions/${descriptionId}/versions`,
      );
      if (!response.ok) throw new Error("Failed to load versions");

      const data = await response.json();
      setHistoryState((prev) => ({
        ...prev,
        versions: data.versions,
        isLoading: false,
      }));
    } catch (error) {
      setHistoryState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      console.error("Error loading versions:", error);
    }
  }, [descriptionId]);

  // Wybór wersji z historii
  const selectVersion = useCallback(
    (version: DescriptionVersionDto) => {
      setHistoryState((prev) => ({ ...prev, selectedVersion: version }));
      setFormState({
        content_pl: version.content_pl || "",
        content_en: version.content_en || "",
        evaluation: formState.evaluation, // Zachowujemy obecną ocenę
      });
    },
    [formState.evaluation],
  );

  // Sprawdzenie uprawnień
  const checkPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setPermissions({
          canEdit: data.canEdit,
          canFinalize: data.canFinalize,
          showStatus: data.showStatus,
        });
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  }, [showId]);

  // Inicjalizacja
  useEffect(() => {
    if (descriptionId) {
      loadVersions();
    }
    checkPermissions();
  }, [descriptionId, loadVersions, checkPermissions]);

  return {
    // Stan
    formState,
    saveState,
    historyState,
    permissions,

    // Akcje
    updateContent,
    updateEvaluation,
    updateFormState,
    clearError,
    setSavingState,
    updateSaveState,
    setError,
    selectVersion,
    loadVersions,

    // Weryfikacje
    isFormComplete,

    // Wartości obliczane
    isDirty: saveState.isDirty,
    canSave: permissions.canEdit && saveState.isDirty,
    canFinalize:
      permissions.canEdit &&
      permissions.canFinalize &&
      isFormComplete() &&
      !initialData?.is_final,
  };
}
