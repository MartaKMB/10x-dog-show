# Plan implementacji widoku Lista Właścicieli

## 1. Przegląd

Widok Lista Właścicieli to główny interfejs do zarządzania bazą właścicieli psów w systemie 10x Dog Show. Umożliwia przeglądanie, wyszukiwanie, filtrowanie oraz wykonywanie operacji CRUD na właścicielach psów z uwzględnieniem zgodności RODO. Widok obsługuje śledzenie zgód na przetwarzanie danych, historię komunikacji oraz automatyczne planowanie usuwania danych zgodnie z polityką prywatności.

## 2. Routing widoku

**Ścieżka:** `/owners`
**Layout:** `Layout.astro` z nawigacją dla Department Representative
**Middleware:** Wymagana autoryzacja, sprawdzenie roli użytkownika

## 3. Struktura komponentów

```
OwnersListView (główny widok)
├── OwnerFilters (panel filtrów)
│   ├── EmailFilter
│   ├── CityFilter
│   ├── CountryFilter
│   └── GDPRConsentFilter
├── OwnerTable (tabela z listą)
│   ├── OwnerTableHeader (nagłówki z sortowaniem)
│   ├── OwnerTableRow (wiersze danych)
│   │   ├── OwnerCard (karta właściciela)
│   │   ├── GDPRStatusBadge (status zgody RODO)
│   │   └── OwnerActions (przyciski akcji)
│   └── OwnerTablePagination (paginacja)
├── OwnerForm (modal formularza)
│   ├── OwnerFormFields (pola formularza)
│   ├── GDPRConsentCheckbox (zgoda RODO)
│   └── OwnerFormActions (przyciski formularza)
└── DeleteConfirmation (modal potwierdzenia)
```

## 4. Szczegóły komponentów

### OwnersListView
- **Opis komponentu:** Główny widok listy właścicieli z zarządzaniem stanem, filtrowaniem i paginacją
- **Główne elementy:** Container z header, panel filtrów, tabela właścicieli, paginacja, modale
- **Obsługiwane interakcje:** search, filter, pagination, create, edit, delete, view details
- **Obsługiwana walidacja:** search input (min 2 znaki), filter values (email format, date ranges)
- **Typy:** `OwnersListViewModel`, `OwnerResponseDto[]`, `OwnerQueryParams`, `UserRole`
- **Props:** `userRole: UserRole`, `canCreate: boolean`, `canEdit: boolean`, `canDelete: boolean`

### OwnerFilters
- **Opis komponentu:** Panel filtrów umożliwiający filtrowanie listy właścicieli według różnych kryteriów
- **Główne elementy:** Form z polami email, city, country, gdpr_consent, przyciski apply/clear
- **Obsługiwane interakcje:** filter change, clear filters, apply filters
- **Obsługiwana walidacja:** email format, max length dla pól tekstowych
- **Typy:** `OwnerQueryParams`, `OwnerFiltersProps`
- **Props:** `filters: OwnerQueryParams`, `onFiltersChange: (filters: OwnerQueryParams) => void`

### OwnerTable
- **Opis komponentu:** Tabela z listą właścicieli z sortowaniem, akcjami i responsywnym designem
- **Główne elementy:** Table z thead, tbody, wiersze z danymi, kolumny z sortowaniem
- **Obsługiwane interakcje:** sort, select row, edit, delete, view details
- **Obsługiwana walidacja:** brak
- **Typy:** `OwnerResponseDto[]`, `OwnerTableProps`, `SortConfig`
- **Props:** `owners: OwnerResponseDto[]`, `onEdit: (owner: OwnerResponseDto) => void`, `onDelete: (owner: OwnerResponseDto) => void`, `canEdit: boolean`, `canDelete: boolean`

### OwnerCard
- **Opis komponentu:** Karta właściciela wyświetlająca podstawowe informacje w formacie card
- **Główne elementy:** Card z avatar, name, email, city, gdpr status, action buttons
- **Obsługiwane interakcje:** click (view details), edit, delete
- **Obsługiwana walidacja:** brak
- **Typy:** `OwnerResponseDto`, `OwnerCardProps`
- **Props:** `owner: OwnerResponseDto`, `onEdit: () => void`, `onDelete: () => void`, `canEdit: boolean`, `canDelete: boolean`

