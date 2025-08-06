# Architektura UI dla Klub Hovawarta Show

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika dla Klub Hovawarta Show opiera się na prostym, intuicyjnym systemie zarządzania wystawami klubowymi hovawartów. Aplikacja wykorzystuje istniejącą technologię (Astro + React + Supabase) z responsywnym designem wspierającym urządzenia desktop i mobilne.

Główna struktura składa się z:
- **Systemu uwierzytelniania** - bezpieczny dostęp dla członków zarządu klubu
- **Dashboardu** - centralny punkt dostępu do wszystkich funkcji
- **Modułów zarządzania** - wystawy, psy, właściciele, oceny, użytkownicy
- **Systemu nawigacji** - intuicyjne poruszanie się między sekcjami
- **Komponentów wspólnych** - spójne elementy UI w całej aplikacji

## 2. Lista widoków

### 2.1 Authentication Views

#### Login Page
- **Ścieżka**: `/auth/login`
- **Główny cel**: Bezpieczne uwierzytelnienie użytkowników zarządu klubu
- **Kluczowe informacje**: Formularz logowania z walidacją
- **Kluczowe komponenty**: LoginForm, ErrorDisplay, LoadingSpinner
- **UX/Dostępność/Bezpieczeństwo**: 
  - Walidacja w czasie rzeczywistym
  - Obsługa błędów uwierzytelniania
  - Bezpieczne przechowywanie sesji
  - Wsparcie dla klawiatury i screen readerów

### 2.2 Dashboard/Home

#### Main Dashboard
- **Ścieżka**: `/`
- **Główny cel**: Centralny punkt dostępu do wszystkich funkcji systemu
- **Kluczowe informacje**: 
  - Statystyki systemu (liczba wystaw, psów, właścicieli)
  - Ostatnie wystawy
  - Szybkie akcje (dodaj wystawę, dodaj psa)
  - Powiadomienia o ważnych wydarzeniach
- **Kluczowe komponenty**: StatsCards, RecentShows, QuickActions, Notifications
- **UX/Dostępność/Bezpieczeństwo**:
  - Szybki dostęp do najczęściej używanych funkcji
  - Responsywny layout
  - Czytelne statystyki z ikonami

### 2.3 Shows Management

#### Shows List
- **Ścieżka**: `/shows`
- **Główny cel**: Przeglądanie i zarządzanie wszystkimi wystawami klubowymi
- **Kluczowe informacje**:
  - Lista wystaw z podstawowymi danymi
  - Status wystawy (draft, open_for_registration, in_progress, completed)
  - Liczba zarejestrowanych psów
  - Data wystawy i deadline rejestracji
- **Kluczowe komponenty**: ShowsTable, ShowFilters, ShowStatusBadge, Pagination
- **UX/Dostępność/Bezpieczeństwo**:
  - Filtrowanie po statusie, dacie, lokalizacji
  - Sortowanie według różnych kryteriów
  - Szybkie akcje (edycja, usuwanie, zmiana statusu)

#### Show Details
- **Ścieżka**: `/shows/[showId]`
- **Główny cel**: Szczegółowy przegląd konkretnej wystawy z możliwością zarządzania
- **Kluczowe informacje**:
  - Pełne dane wystawy
  - Statystyki rejestracji i ocen
  - Lista zarejestrowanych psów
  - Lista ocen
  - Szybkie akcje
- **Kluczowe komponenty**: ShowHeader, ShowStats, RegistrationsList, EvaluationsList, ShowActions
- **UX/Dostępność/Bezpieczeństwo**:
  - Sekcje z możliwością zwijania/rozwijania
  - Szybkie przejścia do rejestracji i ocen
  - Walidacja możliwości edycji (tylko przed rozpoczęciem wystawy)

#### Show Creator/Editor
- **Ścieżka**: `/shows/new`, `/shows/[showId]/edit`
- **Główny cel**: Tworzenie i edycja danych wystawy
- **Kluczowe informacje**: Formularz z wszystkimi polami wystawy
- **Kluczowe komponenty**: ShowForm, FormValidation, SaveConfirmation
- **UX/Dostępność/Bezpieczeństwo**:
  - Walidacja w czasie rzeczywistym
  - Podgląd przed zapisem
  - Obsługa błędów walidacji
  - Automatyczne zapisywanie wersji roboczych

#### Show Statistics
- **Ścieżka**: `/shows/[showId]/stats`
- **Główny cel**: Szczegółowe statystyki wystawy
- **Kluczowe informacje**:
  - Rozkład psów według klas i płci
  - Statystyki ocen
  - Statystyki tytułów klubowych
  - Wykresy i tabele
