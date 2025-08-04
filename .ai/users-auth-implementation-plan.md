# API Endpoint Implementation Plan: Authentication & Users Management

## 1. Przegląd punktów końcowych

Kompleksowy system autentykacji i zarządzania użytkownikami oparty na Supabase Auth z dodatkowymi endpointami do zarządzania profilami użytkowników. System obejmuje pełny cykl życia użytkownika od rejestracji przez zarządzanie sesjami aż po deaktywację konta.

### Authentication Management

- Rejestracja użytkowników z walidacją i aktywacją email
- Logowanie z JWT tokenami i refresh tokenami
- Zarządzanie sesjami użytkowników
- Wylogowanie i unieważnianie tokenów
- Pobieranie informacji o aktualnym użytkowniku

### Users Management

- Lista użytkowników z filtrowaniem i paginacją
- Szczegóły użytkownika z pełnymi danymi
- Aktualizacja profilu użytkownika
- Deaktywacja użytkowników (soft delete)
- Zarządzanie rolami i uprawnieniami

## 2. Szczegóły żądań

### 2.1 Authentication Endpoints

#### POST /auth/register

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/auth/register`
- **Request Body:** RegisterUserDto
- **Autoryzacja:** Brak (publiczny endpoint)
- **Opis:** Rejestracja nowego użytkownika z walidacją email i aktywacją konta

#### POST /auth/login

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/auth/login`
- **Request Body:** LoginUserDto
- **Autoryzacja:** Brak (publiczny endpoint)
- **Opis:** Logowanie użytkownika z generowaniem JWT tokena

#### POST /auth/logout

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/auth/logout`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Wylogowanie użytkownika i unieważnienie sesji

#### GET /auth/me

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/auth/me`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Pobranie informacji o aktualnie zalogowanym użytkowniku

#### POST /auth/refresh

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/auth/refresh`
- **Request Body:** RefreshTokenDto
- **Autoryzacja:** Brak (publiczny endpoint)
- **Opis:** Odświeżenie JWT tokena przy użyciu refresh tokena

### 2.2 Users Management Endpoints

#### GET /users

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/users`
- **Parametry query:**
  - `role` (optional): Filtr po roli użytkownika
  - `is_active` (optional): Filtr po statusie aktywności
  - `search` (optional): Wyszukiwanie w imieniu, nazwisku lub email
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Przedstawiciele oddziałów (rola: department_representative)

#### GET /users/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/users/{id}`
- **Parametry:** `id` (UUID) - Identyfikator użytkownika
- **Autoryzacja:** Przedstawiciele oddziałów lub własny profil

#### PUT /users/{id}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/users/{id}`
- **Request Body:** UpdateUserDto
- **Autoryzacja:** Przedstawiciele oddziałów lub własny profil

#### DELETE /users/{id}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/users/{id}`
- **Autoryzacja:** Przedstawiciele oddziałów (nie można usunąć samego siebie)

#### PATCH /users/{id}/activate

- **Metoda HTTP:** PATCH
- **Struktura URL:** `/api/users/{id}/activate`
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Aktywacja deaktywowanego użytkownika

## 3. Wykorzystywane typy

### 3.1 Authentication DTOs

```typescript
// Rejestracja użytkownika
interface RegisterUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  language: Language;
}

// Logowanie użytkownika
interface LoginUserDto {
  email: string;
  password: string;
}

// Odpowiedź autentykacji
interface AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// Odświeżenie tokena
interface RefreshTokenDto {
  refresh_token: string;
}

// Odpowiedź odświeżenia
interface RefreshResponseDto {
  access_token: string;
  expires_at: string;
}

// Odpowiedź wylogowania
interface LogoutResponseDto {
  message: string;
}
```

### 3.2 Users Management DTOs

```typescript
// Odpowiedź użytkownika (podstawowa)
interface UserResponseDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  language: Language;
  is_active: boolean;
  created_at: string;
}

// Odpowiedź użytkownika (szczegółowa)
interface UserDetailResponseDto extends UserResponseDto {
  updated_at: string;
  last_login_at: string | null;
  login_count: number;
}

// Aktualizacja użytkownika
interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  language?: Language;
}

// Lista użytkowników z paginacją
interface UsersListResponseDto {
  users: UserResponseDto[];
  pagination: PaginationDto;
}
```

### 3.3 Query Parameters

