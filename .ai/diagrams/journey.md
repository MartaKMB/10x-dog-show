<user_journey_analysis>
1) Ścieżki użytkownika (PRD + spec):
- Przeglądanie bez logowania (US-002): dostęp do list i szczegółów, brak edycji.
- Logowanie (US-001/US-003): przejście na stronę logowania, autoryzacja, powrót.
- Rejestracja (US-003): utworzenie konta, ewentualna aktywacja, przejście do logowania.
- Odzyskiwanie hasła (US-003): żądanie resetu → mail → ustawienie nowego hasła.
- Edycja po zalogowaniu (US-003): dostęp do tworzenia/edycji/usuwania.
- Wylogowanie: powrót do trybu przeglądania bez edycji.

2) Główne podróże i stany:
- NieZalogowany → PrzeglądaniePubliczne → (Login | Rejestracja | ResetHasła)
- Zalogowany (club_board) → PrzeglądanieZMożliwościąEdycji → AkcjeEdycyjne
- Wylogowanie → powrót do NieZalogowany

3) Punkty decyzyjne i alternatywy:
- Logowanie: poprawne dane vs błąd vs konto nieaktywne.
- Rejestracja: email zajęty vs sukces.
- Reset hasła: token poprawny vs niepoprawny/wygaśnięty.
- Akcje edycyjne: autoryzowany vs brak uprawnień.

4) Cel stanów (skrót):
- NieZalogowany: swobodny wgląd, CTA do logowania/rejestracji.
- PrzeglądaniePubliczne: nawigacja po danych, akcje edycyjne ukryte.
- FormularzLogowania/Rejestracji/Resetu: zebranie danych i walidacja.
- Zalogowany: pełen dostęp do akcji edycyjnych `club_board`.
- AkcjeEdycyjne: wykonywanie zmian w danych.
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2

[*] --> StronaGlowna
StronaGlowna: Wejście do aplikacji
StronaGlowna --> PrzegladaniePubliczne

state "Autentykacja" as Autentykacja {
  [*] --> FormularzLogowania
  FormularzLogowania: Użytkownik podaje email i hasło
  FormularzLogowania --> WalidacjaLogowania: Wyślij formularz
  WalidacjaLogowania --> if_login <<choice>>
  if_login --> Zalogowany: Dane poprawne
  if_login --> FormularzLogowania: Dane błędne
  if_login --> KontoNieaktywne: Konto nieaktywne
  KontoNieaktywne --> FormularzLogowania: Powrót po informacji

  FormularzLogowania --> FormularzRejestracji: Przejdź do rejestracji
  FormularzLogowania --> FormularzResetHasla: Zapomniałem hasła

  state "Rejestracja" as Rejestracja {
    [*] --> FormularzRejestracji
    FormularzRejestracji: Email, hasło, potwierdzenie, imię, nazwisko
    FormularzRejestracji --> WalidacjaRejestracji: Wyślij formularz
    WalidacjaRejestracji --> if_reg <<choice>>
    if_reg --> InfoAktywacja: Konto utworzone
    if_reg --> FormularzRejestracji: Email zajęty / błędy
    InfoAktywacja --> FormularzLogowania: Przejdź do logowania
  }

  state "Reset Hasła" as ResetHasla {
    [*] --> FormularzResetHasla
    FormularzResetHasla: Podaj email do resetu
    FormularzResetHasla --> InfoResetMail: Wyślij żądanie
    InfoResetMail: "Jeśli email istnieje, wysłaliśmy instrukcje"
    InfoResetMail --> LinkZMaila: Użytkownik klika link resetu
    LinkZMaila --> UstawNoweHaslo: Formularz nowego hasła
    UstawNoweHaslo --> if_reset <<choice>>
    if_reset --> FormularzLogowania: Hasło ustawione
    if_reset --> UstawNoweHaslo: Token błędny/wygaśnięty
  }
}

PrzegladaniePubliczne: Listy, szczegóły, statystyki (bez edycji)
PrzegladaniePubliczne --> Autentykacja: Kliknij "Zaloguj"
PrzegladaniePubliczne --> FormularzRejestracji: Kliknij "Zarejestruj"

Zalogowany: Użytkownik `club_board`
Zalogowany --> PanelEdycji
PanelEdycji: Strony z akcjami edycji
PanelEdycji --> if_edit <<choice>>
if_edit --> SukcesEdycji: Uprawniony i walidacja OK
if_edit --> BrakUprawnien: Brak autoryzacji
SukcesEdycji --> PanelEdycji
BrakUprawnien --> PanelEdycji

Zalogowany --> PrzegladanieZMożliwosciaEdycji
PrzegladanieZMożliwosciaEdycji: Widok jak publiczny + przyciski edycji
PrzegladanieZMożliwosciaEdycji --> Autentykacja: Zmień hasło / odśwież sesję

Zalogowany --> Wylogowanie: Kliknij "Wyloguj"
Wylogowanie: Usunięcie sesji i cookies
Wylogowanie --> PrzegladaniePubliczne

PrzegladaniePubliczne --> [*]
```
</mermaid_diagram>
