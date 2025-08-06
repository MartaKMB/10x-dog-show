# Plan implementacji widoku Zarządzanie Oddziałami

## 1. Przegląd

Widok Zarządzanie Oddziałami umożliwia przeglądanie i zarządzanie listą oddziałów organizujących wystawy psów. Widok zapewnia zaawansowane filtrowanie, paginację i wyszukiwanie, umożliwiając efektywne zarządzanie bazą oddziałów w systemie 10x Dog Show. Widok jest dostępny dla wszystkich uwierzytelnionych użytkowników, z możliwością rozszerzenia o funkcje edycji dla przedstawicieli oddziałów.

## 2. Routing widoku

**Ścieżka:** `/branches`
**Metoda:** GET
**Layout:** Główny layout aplikacji z nawigacją boczną
**Breadcrumb:** Dashboard > Branches

## 3. Struktura komponentów

```
BranchesListView (Astro page)
├── BranchesHeader
│   ├── PageTitle
│   ├── GlobalPrivacyToggle
│   └── QuickActions
├── BranchesFilters
│   ├── RegionFilter
│   ├── ActiveStatusFilter
│   ├── SearchFilter
│   └── FiltersReset
├── BranchesTable
│   ├── BranchesTableHeader
│   ├── BranchesTableRow
│   └── EmptyState
├── Pagination
├── LoadingSpinner
└── ErrorDisplay
```

## 4. Szczegóły komponentów

### BranchesListView

- **Opis komponentu:** Główny widok strony zarządzania oddziałami, koordynujący wszystkie podkomponenty i zarządzający globalnym stanem
- **Główne elementy:** Container z header, filtrami, tabelą i paginacją
- **Obsługiwane interakcje:** Inicjalizacja danych, obsługa błędów, zarządzanie stanem globalnym
- **Obsługiwana walidacja:** Walidacja uprawnień użytkownika, sprawdzanie dostępności API
- **Typy:** BranchesListViewModel, UserRole, ErrorResponseDto
- **Props:** Brak (komponent główny)

### BranchesHeader

- **Opis komponentu:** Nagłówek strony z tytułem, kontrolkami prywatności i akcjami szybkiego dostępu
- **Główne elementy:** Tytuł strony, przełącznik prywatności, przyciski akcji
- **Obsługiwane interakcje:** Przełączanie trybu prywatności, nawigacja do tworzenia nowego oddziału
- **Obsługiwana walidacja:** Sprawdzanie uprawnień do tworzenia oddziałów
- **Typy:** UserRole, QuickAction[]
- **Props:** userRole, canCreate, onPrivacyToggle, onCreateNew

### BranchesFilters

- **Opis komponentu:** Panel filtrów umożliwiający filtrowanie listy oddziałów po różnych kryteriach
- **Główne elementy:** Filtry regionu, statusu aktywności, wyszukiwanie tekstowe, przycisk resetowania
- **Obsługiwane interakcje:** Zmiana filtrów, resetowanie filtrów, wyszukiwanie
- **Obsługiwana walidacja:** Walidacja formatu regionu, sprawdzanie długości wyszukiwania
- **Typy:** BranchFiltersState, BranchQueryParams
- **Props:** filters, onFiltersChange, onReset

### RegionFilter

- **Opis komponentu:** Filtr dropdown dla wyboru regionu oddziału
- **Główne elementy:** Select dropdown z listą regionów
- **Obsługiwane interakcje:** Wybór regionu, czyszczenie filtra
- **Obsługiwana walidacja:** Sprawdzanie czy region istnieje w bazie
- **Typy:** string | undefined
- **Props:** value, onChange, regions

### ActiveStatusFilter

- **Opis komponentu:** Filtr checkbox dla statusu aktywności oddziałów
- **Główne elementy:** Checkbox z etykietą
- **Obsługiwane interakcje:** Przełączanie statusu aktywnego/nieaktywnego
- **Obsługiwana walidacja:** Brak (boolean)
- **Typy:** boolean | undefined
- **Props:** value, onChange, label

### SearchFilter

- **Opis komponentu:** Pole wyszukiwania tekstowego w nazwach oddziałów
- **Główne elementy:** Input text z ikoną wyszukiwania
- **Obsługiwane interakcje:** Wprowadzanie tekstu wyszukiwania, czyszczenie pola
- **Obsługiwana walidacja:** Maksymalna długość 200 znaków, minimum 2 znaki dla wyszukiwania
- **Typy:** string | undefined
- **Props:** value, onChange, placeholder, maxLength

### BranchesTable

- **Opis komponentu:** Tabela wyświetlająca listę oddziałów z możliwością sortowania
- **Główne elementy:** Nagłówek tabeli, wiersze danych, stan pusty
- **Obsługiwane interakcje:** Sortowanie kolumn, wybór wierszy, nawigacja do szczegółów
- **Obsługiwana walidacja:** Sprawdzanie czy dane są dostępne, walidacja uprawnień
- **Typy:** BranchResponseDto[], BranchTableRowViewModel[]
- **Props:** branches, isLoading, onSort, onRowClick, canEdit, canDelete