```typescript
interface UserQueryParams {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

## 4. Logika biznesowa

### 4.1 Authentication Logic

#### Rejestracja użytkownika:

1. **Walidacja danych:**

   - Email: format RFC 5322, unikalność
   - Hasło: minimum 8 znaków, wymagane znaki specjalne
   - Imię i nazwisko: minimum 2 znaki
   - Rola: tylko department_representative lub secretary

2. **Proces rejestracji:**

   - Hashowanie hasła z bcrypt (cost: 12)
   - Tworzenie użytkownika w auth.users
   - Generowanie tokena aktywacyjnego
   - Wysłanie emaila aktywacyjnego
   - Logowanie audytu

3. **Walidacja email:**
   - Token aktywacyjny ważny 24 godziny
   - Automatyczna aktywacja po kliknięciu linku
   - Możliwość ponownego wysłania tokena

#### Logowanie użytkownika:

1. **Walidacja danych:**

   - Sprawdzenie istnienia użytkownika
   - Weryfikacja hasła
   - Sprawdzenie statusu aktywności

2. **Generowanie tokenów:**

   - JWT access token (ważny 1 godzinę)
   - Refresh token (ważny 7 dni)
   - Zapisywanie sesji w auth.user_sessions

3. **Aktualizacja statystyk:**
   - Zwiększenie licznika logowań
   - Aktualizacja last_login_at
   - Logowanie audytu

#### Wylogowanie:

1. **Unieważnienie tokenów:**
   - Usunięcie sesji z auth.user_sessions
   - Dodanie tokena do blacklisty (opcjonalnie)
   - Logowanie audytu

### 4.2 Users Management Logic

#### Lista użytkowników:

1. **Filtrowanie:**

   - Po roli (department_representative, secretary)
   - Po statusie aktywności
   - Wyszukiwanie w imieniu, nazwisku, email

2. **Paginacja:**

   - Domyślnie 20 elementów na stronę
   - Maksymalnie 100 elementów na stronę
   - Sortowanie po created_at (DESC)

3. **Autoryzacja:**
   - Tylko department_representative może zobaczyć wszystkich użytkowników
   - Sekretarze widzą tylko siebie

#### Aktualizacja użytkownika:

1. **Walidacja uprawnień:**

   - Użytkownik może edytować swój profil
   - Department_representative może edytować wszystkich
   - Nie można zmienić roli na department_representative

2. **Walidacja danych:**

   - Imię i nazwisko: minimum 2 znaki
   - Język: tylko pl lub en
   - Status aktywności: tylko dla department_representative

3. **Aktualizacja:**
   - Aktualizacja pól w auth.users
   - Logowanie audytu z old/new values
   - Aktualizacja updated_at

#### Deaktywacja użytkownika:

1. **Walidacja:**

   - Nie można deaktywować samego siebie
   - Nie można deaktywować ostatniego department_representative
   - Sprawdzenie czy użytkownik ma aktywne wystawy

2. **Proces deaktywacji:**
   - Ustawienie is_active = false
   - Unieważnienie wszystkich sesji użytkownika
   - Logowanie audytu
   - Opcjonalne: zaplanowanie usunięcia po 30 dniach

## 5. Obsługa błędów

### 5.1 Authentication Errors

```typescript
// Błędy rejestracji
const AUTH_ERRORS = {
  EMAIL_ALREADY_EXISTS: {
    code: "EMAIL_ALREADY_EXISTS",
    message: "Użytkownik z tym adresem email już istnieje",
    status: 409,
  },
  INVALID_EMAIL_FORMAT: {
    code: "INVALID_EMAIL_FORMAT",
    message: "Nieprawidłowy format adresu email",
    status: 400,
  },
  WEAK_PASSWORD: {
    code: "WEAK_PASSWORD",
    message: "Hasło musi mieć minimum 8 znaków i zawierać znaki specjalne",
    status: 400,
  },
  INVALID_ROLE: {
    code: "INVALID_ROLE",
    message: "Nieprawidłowa rola użytkownika",
    status: 400,
  },
};