- **Kluczowe komponenty**: StatsCharts, StatsTables, ExportOptions
- **UX/Dostępność/Bezpieczeństwo**:
  - Interaktywne wykresy
  - Możliwość eksportu danych
  - Responsywne wykresy

### 2.4 Dogs Management

#### Dogs List
- **Ścieżka**: `/dogs`
- **Główny cel**: Przeglądanie i zarządzanie psami w systemie
- **Kluczowe informacje**:
  - Lista psów z podstawowymi danymi
  - Informacje o właścicielach
  - Liczba wystaw psa
  - Ostatnie oceny
- **Kluczowe komponenty**: DogsTable, DogFilters, DogSearch, Pagination
- **UX/Dostępność/Bezpieczeństwo**:
  - Zaawansowane filtrowanie (płeć, hodowla, właściciel)
  - Wyszukiwanie po imieniu, chip, hodowli
  - Szybkie przejście do historii psa

#### Dog Details
- **Ścieżka**: `/dogs/[dogId]`
- **Główny cel**: Szczegółowy przegląd psa z historią wystaw
- **Kluczowe informacje**:
  - Pełne dane psa
  - Dane właścicieli
  - Historia wystaw z ocenami
  - Statystyki osiągnięć
- **Kluczowe komponenty**: DogHeader, DogInfo, DogHistory, DogStats
- **UX/Dostępność/Bezpieczeństwo**:
  - Chronologiczna lista wystaw
  - Filtrowanie historii
  - Eksport historii psa

#### Dog Creator/Editor
- **Ścieżka**: `/dogs/new`, `/dogs/[dogId]/edit`
- **Główny cel**: Tworzenie i edycja danych psa
- **Kluczowe informacje**: Formularz z danymi psa i właścicieli
- **Kluczowe komponenty**: DogForm, OwnerSelector, FormValidation
- **UX/Dostępność/Bezpieczeństwo**:
  - Walidacja wieku i klasy
  - Sprawdzanie unikalności chip
  - Automatyczne obliczanie klasy na podstawie wieku

### 2.5 Owners Management

#### Owners List
- **Ścieżka**: `/owners`
- **Główny cel**: Zarządzanie właścicielami psów
- **Kluczowe informacje**:
  - Lista właścicieli z danymi kontaktowymi
  - Status GDPR
  - Liczba psów
  - Nazwa hodowli
- **Kluczowe komponenty**: OwnersTable, OwnerFilters, GDPRStatusBadge, Pagination
- **UX/Dostępność/Bezpieczeństwo**:
  - Filtrowanie po statusie GDPR
  - Wyszukiwanie po nazwisku, email, hodowli
  - Szybkie zarządzanie zgodą GDPR

#### Owner Details
- **Ścieżka**: `/owners/[ownerId]`
- **Główny cel**: Szczegółowy przegląd właściciela z listą psów
- **Kluczowe informacje**:
  - Pełne dane właściciela
  - Lista psów
  - Historia zgod GDPR
  - Dane kontaktowe
- **Kluczowe komponenty**: OwnerHeader, OwnerInfo, OwnerDogs, GDPRHistory
- **UX/Dostępność/Bezpieczeństwo**:
  - Szybkie zarządzanie zgodą GDPR
  - Linki do psów właściciela
  - Bezpieczne przechowywanie danych osobowych

#### Owner Creator/Editor
- **Ścieżka**: `/owners/new`, `/owners/[ownerId]/edit`
- **Główny cel**: Tworzenie i edycja danych właściciela
- **Kluczowe informacje**: Formularz z danymi osobowymi i GDPR
- **Kluczowe komponenty**: OwnerForm, GDPRConsent, FormValidation
- **UX/Dostępność/Bezpieczeństwo**:
  - Obowiązkowa zgoda GDPR
  - Walidacja danych kontaktowych
  - Bezpieczne przechowywanie danych

### 2.6 Show Registrations

#### Registrations List
- **Ścieżka**: `/shows/[showId]/registrations`
- **Główny cel**: Zarządzanie rejestracjami psów na wystawę
- **Kluczowe informacje**:
  - Lista zarejestrowanych psów
  - Klasy psów
  - Numery katalogowe
  - Status rejestracji
- **Kluczowe komponenty**: RegistrationsTable, RegistrationFilters, CatalogNumbers, RegistrationActions
- **UX/Dostępność/Bezpieczeństwo**:
  - Filtrowanie po klasach
  - Automatyczne generowanie numerów katalogowych
  - Walidacja limitów rejestracji

