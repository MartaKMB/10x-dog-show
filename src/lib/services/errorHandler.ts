import type { ErrorResponseDto, ErrorDetailDto } from "../../types";

export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetailDto[];
}

export function parseError(
  response: Response,
  data?: ErrorResponseDto,
): ApiError {
  // Standardowe błędy HTTP
  switch (response.status) {
    case 400:
      return {
        code: "VALIDATION_ERROR",
        message: "Błąd walidacji danych",
        details: data?.error?.details || [],
      };

    case 401:
      return {
        code: "UNAUTHORIZED",
        message: "Brak autoryzacji - zaloguj się ponownie",
      };

    case 403:
      return {
        code: "FORBIDDEN",
        message: "Brak uprawnień do wykonania tej operacji",
      };

    case 404:
      return {
        code: "NOT_FOUND",
        message: "Żądany zasób nie został znaleziony",
      };

    case 409:
      return {
        code: "CONFLICT",
        message: "Konflikt - zasób już istnieje lub został zmodyfikowany",
      };

    case 422:
      return {
        code: "UNPROCESSABLE_ENTITY",
        message: "Operacja niedozwolona w obecnym stanie",
      };

    case 500:
      return {
        code: "SERVER_ERROR",
        message: "Błąd serwera - spróbuj ponownie później",
      };

    default:
      return {
        code: "UNKNOWN_ERROR",
        message: data?.error?.message || "Nieznany błąd",
      };
  }
}

export function getFieldErrors(error: ApiError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.details) {
    error.details.forEach((detail) => {
      fieldErrors[detail.field] = detail.message;
    });
  }

  return fieldErrors;
}

export function isValidationError(error: ApiError): boolean {
  return error.code === "VALIDATION_ERROR";
}

export function isPermissionError(error: ApiError): boolean {
  return error.code === "FORBIDDEN";
}

export function isConflictError(error: ApiError): boolean {
  return error.code === "CONFLICT";
}

export function isShowCompletedError(error: ApiError): boolean {
  return error.code === "UNPROCESSABLE_ENTITY";
}

export function getErrorMessage(error: ApiError): string {
  // Specjalne komunikaty dla konkretnych błędów
  switch (error.code) {
    case "VALIDATION_ERROR":
      return "Sprawdź poprawność wprowadzonych danych";

    case "FORBIDDEN":
      return "Nie masz uprawnień do edycji opisów dla tej rasy psów na tej wystawie";

    case "CONFLICT":
      return "Opis dla tego psa i sędziego już istnieje na tej wystawie";

    case "UNPROCESSABLE_ENTITY":
      return "Wystawa została zakończona - nie można już edytować opisów";

    case "UNAUTHORIZED":
      return "Sesja wygasła - zaloguj się ponownie";

    default:
      return error.message;
  }
}