// Błędy logowania
const LOGIN_ERRORS = {
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Nieprawidłowy email lub hasło",
    status: 401,
  },
  ACCOUNT_INACTIVE: {
    code: "ACCOUNT_INACTIVE",
    message: "Konto jest nieaktywne",
    status: 403,
  },
  ACCOUNT_LOCKED: {
    code: "ACCOUNT_LOCKED",
    message: "Konto jest zablokowane",
    status: 403,
  },
};
```

### 5.2 Users Management Errors

```typescript
// Błędy zarządzania użytkownikami
const USER_ERRORS = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "Użytkownik nie został znaleziony",
    status: 404,
  },
  INSUFFICIENT_PERMISSIONS: {
    code: "INSUFFICIENT_PERMISSIONS",
    message: "Brak uprawnień do wykonania tej operacji",
    status: 403,
  },
  CANNOT_DEACTIVATE_SELF: {
    code: "CANNOT_DEACTIVATE_SELF",
    message: "Nie można deaktywować własnego konta",
    status: 400,
  },
  CANNOT_DEACTIVATE_LAST_ADMIN: {
    code: "CANNOT_DEACTIVATE_LAST_ADMIN",
    message: "Nie można deaktywować ostatniego przedstawiciela oddziału",
    status: 400,
  },
  USER_HAS_ACTIVE_SHOWS: {
    code: "USER_HAS_ACTIVE_SHOWS",
    message: "Nie można deaktywować użytkownika z aktywnymi wystawami",
    status: 400,
  },
};
```

## 6. Implementacja serwisów

### 6.1 AuthService

```typescript
class AuthService {
  // Rejestracja użytkownika
  async registerUser(data: RegisterUserDto): Promise<AuthResponseDto> {
    // Implementacja rejestracji
  }

  // Logowanie użytkownika
  async loginUser(data: LoginUserDto): Promise<AuthResponseDto> {
    // Implementacja logowania
  }

  // Wylogowanie użytkownika
  async logoutUser(userId: string): Promise<LogoutResponseDto> {
    // Implementacja wylogowania
  }

  // Odświeżenie tokena
  async refreshToken(refreshToken: string): Promise<RefreshResponseDto> {
    // Implementacja odświeżenia
  }

  // Pobranie aktualnego użytkownika
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    // Implementacja pobierania użytkownika
  }

  // Walidacja tokena
  async validateToken(token: string): Promise<boolean> {
    // Implementacja walidacji
  }
}
```

### 6.2 UserService

```typescript
class UserService {
  // Lista użytkowników
  async getUsers(params: UserQueryParams): Promise<UsersListResponseDto> {
    // Implementacja listy użytkowników
  }

  // Szczegóły użytkownika
  async getUserById(id: string): Promise<UserDetailResponseDto> {
    // Implementacja szczegółów użytkownika
  }

  // Aktualizacja użytkownika
  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    // Implementacja aktualizacji
  }

  // Deaktywacja użytkownika
  async deactivateUser(id: string): Promise<{ message: string }> {
    // Implementacja deaktywacji
  }

  // Aktywacja użytkownika
  async activateUser(id: string): Promise<UserResponseDto> {
    // Implementacja aktywacji
  }
}
```

## 7. Walidacja danych

### 7.1 Auth Schemas

```typescript
// Schemat rejestracji
const registerUserSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Hasło musi zawierać wielkie i małe litery, cyfry i znaki specjalne",
    ),
  first_name: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  last_name: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  role: z.enum(["department_representative", "secretary"]),
  language: z.enum(["pl", "en"]),
});

// Schemat logowania
const loginUserSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

// Schemat aktualizacji użytkownika
const updateUserSchema = z.object({
  first_name: z.string().min(2, "Imię musi mieć minimum 2 znaki").optional(),
  last_name: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki").optional(),
  is_active: z.boolean().optional(),
  language: z.enum(["pl", "en"]).optional(),
});
```

## 8. Middleware i autoryzacja

### 8.1 Auth Middleware

```typescript
// Middleware autentykacji
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: {
        code: "MISSING_TOKEN",
        message: "Token autoryzacyjny jest wymagany",
      },
    });
  }

  try {
    const user = await authService.validateToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Nieprawidłowy lub wygasły token",
      },
    });
  }
};

// Middleware autoryzacji ról
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Użytkownik nie jest uwierzytelniony",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Brak uprawnień do wykonania tej operacji",
        },
      });
    }

    next();
  };
};
```

## 9. Rate limiting i bezpieczeństwo

### 9.1 Rate Limiting

```typescript
// Konfiguracja rate limiting
const rateLimitConfig = {
  // Rejestracja: 5 prób na godzinę na IP
  register: {
    windowMs: 60 * 60 * 1000, // 1 godzina
    max: 5,
    message: "Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.",
  },
  // Logowanie: 10 prób na godzinę na IP
  login: {
    windowMs: 60 * 60 * 1000, // 1 godzina
    max: 10,
    message: "Zbyt wiele prób logowania. Spróbuj ponownie za godzinę.",
  },
  // Ogólne API: 1000 requestów na godzinę na użytkownika
  api: {
    windowMs: 60 * 60 * 1000, // 1 godzina
    max: 1000,
    message: "Zbyt wiele żądań. Spróbuj ponownie za godzinę.",
  },
};
```

### 9.2 Security Headers

```typescript
// Konfiguracja nagłówków bezpieczeństwa
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
```

## 10. Testy

### 10.1 Unit Tests

```typescript
describe("AuthService", () => {
  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      // Test rejestracji
    });

    it("should throw error for duplicate email", async () => {
      // Test duplikatu email
    });

    it("should validate password strength", async () => {
      // Test siły hasła
    });
  });

  describe("loginUser", () => {
    it("should login user with valid credentials", async () => {
      // Test logowania
    });

    it("should throw error for invalid credentials", async () => {
      // Test nieprawidłowych danych
    });
  });
});

