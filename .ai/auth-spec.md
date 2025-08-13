# Specyfikacja modułu autentykacji (rejestracja, logowanie, odzyskiwanie hasła)

Dokument projektowy dla MVP zgodny z: `prd-hov.md` (US-002 „Wgląd” i US-003 „Bezpieczny dostęp i uwierzytelnianie”) oraz `tech-stack.md` (Astro 5 + React 19 + TypeScript + Supabase). Celem jest dodanie pełnego modułu auth bez naruszania istniejącego działania aplikacji HovBase (publiczny wgląd danych, edycja tylko po zalogowaniu).

Odwołania:

- US-002: Użytkownik może przeglądać wszystkie dane bez logowania (edycja wyłączona).
- US-003: Rejestracja, logowanie, wylogowanie, odzyskiwanie hasła, jedna rola `club_board`.

Założenia i ograniczenia:

- Brak zewnętrznych providerów (tylko email/hasło Supabase Auth).
- Zachowujemy dotychczasowy publiczny wgląd (UI widoczne bez logowania, akcje edycyjne ukryte/nieaktywne).
- Integrujemy Supabase Auth, ale nie zmieniamy schematu bazy w tym kroku (profile w `public.users` nadal używane; hasła w niej nie będą już źródłem prawdy – od teraz źródłem jest Supabase Auth). Dalsza migracja haseł poza zakresem.
- Astro działa w trybie SSR (`output: "server"`), wykorzystujemy middleware i ciasteczka do sesji użytkownika.

---

## 1. Architektura interfejsu użytkownika

### 1.1. Zmiany w warstwie frontendu

Nowe ścieżki (Astro pages):

- `/auth/login` – logowanie
- `/auth/register` – rejestracja (samodzielna, rola domyślnie `club_board` z polem `is_active=false` do momentu aktywacji – patrz backend)
- `/auth/forgot-password` – żądanie resetu hasła (wysyłka maila przez Supabase)
- `/auth/reset-password` – ustawienie nowego hasła po wejściu z linku (token w URL)

Zmiany w istniejących layoutach i stronach:

- `src/layouts/Layout.astro`
  - Zastąpienie placeholdera „Demo User” realnym stanem: wstępnie SSR z `Astro.locals.auth.user` (patrz backend/middleware). Gdy zalogowany – wyświetl krótką informację o użytkowniku i przycisk „Wyloguj”; gdy niezalogowany – „Zaloguj się”.
  - Link „Zaloguj się” prowadzi do `/auth/login`, „Wyloguj” wywołuje akcję frontend (Supabase Auth) lub POST do `/api/auth/logout`, po czym redirect na bieżącą stronę lub `/`.
- Widoki listowe i szczegółowe (np. `src/pages/shows/index.astro`, `src/pages/dogs/index.astro`, dashboard)
  - Zachowują publiczny odczyt (US-002). Wszystkie przyciski edycyjne (`+ Nowa wystawa`, „Edytuj”, „Usuń”, akcje szybkiego dodawania) są renderowane po spełnieniu warunku zalogowania. Warunek pobierany SSR (w frontmatterze) lub przekazywany do komponentów React przez props (`isAuthenticated`, `userRole`).
  - Dla niezalogowanych: przyciski edycyjne ukryte albo nieaktywne z tooltipem i komponentem `PermissionDenied` w miejscach wrażliwych.

Nowe komponenty (React, `src/components/auth/`):

- `LoginForm.tsx`
  - Pola: email, password; obsługa submit.
  - Walidacja: email poprawny, hasło min. 8 znaków.
  - Integracja: po submit – wywołanie `supabase.auth.signInWithPassword` lub POST `/api/auth/login` (patrz 2.2, rekomendacja: client-first + SSR sync w tle).
  - UI: komunikaty błędów nad formularzem i inline; loader; linki do rejestracji i resetu hasła.
- `RegisterForm.tsx`
  - Pola: email, password, confirm_password, first_name, last_name.
  - Walidacja: email, hasło min. 8, potwierdzenie hasła, imię/nazwisko wymagane.
  - Integracja: POST `/api/auth/register` (serwerowo łączy Supabase Auth signUp + utworzenie profilu w `public.users`).
  - UI: komunikaty sukcesu i błędów; informacja o konieczności aktywacji konta (jeśli wymagane) lub możliwości natychmiastowego logowania.