#### Registration Creator
- **Ścieżka**: `/shows/[showId]/registrations/new`
- **Główny cel**: Rejestracja psa na wystawę
- **Kluczowe informacje**: Wybór psa i klasy
- **Kluczowe komponenty**: DogSelector, ClassSelector, RegistrationForm
- **UX/Dostępność/Bezpieczeństwo**:
  - Automatyczne określanie klasy na podstawie wieku
  - Sprawdzanie dostępności psa
  - Walidacja limitów wystawy

### 2.7 Evaluations Management

#### Evaluations List
- **Ścieżka**: `/shows/[showId]/evaluations`
- **Główny cel**: Zarządzanie ocenami psów na wystawie
- **Kluczowe informacje**:
  - Lista ocen z psami
  - Oceny, tytuły klubowe, lokaty
  - Status oceny
- **Kluczowe komponenty**: EvaluationsTable, EvaluationFilters, GradeBadge, TitleBadge
- **UX/Dostępność/Bezpieczeństwo**:
  - Filtrowanie po ocenach i tytułach
  - Walidacja zgodności ocen z tytułami
  - Szybkie wprowadzanie ocen

#### Evaluation Creator/Editor
- **Ścieżka**: `/shows/[showId]/evaluations/new`, `/shows/[showId]/evaluations/[evaluationId]/edit`
- **Główny cel**: Wprowadzanie i edycja ocen psów
- **Kluczowe informacje**: Formularz oceny z walidacją
- **Kluczowe komponenty**: EvaluationForm, GradeSelector, TitleSelector, ValidationRules
- **UX/Dostępność/Bezpieczeństwo**:
  - Walidacja zgodności ocen z tytułami
  - Sprawdzanie unikalności tytułów
  - Automatyczne obliczanie lokat

### 2.8 Users Management

#### Users List
- **Ścieżka**: `/users`
- **Główny cel**: Zarządzanie użytkownikami systemu (tylko dla zarządu)
- **Kluczowe informacje**:
  - Lista użytkowników
  - Status aktywności
  - Role użytkowników
- **Kluczowe komponenty**: UsersTable, UserStatusBadge, UserActions
- **UX/Dostępność/Bezpieczeństwo**:
  - Tylko dla użytkowników z rolą club_board
  - Bezpieczne zarządzanie kontami
  - Soft delete użytkowników

#### User Creator/Editor
- **Ścieżka**: `/users/new`, `/users/[userId]/edit`
- **Główny cel**: Tworzenie i edycja kont użytkowników
- **Kluczowe informacje**: Formularz danych użytkownika
- **Kluczowe komponenty**: UserForm, PasswordGenerator, RoleSelector
- **UX/Dostępność/Bezpieczeństwo**:
  - Bezpieczne zarządzanie hasłami
  - Walidacja uprawnień
  - Historia zmian

## 3. Mapa podróży użytkownika

### 3.1 Główny przepływ użytkownika

1. **Logowanie** (`/auth/login`)
   - Wprowadzenie email i hasła
   - Walidacja danych
   - Przekierowanie do dashboardu

2. **Dashboard** (`/`)
   - Przegląd statystyk systemu
   - Szybkie akcje (dodaj wystawę, dodaj psa)
   - Przejście do konkretnych sekcji

3. **Zarządzanie wystawą** (`/shows` → `/shows/[showId]`)
   - Lista wystaw
   - Szczegóły wystawy
   - Zarządzanie rejestracjami i ocenami

4. **Zarządzanie psami** (`/dogs` → `/dogs/[dogId]`)
   - Lista psów
   - Szczegóły psa
   - Historia wystaw psa

5. **Zarządzanie właścicielami** (`/owners` → `/owners/[ownerId]`)
   - Lista właścicieli
   - Szczegóły właściciela
   - Zarządzanie zgodą GDPR

### 3.2 Szczegółowe przepływy

#### Tworzenie nowej wystawy
1. Dashboard → "Dodaj wystawę"
2. Formularz tworzenia wystawy
3. Zapisywanie wystawy
4. Przekierowanie do szczegółów wystawy
5. Zarządzanie rejestracjami
6. Wprowadzanie ocen

#### Rejestracja psa na wystawę
1. Szczegóły wystawy → "Dodaj rejestrację"
2. Wybór psa z listy
3. Automatyczne określenie klasy
4. Potwierdzenie rejestracji
5. Powrót do listy rejestracji

