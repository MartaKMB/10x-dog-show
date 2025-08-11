<authentication_analysis>

1. Przepływy autentykacji (na bazie PRD i spec):

- Rejestracja: formularz → API rejestracji → Supabase signUp → profil w DB.
- Logowanie: formularz → API logowania (SSR-first) lub client-first.
- Wylogowanie: akcja → API wylogowania → unieważnienie sesji.
- Odzyskiwanie hasła: żądanie resetu → mail → reset hasła → login.
- Weryfikacja sesji (SSR): middleware czyta ciasteczka → locals.auth.
- Odświeżanie tokenu: SSR przez refresh token lub client auto-refresh.
- Ochrona akcji: API i UI sprawdzają sesję/rolę; publiczny wgląd bez loginu.

2. Aktorzy i interakcje:

- Przeglądarka: wysyła żądania, renderuje UI, wykonuje logowanie.
- Middleware: na każde żądanie tworzy kontekst sesji (locals.auth).
- Astro API: obsługuje logowanie, rejestrację, wylogowanie, me.
- Supabase Auth: weryfikuje dane, zarządza sesjami i tokenami.

3. Weryfikacja i odświeżanie tokenów:

- SSR: @supabase/ssr czyta i odświeża sesję na żądanie (HttpOnly).
- Client: supabase-js auto-odświeża access token w tle.
- Gdy refresh jest nieważny: czyszczenie sesji i wymuszenie logowania.

4. Kroki (skrót):

- Wejście na stronę: middleware ustala locals.auth → UI warunkowy.
- Logowanie: API logowania ustawia cookies → redirect → sesja SSR.
- Wylogowanie: API wylogowania czyści sesję → UI bez edycji.
- Reset hasła: żądanie maila → link → ustawienie nowego hasła.
- Token wygasł: SSR odświeża lub 401 i redirect; client odświeża w tle.
  </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
autonumber
participant B as "Przeglądarka"
participant M as "Middleware"
participant A as "Astro API"
participant S as "Supabase Auth"

%% Wejście na stronę i ustalenie sesji SSR
activate B
B->>M: Żądanie strony
activate M
M->>M: Odczyt cookies sesji (SSR)
alt Sesja aktywna
  M-->B: locals.auth = { user, session }
else Brak sesji
  M-->B: locals.auth = null
end
M->>B: Render strony (SSR)
deactivate M
deactivate B

%% Logowanie (wariant SSR-first)
B->>A: POST: logowanie (email, hasło)
activate A
A->>S: Weryfikacja danych (signIn)
activate S
S-->>A: Sesja (access, refresh)
deactivate S
A->>A: Ustaw cookies HttpOnly (SSR)
A-->>B: 200 + dane użytkownika
deactivate A
B->>M: Odświeżenie/nawigacja po loginie
activate M
M->>M: Odczyt sesji z cookies
M-->B: locals.auth wypełnione
deactivate M

alt Dane nieprawidłowe
  A-->>B: 401 "Nieprawidłowy email lub hasło"
else Konto nieaktywne
  A-->>B: 403 "Konto nieaktywne"
end

%% Rejestracja
B->>A: POST: rejestracja (email, hasło, profil)
activate A
A->>S: signUp (utwórz konto)
S-->>A: Użytkownik utworzony
A->>A: Utwórz profil w DB (users)
A-->>B: 200 "Konto utworzone"
deactivate A
B->>B: Redirect do logowania

%% Wylogowanie
B->>A: POST: wylogowanie
activate A
A->>S: SignOut (unieważnij sesję)
S-->>A: OK
A->>A: Wyczyść cookies (SSR)
A-->>B: 200 "Wylogowano"
deactivate A
B->>M: Nawigacja po wylogowaniu
M-->B: locals.auth = null

%% Odświeżanie tokenu i wygaśnięcie
par Żądanie SSR z wygasłym access
  B->>M: Żądanie zasobu/strony
  activate M
  M->>M: Sprawdź ważność tokenu
  alt Access wygasł, refresh OK
    M->>S: Odśwież token (refresh)
    S-->>M: Nowy access token
    M-->>B: 200, kontynuuj
  else Refresh niepoprawny
    M->>M: Usuń sesję
    M-->>B: 401 → przenieś do logowania
  end
  deactivate M
and Auto-refresh w kliencie
  B->>B: supabase-js odświeża token w tle
end

%% Ochrona akcji edycyjnych (API)
B->>A: Żądanie akcji edycyjnej
activate A
A->>A: Sprawdź sesję/rolę (SSR)
alt Autoryzowany (club_board)
  A-->>B: 200, wykonano akcję
else Brak autoryzacji
  A-->>B: 401/403, komunikat
end
deactivate A

Note over B,A: UI ukrywa/wyłącza akcje edycji
Note over M,B: locals.auth steruje nagłówkiem i dostępem
```

</mermaid_diagram>