- `ForgotPasswordForm.tsx`
  - Pole: email; po submit: wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: site_url + '/auth/reset-password' })`.
  - UI: dyskretny komunikat sukcesu („Jeśli adres istnieje, wysłaliśmy instrukcje”).
- `ResetPasswordForm.tsx`
  - Pola: new_password, confirm_password.
  - Integracja: po wejściu z linku z tokenem Supabase wywołanie `supabase.auth.updateUser({ password })` (token Supabase będzie już związany z sesją po wejściu z linku). Walidacja haseł.

Formularze – odpowiedzialności:

- Strony Astro odpowiadają za routing i SSR stanu uwierzytelnienia (np. przekazanie `user` do layoutu/komponentów).
- Komponenty React odpowiadają za: interaktywną walidację, obsługę zdarzeń, komunikaty, oraz wykonanie wywołań auth (client SDK lub API routes).

Walidacja i komunikaty błędów (frontend):

- Biblioteka: `zod` + ewentualnie `react-hook-form` (spójnie z istniejącym użyciem `zod` w backendzie).
- Ogólne zasady:
  - email: poprawny format
  - password: min. 8 znaków
  - confirm_password: zgodne z `password`
  - first_name/last_name: wymagane
- Mapa błędów:
  - 401: „Nieprawidłowy email lub hasło.”
  - 403: „Konto nieaktywne. Skontaktuj się z administratorem.”
  - 429: „Zbyt wiele prób. Spróbuj ponownie później.”
  - inne: „Wystąpił błąd. Spróbuj ponownie.”

Scenariusze kluczowe UX:

- Niezalogowany użytkownik przegląda stronę – widzi dane, akcje edycyjne ukryte/nieaktywne (US-002).
- Użytkownik klika „Zaloguj się” z dowolnego miejsca – po sukcesie redirect na stronę źródłową (parametr `redirect` w query lub `history.back()`).
- Użytkownik rejestruje konto – po sukcesie: albo automatyczny login (jeśli polityka MVP pozwala), albo informacja o aktywacji/przejściu do logowania.
- Użytkownik żąda resetu – zawsze neutralny komunikat („wysłaliśmy instrukcje, jeśli adres istnieje”).
- Użytkownik wchodzi z linku resetu – formularz ustawienia nowego hasła; po sukcesie redirect do `/auth/login` z komunikatem „Hasło zostało zaktualizowane”.

### 1.2. Tryb auth vs non-auth – separacja odpowiedzialności

- Non-auth (US-002):
  - Wszystkie strony listowe i szczegółowe (dashboard, shows, dogs, owners, statistics) – pełny wgląd danych.
  - Brak edycji: ukryte/wyłączone przyciski + `PermissionDenied` w miejscach krytycznych.
- Auth (US-003):
  - Po zalogowaniu `userRole=club_board` – odblokowanie akcji tworzenia/edycji/usuwania, zgodnie z aktualną logiką komponentów (np. warunek roli już jest sygnalizowany w UI). Rekomendacja: wprowadzić prosty `AuthGuard` w komponentach, które inicjują zapisy (np. modale „New”, „Edit”), aby przed wykonaniem akcji sprawdzić `isAuthenticated`.

---

## 2. Logika backendowa

### 2.1. Przegląd

Dodajemy moduł API pod `src/pages/api/auth/` oraz klient serwerowy Supabase do SSR.

Nowe pliki (proponowane):

- `src/db/supabase.server.ts` – fabryka klienta serwerowego Supabase, bazująca na ciasteczkach request/response (zalecane użycie `@supabase/ssr`).
- `src/middleware/index.ts` – rozszerzenie o `locals.auth = { user, session }` na podstawie klienta serwerowego.
- `src/pages/api/auth/login.ts` – opcjonalne logowanie via API (SSR cookie sync).
- `src/pages/api/auth/logout.ts` – wylogowanie (czyszczenie sesji/cookies SSR).
- `src/pages/api/auth/register.ts` – rejestracja: signUp w Supabase Auth + utworzenie profilu w `public.users` (DB) w transakcji logicznej.
- `src/pages/api/auth/me.ts` – zwrot profilu bieżącego użytkownika (łączy info z Supabase Auth i `public.users`).
- `src/pages/api/auth/password/reset-request.ts` – żądanie resetu hasła (wysyłka maila z linkiem).

Walidacja wejścia (backend):

- `zod` schematy w nowym module `src/lib/validation/authSchemas.ts`:
  - `loginSchema` { email, password }
  - `registerSchema` { email, password, confirm_password, first_name, last_name }
  - `resetRequestSchema` { email }
  - `resetConfirmSchema` { password, confirm_password }

Kontrakty typów:

- Wykorzystać istniejące DTO w `src/types.ts` (`LoginRequest`, `LoginResponse`, `LogoutResponse`, `UserProfile`). Dla rejestracji: `UserCreateRequest` + zwrot uproszczonego profilu bez pól wrażliwych.

Obsługa wyjątków i błędów:

- Spójny kształt błędu `ErrorResponse` (już istnieje) + mapowanie kodów 401/403/409/422/429/500.
- Nie ujawniamy, czy email istnieje w resetach (neutralna odpowiedź 200).

### 2.2. Struktura endpointów API

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
POST   /api/auth/password/reset-request
GET    /api/auth/me
```

