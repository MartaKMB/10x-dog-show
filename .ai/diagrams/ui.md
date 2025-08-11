<architecture_analysis>

1. Komponenty (wg PRD i spec):

- Strony: "Strona Logowania", "Strona Rejestracji",
  "Przypomnienie Hasła", "Reset Hasła".
- Layout: `src/layouts/Layout.astro` (nagłówek z Login/Logout,
  stan sesji z SSR).
- Publiczne strony: lista/szczegóły wystaw, psy, właściciele,
  statystyki, dashboard (wgląd bez logowania; edycja wymagająca
  autoryzacji).
- Komponenty React (auth): `LoginForm.tsx`, `RegisterForm.tsx`,
  `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, `AuthGuard.tsx`.
- Wspierające: `PermissionDenied.tsx` (UI dla braku uprawnień).
- Klienci/Sesja: `db/supabase.client.ts` (client),
  `db/supabase.server.ts` (SSR, nowy), `middleware/index.ts`
  (ustawia `locals.auth` i `locals.supabase`).
- Walidacja: `src/lib/validation/authSchemas.ts` (nowy, Zod).
- API (Astro): Auth: Login/Logout/Register/ResetRequest/Me (nowe),
  istniejące: Users/Shows/Dogs/Owners.

2. Główne strony i komponenty:

- Layout + Nawigacja (Login/Logout).
- Strony auth montujące odpowiednie formularze React.
- Strony publiczne przekazujące `isAuthenticated`, `userRole` do
  komponentów edycyjnych i stosujące `AuthGuard`/`PermissionDenied`.

3. Przepływ danych:

- Formularze auth -> `supabase-js` (client-first) lub API (SSR-first).
- Middleware (SSR) wypełnia `locals.auth`; Layout i strony czytają
  stan i renderują odpowiedni UI.
- Strony publiczne korzystają z API domenowych (shows/dogs/owners),
  a akcje edycyjne są chronione przez `AuthGuard` i stan sesji.

4. Opisy funkcjonalności:

- `LoginForm`/`RegisterForm`/`ForgotPasswordForm`/`ResetPasswordForm`:
  walidacja Zod, obsługa błędów UX, integracja auth.
- `AuthGuard`: defensywna ochrona akcji edycyjnych.
- `Layout.astro`: przełącznik Login/Logout, pokazuje użytkownika.
- `middleware` + `supabase.server`: spójna sesja SSR dla UI.
  </architecture_analysis>

<mermaid_diagram>

```mermaid
flowchart TD

subgraph UI["Warstwa UI (Astro + React)"]
  LAYOUT["Layout.astro"]:::updated
  NAV["Nawigacja / Header"]:::updated
  LAYOUT --> NAV

  subgraph AUTH_PAGES["Strony: autentykacja"]
    PAGE_LOGIN["Strona Logowania"]:::new
    PAGE_REGISTER["Strona Rejestracji"]:::new
    PAGE_FORGOT["Przypomnienie Hasła"]:::new
    PAGE_RESET["Reset Hasła"]:::new
  end

  subgraph PUBLIC_PAGES["Strony publiczne"]
    PAGE_HOME["Strona Główna"]
    PAGE_SHOWS["Lista Wystaw"]:::updated
    PAGE_SHOW_DETAILS["Szczegóły Wystawy"]:::updated
    PAGE_DOGS["Lista Psów"]:::updated
    PAGE_OWNERS["Lista Właścicieli"]:::updated
    PAGE_STATS["Statystyki"]:::updated
    PAGE_DASH["Panel"]:::updated
  end

  subgraph AUTH_COMPONENTS["Komponenty React (auth)"]
    C_LOGIN["LoginForm.tsx"]:::new
    C_REGISTER["RegisterForm.tsx"]:::new
    C_FORGOT["ForgotPasswordForm.tsx"]:::new
    C_RESET["ResetPasswordForm.tsx"]:::new
    C_GUARD["AuthGuard.tsx"]:::new
    C_DENIED["PermissionDenied.tsx"]
  end
end

subgraph STATE["Stan i klienci"]
  SSR_MW["middleware/index.ts\nlocals.auth"]:::updated
  SB_CLIENT["db/supabase.client.ts\n(client)"]
  SB_SERVER["db/supabase.server.ts\n(SSR)"]:::new
  ZOD["lib/validation/authSchemas.ts"]:::new
end

subgraph API["API (Astro pages/api)"]
  API_LOGIN["API Auth: Login"]:::new
  API_LOGOUT["API Auth: Logout"]:::new
  API_REGISTER["API Auth: Register"]:::new
  API_RESET["API Auth: Reset request"]:::new
  API_ME["API Auth: Me"]:::new
  API_SHOWS["API: Shows"]
  API_DOGS["API: Dogs"]
  API_OWNERS["API: Owners"]
end

%% Montowanie formularzy na stronach auth
PAGE_LOGIN --> C_LOGIN
PAGE_REGISTER --> C_REGISTER
PAGE_FORGOT --> C_FORGOT
PAGE_RESET --> C_RESET

%% Relacje Layout ↔ Strony
LAYOUT --> AUTH_PAGES
LAYOUT --> PUBLIC_PAGES

%% SSR: middleware dostarcza stan do Layout/Stron
SSR_MW --> LAYOUT
SSR_MW --> PUBLIC_PAGES
LAYOUT -- "props: isAuthenticated\nuserRole" --> PUBLIC_PAGES

%% Integracje formularzy
C_LOGIN -- "signIn (client-first)" --> SB_CLIENT
C_LOGIN -- "lub: POST" --> API_LOGIN
C_REGISTER --> API_REGISTER
C_FORGOT --> API_RESET
C_RESET -- "updateUser" --> SB_CLIENT
C_LOGIN -. "schematy Zod" .-> ZOD
C_REGISTER -. "schematy Zod" .-> ZOD
C_FORGOT -. "schematy Zod" .-> ZOD
C_RESET -. "schematy Zod" .-> ZOD

%% API ↔ SSR klient
API_LOGIN --> SB_SERVER
API_LOGOUT --> SB_SERVER
API_REGISTER --> SB_SERVER
API_ME --> SB_SERVER

%% Ochrona edycji na stronach publicznych
C_GUARD -. "sprawdza sesję" .-> PUBLIC_PAGES
PUBLIC_PAGES -. "brak dostępu" .-> C_DENIED

%% Domenowe API
PUBLIC_PAGES --> API_SHOWS
PUBLIC_PAGES --> API_DOGS
PUBLIC_PAGES --> API_OWNERS

%% Nawigacja użytkownika
NAV -- "Login/Logout" --> AUTH_PAGES
NAV -- "stan sesji" --> LAYOUT

classDef new fill:#DFF7DF,stroke:#2E7D32,stroke-width:1px;
classDef updated fill:#FFF4E5,stroke:#E65100,stroke-width:1px;
```

</mermaid_diagram>
