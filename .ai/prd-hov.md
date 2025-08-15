# Dokument wymagań produktu (PRD) - Klub Hovawarta Show

## 1. Przegląd produktu

Klub Hovawarta Show to aplikacja webowa służąca do archiwizacji i zarządzania wynikami wystaw klubowych psów rasy hovawart. Głównym celem jest stworzenie centralnej bazy danych z wynikami wszystkich wystaw klubowych, umożliwiającej zarządowi klubu łatwy dostęp do historycznych danych i statystyk.

### Kluczowe funkcjonalności MVP:

- System zarządzania wystawami klubowymi hovawartów
- CRUD operacje na ocenach psów z podstawowymi danymi
- Prosty system kont użytkowników (jedna rola - zarząd)
- Podstawowe statystyki wystaw
- Archiwizacja historycznych danych
- Responsywny design (wsparcie dla urządzeń mobilnych)

### Architektura:

- Aplikacja webowa oparta na istniejącej technologii (Astro + React + Supabase)
- Uproszczona baza danych PostgreSQL
- Bezpieczny system uwierzytelniania
- Możliwość rozszerzenia o dodatkowe funkcjonalności klubu

## 2. Problem użytkownika

### Główny problem:

Klub Hovawarta nie ma centralnego systemu do archiwizacji wyników wystaw klubowych. Obecnie dane są przechowywane w różnych formatach (papier, Excel, różne systemy), co utrudnia:

- Szybkie wyszukiwanie historycznych wyników
- Analizę statystyczną psów i wystaw
- Sprawdzanie osiągnięć konkretnych psów
- Tworzenie raportów dla zarządu klubu

### Użytkownicy dotknięci problemem:

- Zarząd Klubu Hovawarta - potrzebuje dostępu do wszystkich danych wystaw
- Organizatorzy wystaw klubowych - potrzebują systemu do wprowadzania wyników
- Hodowcy i właściciele psów - chcą sprawdzać historyczne wyniki

## 3. Wymagania funkcjonalne

### System zarządzania wystawami:

- Tworzenie, edycja i usuwanie wystaw klubowych
- Konfiguracja dat, lokalizacji i sędziów
- Status wystawy (planowana, w trakcie, zakończona)

### System zarządzania psami:

- Podstawowe dane identyfikacyjne psów (imię, rasa, płeć, data urodzenia, hodowla, numer chip, maść)
- Maści hovawarta:
  - Czarny
  - Czarny podpalany
  - Blond
- Dane właścicieli (imię, nazwisko, email, telefon)
- Historia udziału w wystawach

### System ocen i wyników:

- Standardowe oceny FCI w języku polskim:
  - Doskonała (excellent)
  - Bardzo dobra (very good)
  - Dobra (good)
  - Zadowalająca (satisfactory)
  - Zdyskwalifikowana (disqualified)
  - Nieobecna (absent)
- Klasy wiekowe (baby, puppy, junior, intermediate, open, working, champion, veteran)
- Tytuły klubowe:
  - Młodzieżowy Zwycięzca Klubu (Mł. Zw. Kl.)
  - Zwycięzca Klubu (Zw. Kl.)
  - Zwycięzca Klubu Weteranów (Zw. Kl. Wet.)
  - Najlepszy Reproduktor
  - Najlepsza Suka Hodowlana
  - Najlepsza Para
  - Najlepsza Hodowla
  - Zwycięzca Rasy (BOB, ZR)
  - Zwycięzca Płci Przeciwnej (BOS)
  - Najlepszy Junior
  - Najlepszy Weteran
- Lokaty (1st, 2nd, 3rd, 4th)

### System użytkowników:

- **Użytkownicy niezalogowani**: dostęp tylko do wglądu (tryb podglądu)
- **Użytkownicy zalogowani**: pełne uprawnienia z ograniczeniami statusu wystawy
- Jedna rola: zarząd klubu z pełnymi uprawnieniami
- Bezpieczne logowanie i wylogowanie
- Zarządzanie kontami użytkowników

### System uprawnień:

- **Użytkownik niezalogowany**: 
  - Przeglądanie wszystkich danych (wystawy, psy, właściciele)
  - Brak dostępu do funkcji edycji
  - Komunikat informacyjny o trybie podglądu

