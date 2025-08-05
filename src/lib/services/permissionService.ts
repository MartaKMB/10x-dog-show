import type { UserRole, ShowStatus } from "../../types";

export interface PermissionCheck {
  canEdit: boolean;
  canFinalize: boolean;
  showStatus: ShowStatus;
  reason?: string;
}

export async function checkDescriptionPermissions(
  showId: string,
  dogId: string,
  userRole: UserRole,
): Promise<PermissionCheck> {
  try {
    // Sprawdź uprawnienia użytkownika
    if (userRole !== "secretary" && userRole !== "admin") {
      return {
        canEdit: false,
        canFinalize: false,
        showStatus: "completed",
        reason: "Tylko sekretarze i administratorzy mogą edytować opisy",
      };
    }

    // Sprawdź status wystawy
    const showResponse = await fetch(`/api/shows/${showId}`);
    if (!showResponse.ok) {
      throw new Error("Nie można pobrać informacji o wystawie");
    }

    const show = await showResponse.json();

    if (show.status === "completed" || show.status === "cancelled") {
      return {
        canEdit: false,
        canFinalize: false,
        showStatus: show.status,
        reason: "Wystawa została zakończona lub anulowana",
      };
    }

    // Sprawdź czy sekretarz ma uprawnienia do rasy psa na tej wystawie
    const dogResponse = await fetch(`/api/dogs/${dogId}`);
    if (!dogResponse.ok) {
      throw new Error("Nie można pobrać informacji o psie");
    }

    const dog = await dogResponse.json();

    // Sprawdź uprawnienia sekretarza do rasy
    const permissionsResponse = await fetch(`/api/shows/${showId}/permissions`);
    if (!permissionsResponse.ok) {
      throw new Error("Nie można sprawdzić uprawnień");
    }

    const permissions = await permissionsResponse.json();

    const hasBreedPermission = permissions.allowed_breeds?.includes(
      dog.breed.id,
    );

    if (!hasBreedPermission) {
      return {
        canEdit: false,
        canFinalize: false,
        showStatus: show.status,
        reason:
          "Nie masz uprawnień do edycji opisów dla tej rasy psów na tej wystawie",
      };
    }

    // Sprawdź czy można finalizować (wystawa w trakcie)
    const canFinalize = show.status === "in_progress";

    return {
      canEdit: true,
      canFinalize,
      showStatus: show.status,
    };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return {
      canEdit: false,
      canFinalize: false,
      showStatus: "completed",
      reason: "Błąd podczas sprawdzania uprawnień",
    };
  }
}

export async function checkShowStatus(showId: string): Promise<ShowStatus> {
  try {
    const response = await fetch(`/api/shows/${showId}`);
    if (!response.ok) {
      throw new Error("Nie można pobrać statusu wystawy");
    }

    const show = await response.json();
    return show.status;
  } catch (error) {
    console.error("Error checking show status:", error);
    return "completed"; // Domyślnie zakończona jeśli błąd
  }
}

export function isShowEditable(status: ShowStatus): boolean {
  return status === "in_progress" || status === "open_for_registration";
}

export function isShowCompleted(status: ShowStatus): boolean {
  return status === "completed" || status === "cancelled";
}
