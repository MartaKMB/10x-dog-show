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
    // Sprawdź uprawnienia użytkownika - tylko club_board może edytować
    if (userRole !== "club_board") {
      return {
        canEdit: false,
        canFinalize: false,
        showStatus: "completed",
        reason: "Tylko członkowie zarządu klubu mogą edytować opisy",
      };
    }

    // Sprawdź status wystawy
    const showResponse = await fetch(`/api/shows/${showId}`);
    if (!showResponse.ok) {
      throw new Error("Nie można pobrać informacji o wystawie");
    }

    const show = await showResponse.json();

    if (show.status === "completed") {
      return {
        canEdit: false,
        canFinalize: false,
        showStatus: show.status,
        reason: "Wystawa została zakończona",
      };
    }

    // Dla MVP Hovawart Club - wszystkie psy to Hovawarty, więc nie ma potrzeby sprawdzania rasy
    // Sprawdź czy można finalizować (wystawa w trakcie)
    const canFinalize = show.status === "draft";

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
    return "completed";
  }
}

export async function isShowEditable(showId: string): Promise<boolean> {
  try {
    const status = await checkShowStatus(showId);
    return status === "draft";
  } catch (error) {
    console.error("Error checking if show is editable:", error);
    return false;
  }
}

export async function canUserEditShow(
  showId: string,
  userRole: UserRole,
): Promise<boolean> {
  try {
    if (userRole !== "club_board") {
      return false;
    }

    return await isShowEditable(showId);
  } catch (error) {
    console.error("Error checking user edit permissions:", error);
    return false;
  }
}

export async function canUserDeleteShow(
  showId: string,
  userRole: UserRole,
): Promise<boolean> {
  try {
    if (userRole !== "club_board") {
      return false;
    }

    const status = await checkShowStatus(showId);
    return status === "draft";
  } catch (error) {
    console.error("Error checking user delete permissions:", error);
    return false;
  }
}