### BranchesTableHeader

- **Opis komponentu:** Nagłówek tabeli z kolumnami i kontrolkami sortowania
- **Główne elementy:** Nagłówki kolumn z ikonami sortowania
- **Obsługiwane interakcje:** Kliknięcie w nagłówek dla sortowania
- **Obsługiwana walidacja:** Sprawdzanie aktualnego kierunku sortowania
- **Typy:** SortField, SortDirection
- **Props:** sortField, sortDirection, onSort

### BranchesTableRow

- **Opis komponentu:** Pojedynczy wiersz tabeli z danymi oddziału
- **Główne elementy:** Komórki z danymi oddziału, status aktywności, akcje
- **Obsługiwane interakcje:** Kliknięcie w wiersz, akcje edycji/usuwania
- **Obsługiwana walidacja:** Sprawdzanie uprawnień do akcji, walidacja danych
- **Typy:** BranchTableRowViewModel, BranchResponseDto
- **Props:** branch, isSelected, canEdit, canDelete, onEdit, onDelete, onSelect

### Pagination

- **Opis komponentu:** Komponent nawigacji po stronach wyników
- **Główne elementy:** Przyciski nawigacji, informacje o stronie, wybór liczby elementów
- **Obsługiwane interakcje:** Zmiana strony, zmiana liczby elementów na stronę
- **Obsługiwana walidacja:** Sprawdzanie granic stron, walidacja liczby elementów (1-100)
- **Typy:** PaginationDto, number[]
- **Props:** pagination, onPageChange, onLimitChange, pageSizeOptions

### LoadingSpinner

- **Opis komponentu:** Wskaźnik ładowania podczas pobierania danych
- **Główne elementy:** Spinner z komunikatem
- **Obsługiwane interakcje:** Brak
- **Obsługiwana walidacja:** Brak
- **Typy:** string
- **Props:** message, size

### ErrorDisplay

- **Opis komponentu:** Wyświetlanie błędów z możliwością ponowienia akcji
- **Główne elementy:** Komunikat błędu, przycisk ponowienia
- **Obsługiwane interakcje:** Ponowienie żądania, zamknięcie błędu
- **Obsługiwana walidacja:** Sprawdzanie typu błędu
- **Typy:** ErrorResponseDto, string
- **Props:** error, onRetry, onClose

## 5. Typy

### BranchesListViewModel

```typescript
interface BranchesListViewModel {
  branches: BranchResponseDto[];
  pagination: PaginationDto;
  filters: BranchFiltersState;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  sortField: SortField;
  sortDirection: SortDirection;
}
```

### BranchFiltersState

```typescript
interface BranchFiltersState {
  region?: string;
  is_active?: boolean;
  search?: string;
  page: number;
  limit: number;
}
```

### BranchTableRowViewModel

```typescript
interface BranchTableRowViewModel {
  branch: BranchResponseDto;
  isSelected: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isProcessing: boolean;
}
```

### SortField

```typescript
type SortField = "name" | "region" | "city" | "is_active" | "created_at";
```

### SortDirection

```typescript
type SortDirection = "asc" | "desc";
```

### QuickAction

```typescript
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
  requiresPermission?: UserRole[];
}
```

## 6. Zarządzanie stanem

Widok wykorzystuje kombinację React Context i custom hooks dla zarządzania stanem:

### useBranchesList Hook

```typescript
const useBranchesList = () => {
  const [state, setState] = useState<BranchesListViewModel>(initialState);
  const [filters, setFilters] = useState<BranchFiltersState>(defaultFilters);

  const fetchBranches = useCallback(async (params: BranchQueryParams) => {
    // Implementacja pobierania danych
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<BranchFiltersState>) => {
      // Implementacja aktualizacji filtrów
    },
    [],
  );

  return {
    state,
    filters,
    fetchBranches,
    updateFilters,
    resetFilters,
    setSorting,
  };
};
```

### useBranchFilters Hook

```typescript
const useBranchFilters = () => {
  const [filters, setFilters] = useState<BranchFiltersState>(defaultFilters);

  const applyFilters = useCallback(
    (newFilters: Partial<BranchFiltersState>) => {
      // Implementacja aplikowania filtrów
    },
    [],
  );

  return {
    filters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
  };
};
```

## 7. Integracja API

### Główne wywołanie API