### OwnerForm
- **Opis komponentu:** Modal formularza do tworzenia i edycji właścicieli z walidacją
- **Główne elementy:** Modal z form, pola input, checkbox GDPR, przyciski submit/cancel
- **Obsługiwane interakcje:** submit, cancel, field change, validation
- **Obsługiwana walidacja:** email format, wymagane pola (first_name, last_name, email, address, city, country), unikalność email
- **Typy:** `CreateOwnerDto`, `UpdateOwnerDto`, `OwnerFormProps`, `ValidationErrors`
- **Props:** `owner?: OwnerResponseDto`, `onSubmit: (data: CreateOwnerDto | UpdateOwnerDto) => void`, `onCancel: () => void`, `isLoading: boolean`, `error: string | null`

### GDPRStatusBadge
- **Opis komponentu:** Badge pokazujący status zgody RODO z możliwością wycofania
- **Główne elementy:** Badge z ikoną, tekst statusu, przycisk wycofania (jeśli dozwolone)
- **Obsługiwane interakcje:** click (wycofanie zgody), hover (tooltip)
- **Obsługiwana walidacja:** brak
- **Typy:** `OwnerResponseDto`, `GDPRStatusBadgeProps`
- **Props:** `owner: OwnerResponseDto`, `onWithdrawConsent: (ownerId: string) => void`, `canWithdraw: boolean`

### DeleteConfirmation
- **Opis komponentu:** Modal potwierdzenia usunięcia właściciela z ostrzeżeniami
- **Główne elementy:** Modal z tytułem, opis, lista ostrzeżeń, przyciski confirm/cancel
- **Obsługiwane interakcje:** confirm, cancel
- **Obsługiwana walidacja:** brak
- **Typy:** `OwnerResponseDto`, `DeleteConfirmationProps`
- **Props:** `owner: OwnerResponseDto`, `onConfirm: () => void`, `onCancel: () => void`, `isLoading: boolean`

## 5. Typy

### OwnersListViewModel
```typescript
interface OwnersListViewModel {
  owners: OwnerResponseDto[];
  pagination: PaginationDto;
  filters: OwnerQueryParams;
  search: string;
  isLoading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
}
```

### OwnerTableProps
```typescript
interface OwnerTableProps {
  owners: OwnerResponseDto[];
  onEdit: (owner: OwnerResponseDto) => void;
  onDelete: (owner: OwnerResponseDto) => void;
  onViewDetails: (owner: OwnerResponseDto) => void;
  canEdit: boolean;
  canDelete: boolean;
  sortConfig: SortConfig;
  onSort: (field: keyof OwnerResponseDto) => void;
}
```

### OwnerFormProps
```typescript
interface OwnerFormProps {
  owner?: OwnerResponseDto;
  onSubmit: (data: CreateOwnerDto | UpdateOwnerDto) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  isEdit: boolean;
}
```

### OwnerFiltersProps
```typescript
interface OwnerFiltersProps {
  filters: OwnerQueryParams;
  onFiltersChange: (filters: OwnerQueryParams) => void;
  onClearFilters: () => void;
}
```

### GDPRStatusBadgeProps
```typescript
interface GDPRStatusBadgeProps {
  owner: OwnerResponseDto;
  onWithdrawConsent: (ownerId: string) => void;
  canWithdraw: boolean;
}
```

