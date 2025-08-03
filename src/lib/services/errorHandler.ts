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

export function isRegistrationLimitError(error: ApiError): boolean {
  return (
    error.code === "CONFLICT" &&
    error.message.includes("Maximum participants limit")
  );
}

export function isDuplicateRegistrationError(error: ApiError): boolean {
  return (
    error.code === "CONFLICT" && error.message.includes("already registered")
  );
}

export function isDogClassValidationError(error: ApiError): boolean {
  return (
    error.code === "BUSINESS_RULE_ERROR" &&
    error.message.includes("Dog must be")
  );
}

export function isShowNotEditableError(error: ApiError): boolean {
  return (
    error.code === "BUSINESS_RULE_ERROR" && error.message.includes("Cannot")
  );
}

export function isShowNotAcceptingRegistrationsError(error: ApiError): boolean {
  return (
    error.code === "BUSINESS_RULE_ERROR" &&
    error.message.includes("not accepting registrations")
  );
}

export function getErrorMessage(error: ApiError): string {
  // Specjalne komunikaty dla konkretnych błędów
  switch (error.code) {
    case "VALIDATION_ERROR":
      return "Sprawdź poprawność wprowadzonych danych";

    case "FORBIDDEN":
      return "Nie masz uprawnień do wykonania tej operacji";

    case "CONFLICT":
      if (error.message.includes("Maximum participants limit")) {
        return "Osiągnięto limit uczestników dla tej wystawy";
      }
      if (error.message.includes("already registered")) {
        return "Ten pies jest już zarejestrowany na tej wystawie";
      }
      return "Konflikt - zasób już istnieje lub został zmodyfikowany";

    case "BUSINESS_RULE_ERROR":
      if (error.message.includes("Dog must be")) {
        return "Wiek psa nie odpowiada wybranej klasie";
      }
      if (error.message.includes("Cannot")) {
        return "Operacja niedozwolona w obecnym stanie wystawy";
      }
      if (error.message.includes("not accepting registrations")) {
        return "Wystawa nie przyjmuje obecnie rejestracji";
      }
      return "Błąd reguł biznesowych";

    case "UNPROCESSABLE_ENTITY":
      return "Operacja niedozwolona w obecnym stanie";

    case "UNAUTHORIZED":
      return "Sesja wygasła - zaloguj się ponownie";

    default:
      return error.message;
  }
}