Opis:

- `POST /api/auth/login`

  - Wejście: `LoginRequest`
  - Działanie (warianty wdrożenia):
    1. Client-first: frontend używa `supabase.auth.signInWithPassword`, a endpoint nie jest wymagany; SSR uzupełnia się przez middleware przy kolejnych requestach.
    2. SSR-first (rekomendowane dla spójności ciasteczek): endpoint tworzy sesję poprzez klienta serwerowego (`@supabase/ssr`), ustawia cookies w odpowiedzi. Zwraca `LoginResponse` (bez hasła), a UI robi redirect.
  - Błędy: 401 invalid_credentials, 403 inactive_user, 429 too_many_requests, 500 internal_error.

- `POST /api/auth/logout`

  - Działanie: wylogowanie w Supabase (unieważnienie refresh tokena) + czyszczenie cookies SSR, `200 { message }`.

- `POST /api/auth/register`

  - Wejście: `UserCreateRequest` + `confirm_password` (walidowane po stronie backendu).
  - Działanie: `auth.signUp({ email, password })` (nie wymaga service key), a następnie utworzenie rekordu w `public.users` (profile: `first_name`, `last_name`, `role='club_board'`, `is_active=false` domyślnie) – flaga aktywacji kontroluje dostęp (logowanie może działać od razu, ale endpoint `login` powinien blokować `is_active=false` 403).
  - Uwagi: Jeżeli polityka MVP dopuszcza, można ustawiać `is_active=true` automatycznie; w przeciwnym wypadku aktywacja ręczna przez panel admina (`/api/users` istnieje) lub przyszły endpoint.
  - Konflikty: 409 gdy istnieje aktywny email w `public.users` lub konto Supabase.

- `POST /api/auth/password/reset-request`

  - Wejście: `{ email }`
  - Działanie: `auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + '/auth/reset-password' })`.
  - Zwraca zawsze `200` z neutralnym komunikatem.

- `GET /api/auth/me`
  - Działanie: na podstawie sesji (SSR cookies) pobiera `auth.user` (Supabase) i odpowiada z połączonym profilem `public.users` (bez pól wrażliwych). Gdy brak sesji – `401`.

Bezpieczeństwo i odporność:

- Rate limiting dla `/api/auth/login` i `/api/auth/register` (można dodać prosty licznik w pamięci przy MVP albo wykorzystać middleware na platformie docelowej).
- CSRF: żądania JSON POST z nagłówkiem `Content-Type: application/json`, tokeny auth są zarządzane przez Supabase (HttpOnly cookies w SSR). Dla UI akcji edycyjnych i tak weryfikujemy sesję po stronie serwera.

### 2.3. SSR i rendering stron

Konfiguracja (`astro.config.mjs`) już ma `output: 'server'` i `experimental: { session: true }`. Uzupełnienia:

- Dodanie klienta serwerowego `supabase.server.ts` (pakiet `@supabase/ssr`) z obsługą ciasteczek request/response.
- Zmiana `src/middleware/index.ts`: dla każdego żądania twórz klienta SSR, pobieraj `session` i `user` i ustawiaj `context.locals.auth = { session, user }` oraz `context.locals.supabase = serverClient`.
- Strony Astro (frontmatter) mogą odczytać `Astro.locals.auth.user` i przekazać do layoutu/komponentów. Dzięki temu header pokazuje poprawne przyciski, a strony mogą warunkowo renderować akcje edycyjne.

