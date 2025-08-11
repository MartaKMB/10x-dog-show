## Plan testów dla projektu 10x-dog-show (Klub Hovawarta Show)

### 1. Wprowadzenie i cele testowania

- **Cel główny**: zapewnienie jakości funkcjonalnej i niefunkcjonalnej aplikacji webowej (Astro + React + TypeScript + Supabase) z naciskiem na bezpieczne uwierzytelnianie (Supabase Auth), integralność danych i stabilność kluczowych procesów (wystawy, psy, właściciele, rejestracje, oceny, statystyki).
- **Cele szczegółowe**:
  - Potwierdzenie zgodności z PRD (`.ai/prd-hov.md`) i specyfikacją autentykacji (`.ai/auth-spec.md`).
  - Zapewnienie publicznego wglądu (US-002) przy jednoczesnym egzekwowaniu ograniczeń edycji (US-003).
  - Zapewnienie poprawnego SSR i sesji użytkownika przez middleware (cookies via `@supabase/ssr`).
  - Minimalizacja regresji przez zestaw testów jednostkowych, integracyjnych i e2e z sensownymi progami pokrycia.

### 2. Zakres testów

- **Frontend (Astro + React, TypeScript)**:
  - Strony: `src/pages/auth/*` (login, register, forgot-password, reset-password), listy i szczegóły (`/shows`, `/dogs`, `/owners`, `/statistics`, dashboard), `Layout.astro` (nagłówek i stan sesji).
  - Komponenty auth: `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, `PermissionDenied.tsx`, `AuthGuard` (jeżeli wdrożony), `OfflineDetector.tsx`.
  - Komponenty domenowe: `shows/*` (np. `ShowCreator.tsx`, `ShowDetailsView.tsx`), `dogs/*`, `owners/*`, `dashboard/*`.
- **Backend (API Routes, SSR Middleware)**:
  - Middleware: `src/middleware/index.ts` – inicjalizacja `locals.auth` i ochrona ścieżek.
  - Endpoints: `src/pages/api/auth/*` (login, logout, register, password reset, me), `/api/shows/*`, `/api/dogs/*`, `/api/owners/*`, `/api/users/*`.
- **Integracja z Supabase**:
  - Klient SSR: `src/db/supabase.server.ts` (cookies `getAll`/`setAll`).
  - Klient przeglądarkowy: `src/db/supabase.client.ts`.
- **Baza danych**:
  - Operacje CRUD w obrębie tabel domenowych i spójność z seedingiem (`supabase/seed.sql`, `seed_data.sql`).
- **Niefunkcjonalne**:
  - Wydajność (czasy odpowiedzi kluczowych operacji), dostępność (a11y), bezpieczeństwo sesji i autoryzacji, odporność na błędy.

Poza zakresem: modyfikacje schematu DB (zarządzane deklaratywnie w osobnym procesie), integracje z zewnętrznymi providerami SSO.

### 3. Typy testów

- **Testy jednostkowe (UI/Logika)**:
  - Narzędzia: Vitest + React Testing Library, `@testing-library/user-event`, `@axe-core/vitest` dla a11y.
  - Zakres: walidacje formularzy (`zod`), logika komponentów, renderowanie stanów (loading, error), utils i serwisy (`src/lib/services/*`).
- **Testy integracyjne (API/SSR/Komponenty z usługami)**:
  - Narzędzia: Vitest (Node env), MSW do mockowania Supabase/HTTP, Supertest lub fetch do testowania API routes.
  - Zakres: przepływy auth przez API (`/api/auth/*`), middleware atrybucja `locals.auth`, spójność SSR cookies, integracja komponentów z serwisami.
- **Testy e2e (przeglądarka)**:
  - Narzędzia: Playwright.
  - Zakres: krytyczne ścieżki użytkownika (US-001..US-010), redirecty, stan nagłówka, ochrona akcji edycyjnych.
- **Testy wydajnościowe**:
  - Narzędzia: Lighthouse (UI), k6 lub autocannon (API – opcjonalnie).
  - Zakres: czasy odpowiedzi list i zapisów (happy-path), first meaningful paint kluczowych stron.
- **Testy bezpieczeństwa**:
  - Zakres: nieautoryzowany dostęp do POST/PUT/DELETE (401/403), wycieki danych w odpowiedziach, odporność CSRF dla JSON (nagłówki), poprawność zarządzania cookies (HttpOnly, SameSite).
- **Testy dostępności (a11y)**:
  - Narzędzia: `@axe-core/vitest`, Playwright a11y snapshot.
  - Zakres: formularze auth i kluczowe strony list/szczegółów.

### 4. Scenariusze testowe dla kluczowych funkcjonalności

- **Autentykacja (US-003)**:
  - Rejestracja: poprawne dane → konto + profil, komunikat/redirect; konflikt email → 409; walidacje client/server.
  - Logowanie: poprawne dane aktywnego profilu → 200, cookies SSR ustawione, nagłówek pokazuje użytkownika; błędne dane → 401; `is_active=false` → 403; rate-limit (jeśli wdrożony).
  - Wylogowanie: unieważnienie sesji, wyczyszczone cookies, powrót do widoku niezalogowanego.
  - Reset hasła: request → zawsze 200 neutralne; ustawienie nowego hasła po linku → sukces i redirect do login.
  - Middleware: na publicznych ścieżkach brak blokady; próba akcji edycyjnych bez sesji → redirect/do-not-allow + `PermissionDenied`.
- **Publiczny wgląd (US-002)**:
  - Niezalogowany widzi listy/szczegóły; akcje edycyjne ukryte lub nieaktywne z tooltipem.
  - Dane wrażliwe właścicieli maskowane zgodnie z PRD (jeśli dotyczy).
- **Edycja po zalogowaniu**:
  - Tworzenie/edycja/usuwanie: wystawy, psy, właściciele, rejestracje, oceny – wyłącznie dla zalogowanych (`club_board`).
  - Walidacje domenowe (np. spójność oceny z tytułem klubowym, auto-klasa wg wieku z możliwością korekty).
- **Statystyki i dashboard**:
  - Poprawne agregacje (liczby psów w klasach, rozkład ocen/tytułów), stabilność filtrów/paginacji.
- **Błędy i odporność**:
  - Mapowanie błędów: 401/403/409/422/429/500 do komunikatów UI.
  - Brak połączenia (offline): `OfflineDetector` pokazuje wskaźnik i bezpieczne degradacje.

Przy każdej ścieżce uwzględnić testy: happy-path, walidacje, uprawnienia, błędy backendu, regresje UI.

### 5. Środowisko testowe

- **Lokalnie**: macOS (darwin 24.x), Node.js LTS, pnpm/npm zgodnie z repo, Astro SSR (`output: "server"`).
- **Supabase lokalnie**: instancja developerska z seedingiem (`supabase/seed.sql`), ustawione `auth.site_url` i `additional_redirect_urls` dla resetu hasła.
- **Konfiguracja ENV**: `SUPABASE_URL`, `SUPABASE_KEY` (oraz publiczne odpowiedniki, jeżeli używane), bez ujawniania kluczy w testach e2e (użycie env/secretów CI).
- **Dane testowe**: deterministyczny seeding; dla e2e oddzielne konta testowe (np. `club_board+e2e@domain`).
- **Przeglądarki**: Chromium + WebKit + Firefox (Playwright default).

### 6. Narzędzia do testowania

- Jednostkowe/integracyjne: Vitest, React Testing Library, MSW, Supertest (lub fetch), `@axe-core/vitest`.
- E2E: Playwright.
- Jakość: ESLint, TypeScript (tsc --noEmit), Prettier.
- Wydajność: Lighthouse, k6/autocannon (opcjonalnie).
- Raportowanie: JUnit/HTML reporter dla CI, coverage lcov.

Zasady dla testów jednostkowych (wyciąg):

- Struktura `describe/test`, setup/teardown `beforeEach/afterEach`, unikać nadmiernych snapshotów, używać precyzyjnych matcherów, mockować IO i czas, raportować coverage z sensownymi celami.

### 7. Harmonogram testów

- Faza 1: pokrycie krytycznych komponentów auth i middleware testami integracyjnymi + smoke e2e (login, logout, publiczny wgląd).
- Faza 2: scenariusze CRUD (shows, dogs, owners, registrations, evaluations) – testy integracyjne + rozszerzenie e2e; a11y podstawowe.
- Faza 3: statystyki, edge-cases błędów, wydajność kluczowych widoków, domknięcie pokrycia.
- Kontynuacja: regresja przy każdym PR (CI), smoke e2e nocne, pełny zestaw przed releasem.

### 8. Kryteria akceptacji testów

- Wszystkie testy krytyczne (auth, ochrona zapisu, CRUD) przechodzą w 100%.
- Pokrycie minimalne: linie 30%, gałęzie 20% w `src/lib` i komponentach auth; dla domenowych komponentów min. 10% na MVP.
- E2E smoke: 0 testów niepowodzeń; średni czas odpowiedzi list <2 s na danych testowych.
- A11y: brak krytycznych naruszeń (severity high) na stronach auth i list.

### 9. Integracja z CI/CD (zalecenia)

- Pipeline: lint + typecheck → testy jednostkowe/integracyjne (headless) → build → e2e smoke (na PR) → pełne e2e (na main/nocne).
- Artefakty: raporty JUnit/HTML, coverage lcov, zrzuty ekranu i trace z Playwright.
- Bramka jakości: minimalne progi coverage i brak testów krytycznych w stanie failed.

### 10. Utrzymanie i ewolucja planu

- Przegląd co sprint/release; aktualizacja scenariuszy wraz ze zmianami PRD (`.ai/prd-hov.md`) i specyfikacji auth (`.ai/auth-spec.md`).
- Dodawanie testów przy każdej nowej funkcjonalności, w szczególności w obszarach wysokiego ryzyka (auth, zapisy, agregacje statystyczne).