```typescript
// GET /api/branches
const fetchBranches = async (
  params: BranchQueryParams,
): Promise<BranchesListResponseDto> => {
  const response = await fetch(`/api/branches?${new URLSearchParams(params)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### Typy żądania i odpowiedzi

- **Żądanie:** BranchQueryParams (region?, is_active?, page?, limit?)
- **Odpowiedź:** BranchesListResponseDto (branches: BranchResponseDto[], pagination: PaginationDto)
- **Błędy:** ErrorResponseDto (401, 400, 500)

## 8. Interakcje użytkownika

### Filtrowanie

1. **Filtr regionu:** Użytkownik wybiera region z dropdown → aktualizacja filtrów → ponowne pobranie danych
2. **Filtr statusu:** Użytkownik przełącza checkbox → filtrowanie po statusie aktywności
3. **Wyszukiwanie:** Użytkownik wpisuje tekst → debounced search → filtrowanie po nazwie

### Sortowanie

1. **Kliknięcie nagłówka kolumny:** Zmiana kierunku sortowania → ponowne pobranie danych
2. **Wielokrotne kliknięcie:** Przełączanie między asc/desc

### Paginacja

1. **Zmiana strony:** Kliknięcie numeru strony → aktualizacja page w filtrach
2. **Zmiana liczby elementów:** Wybór z dropdown → aktualizacja limit w filtrach

### Akcje na wierszach

1. **Kliknięcie wiersza:** Nawigacja do szczegółów oddziału
2. **Akcje edycji:** Sprawdzenie uprawnień → otwarcie modalu edycji
3. **Akcje usuwania:** Potwierdzenie → wywołanie API usuwania

## 9. Warunki i walidacja

### Walidacja filtrów

- **Region:** Maksymalna długość 100 znaków, opcjonalny
- **Status aktywności:** Boolean, opcjonalny
- **Wyszukiwanie:** Maksymalna długość 200 znaków, minimum 2 znaki dla aktywacji
- **Strona:** Liczba całkowita >= 1, domyślnie 1
- **Limit:** Liczba całkowita 1-100, domyślnie 20

### Walidacja uprawnień

- **Odczyt:** Wszyscy uwierzytelnieni użytkownicy
- **Edycja:** Tylko department_representative
- **Usuwanie:** Tylko department_representative
- **Tworzenie:** Tylko department_representative

### Walidacja stanu

- **Ładowanie:** Blokowanie interakcji podczas fetch
- **Błędy:** Wyświetlanie komunikatów błędów z możliwością ponowienia
- **Puste wyniki:** Wyświetlanie stanu pustego z sugestiami

## 10. Obsługa błędów

### Typy błędów

1. **401 Unauthorized:** Przekierowanie do logowania
2. **400 Bad Request:** Wyświetlanie szczegółów walidacji
3. **500 Internal Server Error:** Komunikat o błędzie serwera z możliwością ponowienia
4. **Network Error:** Komunikat o braku połączenia z opcją ponowienia
5. **Empty Results:** Informacja o braku wyników z sugestiami

### Strategie obsługi

- **Retry mechanism:** Automatyczne ponowienie przy błędach sieciowych
- **Fallback UI:** Wyświetlanie stanu offline z cached data
- **User feedback:** Toast notifications dla akcji użytkownika
- **Error boundaries:** Catch i wyświetlanie błędów React

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**

   - Utworzenie `src/pages/branches/index.astro`
   - Utworzenie `src/components/branches/` katalogu
   - Dodanie typów do `src/types.ts`

2. **Implementacja głównego widoku**

   - Stworzenie `BranchesListView` komponentu
   - Implementacja layoutu z header, filtrami i tabelą
   - Dodanie podstawowej nawigacji

3. **Implementacja filtrów**

   - Stworzenie `BranchesFilters` komponentu
   - Implementacja `RegionFilter`, `ActiveStatusFilter`, `SearchFilter`
   - Dodanie logiki resetowania filtrów

4. **Implementacja tabeli**

   - Stworzenie `BranchesTable` komponentu
   - Implementacja `BranchesTableHeader` i `BranchesTableRow`
   - Dodanie sortowania kolumn

5. **Implementacja paginacji**

   - Stworzenie `Pagination` komponentu
   - Dodanie nawigacji po stronach
   - Implementacja wyboru liczby elementów

6. **Implementacja custom hooks**

   - Stworzenie `useBranchesList` hook
   - Implementacja `useBranchFilters` hook
   - Dodanie zarządzania stanem

7. **Integracja z API**

   - Implementacja wywołania `GET /api/branches`
   - Dodanie obsługi parametrów zapytania
   - Implementacja error handling

8. **Dodanie komponentów pomocniczych**

   - Implementacja `LoadingSpinner`
   - Stworzenie `ErrorDisplay`
   - Dodanie `EmptyState`

9. **Implementacja accessibility**

   - Dodanie ARIA labels
   - Implementacja keyboard navigation
   - Dodanie screen reader support

10. **Testowanie i optymalizacja**

    - Testowanie responsywności
    - Optymalizacja performance
    - Testowanie różnych scenariuszy błędów

11. **Dokumentacja i finalizacja**
    - Dodanie komentarzy do kodu
    - Aktualizacja dokumentacji
    - Code review i refactoring
