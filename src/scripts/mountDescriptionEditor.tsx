import React from "react";
import { createRoot } from "react-dom/client";
import { DescriptionEditor } from "../components/DescriptionEditor";

// Funkcja do montowania komponentu DescriptionEditor
export function mountDescriptionEditor() {
  const container = document.getElementById("description-editor-root");

  if (!container) {
    console.warn("DescriptionEditor container not found");
    return;
  }

  // Pobieranie danych z data attributes
  const descriptionId = container.getAttribute("data-description-id");
  const showId = container.getAttribute("data-show-id");
  const dogId = container.getAttribute("data-dog-id");
  const mode = container.getAttribute("data-mode") as "create" | "edit";

  if (
    !mode ||
    (mode === "edit" && !descriptionId) ||
    (mode === "create" && (!showId || !dogId))
  ) {
    console.error("Invalid DescriptionEditor configuration");
    return;
  }

  // Tworzenie root i montowanie komponentu
  const root = createRoot(container);

  root.render(
    React.createElement(DescriptionEditor, {
      descriptionId: descriptionId || undefined,
      showId: showId || undefined,
      dogId: dogId || undefined,
      mode: mode,
    }),
  );
}

// Automatyczne montowanie po załadowaniu DOM
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountDescriptionEditor);
  } else {
    mountDescriptionEditor();
  }
}