---

## 3. System autentykacji (Supabase + Astro)

### 3.1. Przepływy

- Rejestracja:

  1. Użytkownik wysyła formularz do `/api/auth/register`.
  2. Backend wywołuje `auth.signUp`, następnie tworzy profil w `public.users` z `role='club_board'` i `is_active=false` (lub `true` zgodnie z polityką MVP). Opcjonalnie wysyła mail potwierdzający.
  3. Po sukcesie UI kieruje do `/auth/login` z komunikatem.

- Logowanie:

  - Wariant SSR-first: POST `/api/auth/login` – backend loguje przez Supabase, ustawia cookies; UI redirectuje na poprzednią stronę.
  - Wariant client-first: `supabase.auth.signInWithPassword` w przeglądarce; middleware przy następnym żądaniu odczyta sesję i wypełni SSR.
  - Dodatkowy warunek: jeśli profil `is_active=false` → 403 i komunikat o braku aktywacji.

- Wylogowanie:

  - `POST /api/auth/logout` czyści SSR cookies i unieważnia tokeny; redirect do miejsca źródłowego.

- Odzyskiwanie hasła:
  1. `/auth/forgot-password`: `resetPasswordForEmail` z `redirectTo` ustawionym na `/auth/reset-password`.
  2. Po kliknięciu w link z maila użytkownik trafia na `/auth/reset-password` jako zalogowana sesja przejściowa; formularz ustawia nowe hasło przez `auth.updateUser({ password })`.
  3. Po sukcesie redirect do `/auth/login`.

### 3.2. Integracja z istniejącym kodem

- Klient Supabase:

  - `src/db/supabase.client.ts` – używany przez frontend (pozostaje).
  - Dodać `src/db/supabase.server.ts` – używany przez middleware i API routes do pracy na bazie i auth w SSR (obsługa cookies). Konfiguracja Vite/SSR: dodać `@supabase/ssr` do `noExternal`/`optimizeDeps` analogicznie do `@supabase/supabase-js`.

- Middleware `src/middleware/index.ts`:

  - Rozszerzyć o pobieranie `session`/`user` i wystawianie na `context.locals.auth`.
  - Typy: zaktualizować `src/env.d.ts` o `auth: { user: User | null; session: Session | null }` (typy z Supabase).

- UI:

  - `Layout.astro` – usuwa placeholder „Demo User”, wstawia przyciski zależne od `Astro.locals.auth.user`.
  - Strony z edycją (np. „+ Nowa wystawa”) – warunkowy render przycisków zależnie od `isAuthenticated`.
  - Komponenty reagujące na edycję (modale, akcje) – defensywny `AuthGuard` (np. jeśli brak sesji, przekierowanie do `/auth/login?redirect=<current>` lub pokazanie `PermissionDenied`).

- API użytkowników (`/api/users`) – pozostaje do zarządzania profilami (admin). Nie używamy już `password_hash` z `public.users` przy logowaniu – źródłem autentykacji jest Supabase Auth. W przyszłości do rozważenia: migracja i usunięcie pola.

### 3.3. Polityki bezpieczeństwa i RLS

- Rola `club_board` – jedna rola aplikacyjna; uprawnienia edycji kontrolowane w warstwie aplikacji oraz (docelowo) RLS.
- Dostęp do odczytu danych publicznych – bez wymogu logowania (zgodnie z US-002). Dane wrażliwe (np. dane właścicieli) mogą być maskowane dla niezalogowanych (już wspomniane w PRD jako „zblurowne dane właściciela”).
- RLS (docelowo):
  - Tabele operacyjne (shows, dogs, owners, registrations, evaluations) – odczyt publiczny ograniczony/maskowany, zapis tylko dla zalogowanych `club_board`.
  - W tym kroku nie modyfikujemy schematu (zgodnie z zasadami deklaratywnych migracji). Ewentualne RLS – osobny PR zgodnie z regułą `10x-dog-show/db-supabase-database-schema`.

---

## 4. Kontrakty i moduły (podsumowanie)

### 4.1. UI

- Strony Astro: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`.
- Komponenty React (client): `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `AuthGuard`.
- Layout: `Layout.astro` – stan nagłówka zależny od sesji.

Walidacja (frontend): `zod` schematy w komponentach lub wspólne w `src/lib/validation/authSchemas.ts`.

### 4.2. Backend