#### Wprowadzanie ocen
1. Szczegóły wystawy → "Oceny"
2. Lista zarejestrowanych psów
3. Wprowadzanie oceny dla każdego psa
4. Walidacja zgodności ocen z tytułami
5. Finalizacja wystawy

## 4. Układ i struktura nawigacji

### 4.1 Główna nawigacja

**Sidebar Navigation** (desktop) / **Top Navigation** (mobile):
- Dashboard (ikona: home)
- Wystawy (ikona: calendar)
- Psy (ikona: paw)
- Właściciele (ikona: users)
- Użytkownicy (ikona: settings) - tylko dla admin
- Wyloguj (ikona: logout)

### 4.2 Breadcrumbs

Każda strona zawiera breadcrumbs pokazujące hierarchię:
- Dashboard > Wystawy > Wystawa 2024 > Rejestracje
- Dashboard > Psy > Hovawart z Przykładu > Historia

### 4.3 Quick Actions

**Dashboard Quick Actions:**
- Dodaj wystawę
- Dodaj psa
- Dodaj właściciela
- Przejdź do ostatniej wystawy

**Context Quick Actions:**
- W szczegółach wystawy: Dodaj rejestrację, Wprowadź oceny
- W szczegółach psa: Dodaj do wystawy, Historia
- W szczegółach właściciela: Dodaj psa, Zarządzaj GDPR

### 4.4 Search i Filtry

**Global Search** (w headerze):
- Wyszukiwanie psów, właścicieli, wystaw
- Szybkie przejście do wyników

**Filtry kontekstowe:**
- Filtry w listach (status, data, klasa, etc.)
- Zaawansowane opcje filtrowania
- Zapisywanie preferowanych filtrów

## 5. Kluczowe komponenty

### 5.1 Komponenty uwierzytelniania
- **LoginForm**: Formularz logowania z walidacją
- **AuthGuard**: Ochrona tras wymagających uwierzytelnienia
- **UserMenu**: Menu użytkownika z opcjami wylogowania

### 5.2 Komponenty danych
- **DataTable**: Uniwersalna tabela z paginacją, sortowaniem, filtrami
- **DataCard**: Karty z danymi dla widoków szczegółowych
- **DataList**: Lista elementów z akcjami
- **Pagination**: Nawigacja stron z opcjami

### 5.3 Komponenty formularzy
- **FormField**: Uniwersalne pole formularza z walidacją
- **FormSection**: Sekcje formularza z możliwością zwijania
- **FormActions**: Przyciski akcji formularza
- **ValidationMessage**: Komunikaty błędów walidacji

### 5.4 Komponenty statusów
- **StatusBadge**: Badge statusu (wystawa, użytkownik, GDPR)
- **GradeBadge**: Badge oceny z kolorami
- **TitleBadge**: Badge tytułu klubowego
- **ProgressIndicator**: Wskaźnik postępu

### 5.5 Komponenty akcji
- **ActionButton**: Przycisk akcji z ikoną
- **ActionMenu**: Menu z opcjami akcji
- **ConfirmationDialog**: Dialog potwierdzenia akcji
- **QuickActionCard**: Karta szybkiej akcji

### 5.6 Komponenty statystyk
- **StatsCard**: Karta ze statystyką
- **StatsChart**: Wykres statystyk
- **StatsTable**: Tabela statystyk
- **TrendIndicator**: Wskaźnik trendu

### 5.7 Komponenty nawigacji
- **Sidebar**: Boczne menu nawigacji
- **Breadcrumbs**: Ścieżka nawigacji
- **TabNavigation**: Nawigacja zakładek
- **BackButton**: Przycisk powrotu

### 5.8 Komponenty wspólne
- **LoadingSpinner**: Wskaźnik ładowania
- **ErrorBoundary**: Obsługa błędów
- **EmptyState**: Stan pustej listy
- **SearchInput**: Pole wyszukiwania
- **FilterPanel**: Panel filtrów
- **NotificationToast**: Powiadomienia
- **Modal**: Modalne okna
- **Tooltip**: Podpowiedzi

### 5.9 Komponenty specyficzne dla domeny
- **DogCard**: Karta psa z podstawowymi danymi
- **ShowCard**: Karta wystawy
- **OwnerCard**: Karta właściciela
- **EvaluationRow**: Wiersz oceny
- **RegistrationRow**: Wiersz rejestracji
- **GDPRConsentForm**: Formularz zgody GDPR
- **ClassAgeCalculator**: Kalkulator klasy na podstawie wieku
- **TitleValidator**: Walidator tytułów klubowych 