### DeleteConfirmationProps
```typescript
interface DeleteConfirmationProps {
  owner: OwnerResponseDto;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

### SortConfig
```typescript
interface SortConfig {
  field: keyof OwnerResponseDto;
  direction: 'asc' | 'desc';
}
```

## 6. Zarządzanie stanem

### useOwnersList hook
**Cel:** Centralne zarządzanie stanem listy właścicieli
**Stan:**
- `owners: OwnerResponseDto[]` - lista właścicieli
- `pagination: PaginationDto` - informacje o paginacji
- `filters: OwnerQueryParams` - aktywne filtry
- `search: string` - wyszukiwany tekst
- `isLoading: boolean` - stan ładowania
- `error: string | null` - błędy
- `sortConfig: SortConfig` - konfiguracja sortowania

**Akcje:**
- `fetchOwners()` - pobieranie listy z API
- `updateFilters(filters: OwnerQueryParams)` - aktualizacja filtrów
- `updateSearch(search: string)` - aktualizacja wyszukiwania
- `updateSort(field: keyof OwnerResponseDto)` - aktualizacja sortowania
- `createOwner(data: CreateOwnerDto)` - tworzenie właściciela
- `updateOwner(id: string, data: UpdateOwnerDto)` - aktualizacja właściciela
- `deleteOwner(id: string)` - usuwanie właściciela
- `withdrawGDPRConsent(ownerId: string)` - wycofanie zgody RODO

### useOwnerForm hook
**Cel:** Zarządzanie stanem formularza właściciela
**Stan:**
- `formData: CreateOwnerDto | UpdateOwnerDto` - dane formularza
- `errors: ValidationErrors` - błędy walidacji
- `isLoading: boolean` - stan ładowania
- `isSubmitting: boolean` - stan wysyłania

**Akcje:**
- `updateField(field: string, value: any)` - aktualizacja pola
- `validate()` - walidacja formularza
- `submit()` - wysłanie formularza
- `reset()` - reset formularza
- `setOwner(owner: OwnerResponseDto)` - ustawienie danych do edycji

## 7. Integracja API

### GET /owners
**Typ żądania:** `OwnerQueryParams`
**Typ odpowiedzi:** `PaginatedResponseDto<OwnerResponseDto>`
**Obsługa:** 
- Parametry: email, city, country, gdpr_consent, page, limit
- Loading state podczas pobierania
- Error handling z retry
- Paginacja z automatycznym przeładowaniem

### POST /owners
**Typ żądania:** `CreateOwnerDto`
**Typ odpowiedzi:** `OwnerResponseDto`
**Obsługa:**
- Walidacja przed wysłaniem
- Success feedback z toast notification
- Error handling z field-level errors
- Automatyczne odświeżenie listy

### PUT /owners/{id}
**Typ żądania:** `UpdateOwnerDto`
**Typ odpowiedzi:** `OwnerResponseDto`
**Obsługa:**
- Walidacja przed wysłaniem
- Success feedback z toast notification
- Error handling z field-level errors
- Aktualizacja wiersza w tabeli

### DELETE /owners/{id}
**Typ żądania:** `string` (id)
**Typ odpowiedzi:** `void`
**Obsługa:**
- Confirmation modal przed usunięciem
- Success feedback z toast notification
- Error handling z retry
- Usunięcie z listy (soft delete)

## 8. Interakcje użytkownika

### Wyszukiwanie i filtrowanie
1. **Wyszukiwanie tekstowe** - input z debounce (300ms), minimum 2 znaki
2. **Filtr email** - input z walidacją formatu email
3. **Filtr miasta** - autocomplete z istniejącymi miastami
4. **Filtr kraju** - dropdown z listą krajów
5. **Filtr zgody RODO** - checkbox z opcjami: wszystkie, z zgodą, bez zgody
6. **Czyszczenie filtrów** - przycisk "Wyczyść filtry"

### Paginacja
1. **Nawigacja** - przyciski previous/next, numery stron
2. **Limit wyników** - dropdown z opcjami: 10, 25, 50, 100
3. **Informacje** - "Pokazano X-Y z Z wyników"

### Operacje CRUD
1. **Tworzenie** - przycisk "Dodaj właściciela" → modal formularza
2. **Edycja** - przycisk edit w wierszu → modal formularza z wypełnionymi danymi
3. **Usuwanie** - przycisk delete → modal potwierdzenia z ostrzeżeniami
4. **Podgląd** - kliknięcie wiersza → przejście do szczegółów

### Sortowanie
1. **Kliknięcie nagłówka** - sortowanie po kolumnie
2. **Wizualny feedback** - strzałki wskazujące kierunek sortowania
3. **Wielokrotne kliknięcie** - zmiana kierunku (asc/desc)

### GDPR Consent
1. **Status badge** - kolorowy badge z ikoną i tekstem
2. **Wycofanie zgody** - przycisk w badge → modal potwierdzenia
3. **Tooltip** - informacje o dacie zgody/wycofania

## 9. Warunki i walidacja

### Walidacja formularza (OwnerForm)
1. **first_name** - wymagane, min 2 znaki, max 50 znaków
2. **last_name** - wymagane, min 2 znaki, max 50 znaków
3. **email** - wymagane, format RFC 5322, unikalność w systemie
4. **phone** - opcjonalne, format międzynarodowy
5. **address** - wymagane, min 5 znaków, max 200 znaków
6. **city** - wymagane, min 2 znaki, max 50 znaków
7. **postal_code** - opcjonalne, format kraju
8. **country** - wymagane, z listy krajów
9. **gdpr_consent** - wymagane do uczestnictwa w wystawie

### Walidacja filtrów (OwnerFilters)
1. **email** - format RFC 5322 (jeśli podane)
2. **search** - minimum 2 znaki
3. **date ranges** - poprawność zakresów dat

### Warunki biznesowe
1. **Unikalność email** - sprawdzanie przed submit formularza
2. **GDPR consent** - wymagane do uczestnictwa w wystawie
3. **Soft delete** - właściciel z przypisanymi psami nie może być usunięty
4. **Role-based access** - różne uprawnienia dla Department Representative i Secretary

### Wpływ na interfejs
1. **Błędy walidacji** - field-level error messages, disabled submit button
2. **Loading states** - disabled buttons, loading spinners
3. **Permission restrictions** - ukryte przyciski akcji
4. **Empty states** - komunikaty gdy brak wyników
5. **Error states** - retry buttons, error messages

## 10. Obsługa błędów

### Network errors
1. **Błąd połączenia** - offline indicator, retry button
2. **Timeout** - timeout message z retry option
3. **Server error (5xx)** - generic error message, contact support link

### Validation errors
1. **Field-level errors** - czerwone border, error message pod polem
2. **Form-level errors** - error banner na górze formularza
3. **API validation errors** - mapowanie na pola formularza

### Business logic errors
1. **Email already exists** - error message z sugestią sprawdzenia
2. **Owner has assigned dogs** - warning w modal usuwania
3. **GDPR consent required** - error message z wyjaśnieniem
4. **Permission denied** - hide action, show permission message

### User feedback
1. **Success messages** - toast notifications z auto-hide
2. **Error messages** - toast notifications z manual dismiss
3. **Loading indicators** - spinners, disabled states
4. **Confirmation dialogs** - modale z potwierdzeniem

### Error recovery
1. **Retry mechanisms** - retry buttons dla network errors
2. **Form persistence** - zachowanie danych formularza przy błędach
3. **Graceful degradation** - ukrywanie funkcji przy błędach
4. **Fallback content** - alternative content przy błędach

## 11. Kroki implementacji

### Faza 1: Podstawowa struktura
1. **Utworzenie pliku widoku** - `src/pages/owners/index.astro`
2. **Setup layout i routing** - integracja z Layout.astro
3. **Utworzenie głównego komponentu** - `OwnersListView.tsx`
4. **Implementacja podstawowej struktury** - container, header, placeholder content

### Faza 2: Zarządzanie stanem
1. **Utworzenie custom hook** - `useOwnersList.ts`
2. **Implementacja podstawowych akcji** - fetchOwners, updateFilters
3. **Setup error handling** - error states, loading states
4. **Integracja z Supabase** - connection, authentication

### Faza 3: Komponenty UI
1. **OwnerTable** - podstawowa tabela z danymi
2. **OwnerFilters** - panel filtrów z polami
3. **OwnerForm** - modal formularza z walidacją
4. **GDPRStatusBadge** - badge statusu zgody RODO

### Faza 4: Integracja API
1. **GET /owners** - pobieranie listy z paginacją
2. **POST /owners** - tworzenie nowego właściciela
3. **PUT /owners/{id}** - aktualizacja właściciela
4. **DELETE /owners/{id}** - usuwanie właściciela

### Faza 5: Funkcjonalności zaawansowane
1. **Sortowanie** - implementacja sortowania kolumn
2. **Wyszukiwanie** - debounced search functionality
3. **Filtrowanie** - advanced filtering options
4. **Paginacja** - full pagination controls

### Faza 6: Walidacja i bezpieczeństwo
1. **Form validation** - Zod schemas, field-level validation
2. **API validation** - error handling, field mapping
3. **Permission checks** - role-based access control
4. **GDPR compliance** - consent tracking, withdrawal

### Faza 7: UX i dostępność
1. **Loading states** - skeletons, spinners
2. **Error states** - error boundaries, fallbacks
3. **Accessibility** - ARIA labels, keyboard navigation
4. **Responsive design** - mobile/tablet adaptations

### Faza 8: Testowanie i optymalizacja
1. **Unit tests** - komponenty, hooks, utilities
2. **Integration tests** - API integration, user flows
3. **Performance optimization** - lazy loading, memoization
4. **Final testing** - user acceptance testing 