- **Użytkownik zalogowany**:
  - **Zawsze może zmieniać status wystawy** (niezależnie od obecnego statusu)
  - **Edycja wystawy**: tylko w statusie "SZKIC"
  - **Usuwanie wystawy**: tylko w statusie "SZKIC" i gdy brak zarejestrowanych psów
  - **Dodawanie psów**: tylko w statusie "SZKIC"
  - **Edycja psów**: tylko w statusie "SZKIC"
  - **Usuwanie psów**: tylko w statusie "SZKIC"

### System statystyk:

- Liczba psów w poszczególnych klasach na wystawie
- Statystyki ocen i tytułów klubowych
- Historia wyników konkretnego psa
- Podstawowe raporty wystaw
- Analiza tytułów klubowych (Mł. Zw. Kl., Zw. Kl., Zw. Kl. Wet., etc.)
- Statystyki hodowli i reproduktorów

## 4. Granice produktu

### Co wchodzi w MVP:

- Zarządzanie wystawami klubowymi hovawartów
- Rejestracja psów i właścicieli
- Wprowadzanie ocen i wyników wystaw z tytułami klubowymi
- Podstawowe statystyki i raporty
- System użytkowników (jedna rola)
- Responsywny interfejs (desktop + mobile)
- Walidacja zgodności ocen z tytułami klubowymi

### Co NIE wchodzi w MVP:

- Opisy psów (będą dodane w przyszłości)
- Integracja z systemami ZKwP
- Automatyczne wysyłanie emaili
- Zaawansowane raporty i eksporty
- System członkostwa
- Zarządzanie rodowodami
- System zawodów
- Zarządzanie szczeniętami
- **System płatności** (usunięty z MVP)
- **System ról użytkowników** (uproszczony do jednej roli)

## 5. Historyjki użytkownika

### US-001: Logowanie użytkownika

**Tytuł:** Jako członek zarządu klubu chcę się zalogować do systemu, aby uzyskać dostęp do danych wystaw
**Opis:** Użytkownik wprowadza email i hasło w formularzu logowania
**Kryteria akceptacji:**

- Formularz zawiera pola: email, hasło
- System weryfikuje poprawność danych logowania
- Po udanym logowaniu użytkownik jest przekierowany do dashboardu
- Sesja użytkownika jest utrzymywana przez określony czas

### US-002: Wgląd (Tryb podglądu)

**Tytuł:** Wgląd bez logowania

**Opis:** Jako użytkownik niezalogowany chcę móc oglądać i wyświetlać dane z aplikacji w trybie podglądu.

**Kryteria akceptacji:**

- Użytkownik może przeglądać wszystkie dane serwisu (wystawy, psy, właściciele)
- Funkcjonalność edycji nie jest dostępna bez logowania się do systemu
- Wyświetlany jest komunikat informacyjny o trybie podglądu
- Wszystkie przyciski edycji są ukryte dla użytkowników niezalogowanych
- Dostęp do danych jest ograniczony tylko do wglądu

### US-003: Bezpieczny dostęp i uwierzytelnianie

**Tytuł:** Bezpieczny dostęp z systemem uprawnień

**Opis:** Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych, z odpowiednim systemem uprawnień.

**Kryteria akceptacji:**

- Logowanie i rejestracja odbywają się na dedykowanych stronach.
- Logowanie wymaga podania adresu email i hasła.
- Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
- Użytkownik MOŻE korzystać z serwisu BEZ trybu edycji bez logowania się do systemu (US-002).
- Użytkownik NIE MOŻE korzystać z funkcji edycji bez logowania się do systemu.
- **System uprawnień dla zalogowanych użytkowników:**
  - Zawsze może zmieniać status wystawy (niezależnie od obecnego statusu)
  - Edycja wystawy tylko w statusie "SZKIC"
  - Usuwanie wystawy tylko w statusie "SZKIC" i gdy brak zarejestrowanych psów
  - Dodawanie/edycja/usuwanie psów tylko w statusie "SZKIC"
- Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
- Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
- Odzyskiwanie hasła powinno być możliwe.

### US-004: Tworzenie wystawy

**Tytuł:** Jako członek zarządu chcę utworzyć nową wystawę klubową, aby przygotować system na wprowadzanie wyników
**Opis:** Użytkownik wypełnia formularz z danymi wystawy
**Kryteria akceptacji:**

- Formularz zawiera pola: nazwa, data, lokalizacja, sędzia, opis
- Data wystawy może być w przeszłości (archiwizacja)
- Po utworzeniu wystawa jest widoczna na liście wystaw
- Możliwość edycji danych wystawy