- Serwerowy klient Supabase: `src/db/supabase.server.ts` (`@supabase/ssr`).
- Middleware: `src/middleware/index.ts` – ustawia `locals.auth` i `locals.supabase` (server client).
- API:
  - `POST /api/auth/login` – logowanie (SSR cookies)
  - `POST /api/auth/logout` – wylogowanie
  - `POST /api/auth/register` – rejestracja + profil
  - `POST /api/auth/password/reset-request` – żądanie resetu
  - `GET /api/auth/me` – zwrot profilu bieżącego usera

Walidacja (backend): `src/lib/validation/authSchemas.ts` + istniejące DTO z `src/types.ts`.

### 4.3. Stany i nawigacja

- Po zalogowaniu: redirect do `redirect` z query lub `/`.
- Po rejestracji: redirect do `/auth/login` lub automatyczny login (konfigurowalne w MVP).
- Po reset password: redirect do `/auth/login` z komunikatem.
- Niezalogowany – pełny wgląd, bez edycji; zalogowany (`club_board`) – pełne akcje.

---

## 5. Niezmienność istniejącego zachowania

- Wszystkie aktualne widoki pozostają dostępne bez logowania (US-002). Dodajemy jedynie warunkowe renderowanie przycisków edycyjnych i poprawny nagłówek (login/logout).
- Istniejące API dla użytkowników (`/api/users`) działa jak dotąd; nowy moduł auth nie usuwa tego zasobu. Docelowe rozdzielenie odpowiedzialności: Supabase Auth – logowanie/hasła/sesje; `public.users` – profil i metadane (imię, nazwisko, rola, aktywność).

---

## 6. Wymagania konfiguracyjne i zależności

- ENV:
  - `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_KEY` – już w projekcie.
  - Dodać pakiet: `@supabase/ssr` (konieczny do SSR cookies). Konfiguracja `astro.config.mjs`: dodać do `optimizeDeps.include` i `ssr.noExternal` podobnie jak `@supabase/supabase-js`.
  - `supabase/config.toml`: `auth.site_url` już wskazuje na `http://127.0.0.1:3000`. Upewnić się, że redirect na `/auth/reset-password` jest dozwolony (jeśli wymagane, dopisać do `additional_redirect_urls`).

---

## 7. Scenariusze testowe (MVP)

- Rejestracja nowego użytkownika

  - Poprawne dane → profil utworzony, (opcja) email potwierdzający, możliwość logowania.
  - Zajęty email → 409.
  - Walidacja client/server – błędy inline i w odpowiedzi.

- Logowanie

  - Poprawne dane, aktywne konto → 200, redirect, nagłówek pokazuje użytkownika.
  - Nieprawidłowe dane → 401.
  - Konto nieaktywne → 403.

- Odzyskiwanie hasła

  - Żądanie resetu → 200 neutralne.
  - Ustawienie nowego hasła na stronie `/auth/reset-password` → 200 i redirect do `/auth/login`.

- Publiczny wgląd

  - Niezalogowany widzi listy i szczegóły, nie widzi akcji edycyjnych.

- Edycja po zalogowaniu
  - Zalogowany użytkownik widzi i wykonuje akcje tworzenia/edycji/usuwania bez blokad UI.

---

## 8. Ryzyka i mitigacje

- Rozjazd między `public.users` a Supabase Auth – w rejestracji tworzymy oba wpisy atomowo na jednym żądaniu; `is_active` kontroluje dostęp.
- SSR cookies bez `@supabase/ssr` – ryzyko niespójności nagłówka; rekomendowane dodanie zależności i klienta serwerowego.
- Brak RLS w tym kroku – edycję chroni aplikacja (UI + backend) i sesja; RLS można włączyć w kolejnym PR zgodnie z zasadami deklaratywnej bazy.

---

## 9. Plan wdrożenia (wysokopoziomowo)

1. Dodać `@supabase/ssr`, `src/db/supabase.server.ts`, rozszerzyć middleware i typy `env.d.ts`.
2. Dodać strony `/auth/*` i komponenty formularzy.
3. Dodać API `/api/auth/*` z walidacją `zod` i obsługą błędów zgodnie z `src/types.ts`.
4. Zmienić `Layout.astro` na dynamiczny nagłówek; ukryć/wyłączyć przyciski edycji na stronach publicznych.
5. Testy scenariuszy z sekcji 7.