describe("UserService", () => {
  describe("getUsers", () => {
    it("should return paginated users list", async () => {
      // Test listy użytkowników
    });

    it("should filter users by role", async () => {
      // Test filtrowania
    });
  });
});
```

### 10.2 Integration Tests

```typescript
describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register new user", async () => {
      // Test endpointu rejestracji
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user and return tokens", async () => {
      // Test endpointu logowania
    });
  });
});
```

## 11. Dokumentacja API

### 11.1 OpenAPI/Swagger

```yaml
paths:
  /api/auth/register:
    post:
      summary: Rejestracja nowego użytkownika
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/RegisterUserDto"
      responses:
        "201":
          description: Użytkownik został zarejestrowany
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthResponseDto"
        "400":
          description: Błąd walidacji danych
        "409":
          description: Email już istnieje

  /api/auth/login:
    post:
      summary: Logowanie użytkownika
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginUserDto"
      responses:
        "200":
          description: Logowanie udane
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthResponseDto"
        "401":
          description: Nieprawidłowe dane logowania
```

## 12. Deployment i konfiguracja

### 12.1 Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration (for activation emails)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 12.2 Database Migrations

```sql
-- Migracja dla tabel autentykacji
-- (Supabase Auth automatycznie zarządza tabelami auth.users)

-- Dodanie dodatkowych kolumn do auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_users_email_active ON auth.users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_active ON auth.users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON auth.user_sessions(user_id, expires_at);
```

## 13. Monitoring i logowanie

### 13.1 Audit Logging

```typescript
// Logowanie akcji autentykacji
const logAuthAction = async (action: string, userId: string, metadata: any) => {
  await supabase.from("audit.activity_log").insert({
    user_id: userId,
    action: action,
    entity_type: "user",
    entity_id: userId,
    metadata: metadata,
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
  });
};

// Przykłady logowania
await logAuthAction("login", userId, { success: true });
await logAuthAction("register", userId, { role: userRole });
await logAuthAction("logout", userId, { session_id: sessionId });
```

### 13.2 Error Tracking

```typescript
// Konfiguracja Sentry dla śledzenia błędów
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

// Przechwytywanie błędów autentykacji
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.code?.startsWith("AUTH_") || error.code?.startsWith("USER_")) {
    Sentry.captureException(error, {
      tags: { component: "auth" },
      user: { id: req.user?.id },
    });
  }
  next(error);
});
```

## 14. Podsumowanie

Ten plan implementacji zapewnia:

### ✅ **Funkcjonalności Authentication:**

- Rejestracja użytkowników z walidacją email
- Logowanie z JWT tokenami
- Zarządzanie sesjami i refresh tokenami
- Wylogowanie i unieważnianie tokenów
- Pobieranie informacji o aktualnym użytkowniku

### ✅ **Funkcjonalności Users Management:**

- Lista użytkowników z filtrowaniem i paginacją
- Szczegóły użytkownika z pełnymi danymi
- Aktualizacja profilu użytkownika
- Deaktywacja użytkowników (soft delete)
- Zarządzanie rolami i uprawnieniami

### ✅ **Bezpieczeństwo:**

- Row Level Security (RLS) w Supabase
- Rate limiting dla endpointów
- Walidacja danych wejściowych
- Audit logging wszystkich akcji
- Bezpieczne nagłówki HTTP

### ✅ **Skalowalność:**

- Architektura oparta na Supabase Auth
- Automatyczne zarządzanie sesjami
- Możliwość rozszerzenia o OAuth
- Monitoring i error tracking

**Następne kroki:** Implementacja endpointów zgodnie z tym planem, testy jednostkowe i integracyjne, dokumentacja API.