### US-005: Dodawanie psa do systemu

**Tytuł:** Jako członek zarządu chcę dodać psa do systemu, aby móc rejestrować jego wyniki
**Opis:** Użytkownik wprowadza dane psa i jego właściciela
**Kryteria akceptacji:**

- Formularz zawiera dane psa: imię, płeć, data urodzenia, hodowla, chip
- Formularz zawiera dane właściciela: imię, nazwisko, email, telefon
- System waliduje poprawność danych
- Pies jest dostępny do rejestracji na wystawy

### US-006: Rejestracja psa na wystawę

**Tytuł:** Jako członek zarządu chcę zarejestrować psa na wystawę, aby móc wprowadzać jego wyniki
**Opis:** Użytkownik wybiera psa i przypisuje go do konkretnej klasy na wystawie
**Kryteria akceptacji:**

- Wybór psa z listy zarejestrowanych psów
- Automatyczne określenie klasy na podstawie wieku
- Możliwość ręcznej zmiany klasy
- Przypisanie numeru katalogowego

### US-007: Wprowadzanie oceny psa

**Tytuł:** Jako członek zarządu chcę wprowadzić ocenę psa, aby udokumentować wynik z wystawy
**Opis:** Użytkownik wprowadza ocenę, tytuł i lokatę dla psa
**Kryteria akceptacji:**

- Wybór oceny z listy standardowych ocen FCI w języku polskim
- Przypisanie tytułu klubowego (jeśli przyznany)
- Przypisanie lokaty (jeśli przyznana)
- Możliwość edycji przed finalizacją wystawy
- Walidacja zgodności oceny z przyznanym tytułem

### US-008: Przeglądanie wyników wystawy

**Tytuł:** Jako członek zarządu chcę przeglądać wyniki wystawy, aby sprawdzić wprowadzone dane
**Opis:** Użytkownik przegląda listę psów z wynikami na konkretnej wystawie
**Kryteria akceptacji:**

- Lista psów pogrupowana według klas
- Wyświetlanie ocen, tytułów i lokat
- Możliwość filtrowania i wyszukiwania
- Sortowanie według różnych kryteriów

### US-009: Historia wyników psa

**Tytuł:** Jako członek zarządu chcę sprawdzić historię wyników psa, aby przeanalizować jego osiągnięcia
**Opis:** Użytkownik przegląda wszystkie wyniki konkretnego psa z różnych wystaw
**Kryteria akceptacji:**

- Chronologiczna lista wszystkich wystaw psa
- Wyświetlanie ocen, tytułów i lokat
- Statystyki osiągnięć psa
- Możliwość eksportu historii

### US-010: Statystyki wystawy

**Tytuł:** Jako członek zarządu chcę zobaczyć statystyki wystawy, aby przeanalizować wyniki
**Opis:** Użytkownik przegląda statystyki liczby psów w klasach i rozkład ocen
**Kryteria akceptacji:**

- Liczba psów w poszczególnych klasach
- Rozkład ocen (doskonała, bardzo dobra, dobra, etc.)
- Liczba przyznanych tytułów klubowych
- Statystyki tytułów (Mł. Zw. Kl., Zw. Kl., Zw. Kl. Wet., etc.)
- Podstawowe wykresy i tabele

### US-011: Wyszukiwanie psów

**Tytuł:** Jako członek zarządu chcę wyszukać psa, aby szybko znaleźć jego dane
**Opis:** Użytkownik wyszukuje psa po imieniu, hodowli lub właścicielu
**Kryteria akceptacji:**

- Wyszukiwanie po imieniu psa
- Wyszukiwanie po nazwie hodowli
- Wyszukiwanie po danych właściciela
- Wyniki z podstawowymi informacjami

### US-012: Zarządzanie użytkownikami

**Tytuł:** Jako członek zarządu chcę zarządzać kontami użytkowników, aby kontrolować dostęp do systemu
**Opis:** Użytkownik dodaje, edytuje i usuwa konta użytkowników systemu
**Kryteria akceptacji:**

- Dodawanie nowych użytkowników
- Edycja danych użytkowników
- Dezaktywacja kont użytkowników
- Zmiana haseł

## 6. Metryki sukcesu

### Metryki adopcji:

- **Liczba wystaw w systemie** - cel: wszystkie wystawy klubowe z ostatnich 5 lat
- **Liczba psów w bazie** - cel: minimum 200 psów hovawart
- **Liczba aktywnych użytkowników** - cel: 100% członków zarządu

### Metryki jakościowe:

- **Dokładność danych** - cel: 0% błędów w danych wystaw
- **Czas wprowadzania wyników** - cel: <30 minut na wystawę
- **Satysfakcja użytkowników** - cel: >90% satysfakcji
- **Bezpieczeństwo dostępu** - cel: 100% kontroli uprawnień edycji

### Metryki techniczne:

- **Czas odpowiedzi systemu** - cel: <2 sekundy dla kluczowych operacji
- **Dostępność systemu** - cel: 99.9% uptime
- **Wsparcie urządzeń mobilnych** - cel: pełna funkcjonalność na smartfonach

## 7. Wymagania techniczne

### Architektura:

- **Frontend**: Astro z React komponentami (wykorzystanie istniejącego kodu)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS z shadcn/ui
- **Hosting**: Supabase (bez zmian)

### Baza danych:

- Uproszczony schemat PostgreSQL
- Tylko podstawowe tabele: users, shows, dogs, owners, evaluations
- Usunięcie złożonych relacji i schematów FCI
- Zachowanie możliwości rozszerzenia

### Bezpieczeństwo:

- Uwierzytelnianie przez Supabase Auth
- Row Level Security (RLS)
- Walidacja danych na poziomie aplikacji i bazy
- Backup danych

### Testowanie:

- **Testy jednostkowe**: Vitest z React Testing Library dla komponentów UI
- **Testy integracyjne**: Vitest dla API routes i middleware
- **Testy e2e**: Playwright dla pełnych scenariuszy użytkownika
- **Pokrycie kodu**: Minimalne 30% linii, 20% gałęzi dla MVP
- **Automatyzacja**: CI/CD pipeline z testami przed każdym PR

### Responsywność:

- Pełna funkcjonalność na desktop (1024px+)
- Zoptymalizowany interfejs na tabletach (768px-1024px)
- Funkcjonalność na smartfonach (320px-768px)

## 8. Plan rozwoju

### Faza 1 (MVP):

- Podstawowy system zarządzania wystawami
- CRUD operacje na psach i ocenach
- System użytkowników
- Podstawowe statystyki

### Faza 2 (Rozszerzenie):

- Opisy psów
- Zaawansowane raporty
- Eksport danych
- Integracja z systemami zewnętrznymi

### Faza 3 (Ekosystem klubu):

- System członkostwa
- Zarządzanie rodowodami
- System zawodów
- Zarządzanie szczeniętami

## 9. Ograniczenia i ryzyka

### Ograniczenia:

- Ręczne wprowadzanie wszystkich danych
- Brak integracji z systemami ZKwP
- Ograniczone raportowanie w MVP

### Ryzyka:

- Opór użytkowników przed zmianą procesów
- Błędy w ręcznym wprowadzaniu danych
- Problemy z migracją historycznych danych

### Strategie łagodzenia:

- Prosty i intuicyjny interfejs
- Walidacja danych na wielu poziomach
- Stopniowa migracja danych historycznych
- Szkolenia użytkowników

## 10. Kryteria akceptacji MVP

### Funkcjonalne:

- Możliwość tworzenia i zarządzania wystawami klubowymi
- Pełny CRUD dla psów, właścicieli i ocen
- System użytkowników z jedną rolą
- **System uprawnień oparty na autoryzacji i statusie wystawy**
- **Tryb podglądu dla użytkowników niezalogowanych**
- Podstawowe statystyki i raporty
- Responsywny interfejs

### Niefunkcjonalne:

- Czas odpowiedzi <2 sekundy
- Dostępność 99.9%
- Wsparcie dla urządzeń mobilnych
- Bezpieczne przechowywanie danych
- **Bezpieczeństwo**: Kontrola uprawnień edycji na podstawie autoryzacji i statusu
- **Jakość kodu**: Testy jednostkowe i integracyjne z Vitest
- **Stabilność**: Testy e2e z Playwright dla krytycznych ścieżek
- **Pokrycie testów**: 30% linii, 20% gałęzi minimum dla MVP

### Biznesowe:

- Wszystkie wystawy klubowe z ostatniego roku w systemie
- Minimum 50 psów w bazie danych
- 100% członków zarządu korzysta z systemu
- Pozytywne opinie użytkowników
