# Plan implementacji widoku Show Details

## 1. Przegląd
Widok szczegółów wystawy (Show Details) to kompleksowy interfejs umożliwiający przeglądanie i zarządzanie danymi wystawy psów rasowych. Widok zawiera szczegółowe informacje o wystawie, listę zarejestrowanych psów z możliwością filtrowania, statystyki rejestracji oraz akcje zarządzania (edycja, usuwanie) dostępne dla przedstawicieli oddziałów. Widok implementuje ograniczenia czasowe - edycja możliwa jest tylko przed rozpoczęciem wystawy.

## 2. Routing widoku
**Ścieżka**: `/shows/{showId}`
**Plik**: `src/pages/shows/[showId]/index.astro`

## 3. Struktura komponentów
```
ShowDetailsView (Astro page)
├── ShowHeader
│   ├── ShowTitle
│   ├── ShowStatus
│   └── ShowActions
├── ShowStats
├── RegistrationFilters
├── DogsList
│   ├── DogCard (multiple)
│   │   ├── DogInfo
│   │   ├── OwnerInfo
│   │   └── DogActions
│   └── AddDogButton
├── AddDogModal
├── EditDogModal
└── DeleteDogConfirmation
```

## 4. Szczegóły komponentów

### ShowDetailsView
- **Opis komponentu**: Główny kontener widoku szczegółów wystawy, zarządza stanem i koordynuje komponenty
- **Główne elementy**: Layout z nagłówkiem, statystykami, filtrami i listą psów
- **Obsługiwane interakcje**: Inicjalizacja danych, obsługa błędów, zarządzanie modalami
- **Obsługiwana walidacja**: Sprawdzanie uprawnień użytkownika, walidacja statusu wystawy
- **Typy**: ShowDetailsViewModel, ShowDetailResponseDto, RegistrationResponseDto[]
- **Propsy**: showId: string

### ShowHeader
- **Opis komponentu**: Nagłówek wyświetlający podstawowe informacje o wystawie i akcje zarządzania
- **Główne elementy**: Tytuł wystawy, status, daty, lokalizacja, przyciski akcji
- **Obsługiwane interakcje**: Przejście do edycji wystawy, usuwanie wystawy, zmiana statusu
- **Obsługiwana walidacja**: Sprawdzanie roli użytkownika, statusu wystawy, uprawnień do edycji
- **Typy**: ShowDetailResponseDto, UserRole, ShowStatus
- **Propsy**: show: ShowDetailResponseDto, userRole: UserRole, canEdit: boolean

### ShowStats
- **Opis komponentu**: Komponent wyświetlający statystyki rejestracji psów na wystawę
- **Główne elementy**: Liczniki totalnych, opłaconych i nieopłaconych rejestracji, podział według klas
- **Obsługiwane interakcje**: Wyświetlanie statystyk w czasie rzeczywistym
- **Obsługiwana walidacja**: Sprawdzanie poprawności danych statystycznych
- **Typy**: ShowStats, RegistrationResponseDto[]
- **Propsy**: registrations: RegistrationResponseDto[]

### RegistrationFilters
- **Opis komponentu**: Filtry umożliwiające filtrowanie listy psów według różnych kryteriów
- **Główne elementy**: Select dla klasy psa, checkbox dla statusu płatności, wyszukiwarka
- **Obsługiwane interakcje**: Zmiana filtrów, resetowanie filtrów, wyszukiwanie tekstowe
- **Obsługiwana walidacja**: Walidacja wartości filtrów
- **Typy**: DogClass, boolean, string
- **Propsy**: onFiltersChange: (filters: FilterState) => void, currentFilters: FilterState

### DogsList
- **Opis komponentu**: Lista zarejestrowanych psów z możliwością sortowania i paginacji
- **Główne elementy**: Grid/list kart psów, paginacja, przycisk dodawania
- **Obsługiwane interakcje**: Sortowanie, paginacja, dodawanie nowego psa
- **Obsługiwana walidacja**: Sprawdzanie uprawnień do dodawania psów
- **Typy**: RegistrationResponseDto[], ShowStatus, UserRole
- **Propsy**: registrations: RegistrationResponseDto[], showStatus: ShowStatus, canAddDogs: boolean

### DogCard
- **Opis komponentu**: Karta wyświetlająca informacje o pojedynczym psie i jego właścicielu
- **Główne elementy**: Dane psa, dane właściciela, status płatności, akcje
- **Obsługiwane interakcje**: Rozwijanie szczegółów, edycja, usuwanie
- **Obsługiwana walidacja**: Sprawdzanie uprawnień do edycji/usuwania
- **Typy**: RegistrationResponseDto, DogCardViewModel
- **Propsy**: registration: RegistrationResponseDto, canEdit: boolean, canDelete: boolean

### AddDogModal
- **Opis komponentu**: Modal do dodawania nowego psa do wystawy
- **Główne elementy**: Formularz z danymi psa i właściciela, walidacja, przyciski akcji
- **Obsługiwane interakcje**: Wypełnianie formularza, walidacja, zapisywanie, anulowanie
- **Obsługiwana walidacja**: Wymagane pola, format email, format microchip, data urodzenia
- **Typy**: CreateRegistrationDto, Dog, Owner, ValidationErrors
- **Propsy**: showId: string, isOpen: boolean, onClose: () => void, onSuccess: () => void

### EditDogModal
- **Opis komponentu**: Modal do edycji danych psa w wystawie
- **Główne elementy**: Formularz z aktualnymi danymi, walidacja, przyciski akcji
- **Obsługiwane interakcje**: Edycja danych, walidacja, zapisywanie zmian, anulowanie
- **Obsługiwana walidacja**: Wymagane pola, format email, format microchip
- **Typy**: UpdateRegistrationDto, RegistrationResponseDto, ValidationErrors
- **Propsy**: registration: RegistrationResponseDto, isOpen: boolean, onClose: () => void, onSuccess: () => void

### DeleteDogConfirmation
- **Opis komponentu**: Modal potwierdzenia usunięcia psa z wystawy
- **Główne elementy**: Komunikat potwierdzenia, dane psa, przyciski akcji
- **Obsługiwane interakcje**: Potwierdzenie usunięcia, anulowanie
- **Obsługiwana walidacja**: Sprawdzanie możliwości usunięcia
- **Typy**: RegistrationResponseDto
- **Propsy**: registration: RegistrationResponseDto, isOpen: boolean, onClose: () => void, onConfirm: () => void

## 5. Typy

### ShowDetailsViewModel
```typescript
interface ShowDetailsViewModel {
  show: ShowDetailResponseDto;
  registrations: RegistrationResponseDto[];
  stats: ShowStats;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
}
```

### ShowStats
```typescript
interface ShowStats {
  totalDogs: number;
  paidRegistrations: number;
  unpaidRegistrations: number;
  byClass: Record<DogClass, number>;
  byGender: Record<DogGender, number>;
}
```

### FilterState
```typescript
interface FilterState {
  dogClass?: DogClass;
  isPaid?: boolean;
  search?: string;
  gender?: DogGender;
}
```

### DogCardViewModel
```typescript
interface DogCardViewModel {
  registration: RegistrationResponseDto;
  canEdit: boolean;
  canDelete: boolean;
  isExpanded: boolean;
  isProcessing: boolean;
}
```

### ValidationErrors
```typescript
interface ValidationErrors {
  [field: string]: string[];
}
```

## 6. Zarządzanie stanem

Widok wykorzystuje kombinację stanu lokalnego komponentów i custom hooków:

### useShowDetails
```typescript
const useShowDetails = (showId: string) => {
  const [show, setShow] = useState<ShowDetailResponseDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});

  const loadShowData = async () => { /* ... */ };
  const refreshData = async () => { /* ... */ };
  const updateFilters = (newFilters: FilterState) => { /* ... */ };

  return {
    show,
    registrations,
    isLoading,
    error,
    filters,
    loadShowData,
    refreshData,
    updateFilters
  };
};
```

### useShowActions
```typescript
const useShowActions = (show: ShowDetailResponseDto) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteShow = async () => { /* ... */ };
  const updateShowStatus = async (status: ShowStatus) => { /* ... */ };

  return {
    isDeleting,
    isUpdating,
    deleteShow,
    updateShowStatus
  };
};
```

### useDogManagement
```typescript
const useDogManagement = (showId: string, onSuccess: () => void) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addDog = async (data: CreateRegistrationDto) => { /* ... */ };
  const editDog = async (registrationId: string, data: UpdateRegistrationDto) => { /* ... */ };
  const deleteDog = async (registrationId: string) => { /* ... */ };

  return {
    isAdding,
    isEditing,
    isDeleting,
    addDog,
    editDog,
    deleteDog
  };
};
```

## 7. Integracja API

### Pobieranie danych wystawy
```typescript
// GET /shows/{id}
const response = await fetch(`/api/shows/${showId}`);
const show: ShowDetailResponseDto = await response.json();
```

### Pobieranie rejestracji
```typescript
// GET /shows/{showId}/registrations
const response = await fetch(`/api/shows/${showId}/registrations`);
const registrations: RegistrationResponseDto[] = await response.json();
```

### Edycja wystawy
```typescript
// PUT /shows/{id}
const response = await fetch(`/api/shows/${showId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData: UpdateShowDto)
});
```

### Dodawanie psa
```typescript
// POST /shows/{showId}/registrations
const response = await fetch(`/api/shows/${showId}/registrations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(createData: CreateRegistrationDto)
});
```

### Edycja rejestracji
```typescript
// PUT /shows/{showId}/registrations/{registrationId}
const response = await fetch(`/api/shows/${showId}/registrations/${registrationId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData: UpdateRegistrationDto)
});
```

### Usuwanie rejestracji
```typescript
// DELETE /shows/{showId}/registrations/{registrationId}
const response = await fetch(`/api/shows/${showId}/registrations/${registrationId}`, {
  method: 'DELETE'
});
```

## 8. Interakcje użytkownika

### Przeglądanie danych
- Użytkownik widzi szczegółowe informacje o wystawie
- Lista psów z możliwością filtrowania i sortowania
- Statystyki rejestracji w czasie rzeczywistym

### Filtrowanie psów
- Wybór klasy psa z dropdown
- Filtrowanie według statusu płatności
- Wyszukiwanie tekstowe w nazwie psa lub właściciela
- Resetowanie filtrów

### Dodawanie psa
- Kliknięcie przycisku "Dodaj psa"
- Wypełnienie formularza z danymi psa i właściciela
- Walidacja danych w czasie rzeczywistym
- Zapisanie i odświeżenie listy

### Edycja psa
- Kliknięcie przycisku edycji na karcie psa
- Otwarcie modala z aktualnymi danymi
- Edycja wybranych pól
- Zapisanie zmian

### Usuwanie psa
- Kliknięcie przycisku usuwania
- Potwierdzenie w modalu
- Usunięcie z listy
- Aktualizacja statystyk

### Zarządzanie wystawą
- Edycja danych wystawy (tylko przed rozpoczęciem)
- Zmiana statusu wystawy
- Usuwanie wystawy (tylko przed rozpoczęciem)

## 9. Warunki i walidacja

### Warunki czasowe
- **Edycja wystawy**: Tylko przed rozpoczęciem (status: draft, open_for_registration)
- **Edycja psów**: Tylko przed rozpoczęciem wystawy
- **Usuwanie**: Tylko przed rozpoczęciem wystawy

### Warunki rolowe
- **Przedstawiciel oddziału**: Pełny dostęp do wszystkich funkcji
- **Sekretarz**: Tylko przeglądanie i dodawanie psów

### Walidacja formularzy
- **Email**: Format RFC 5322, unikalność
- **Microchip**: Dokładnie 15 cyfr, unikalność
- **Data urodzenia**: W przeszłości, maksymalnie 20 lat wstecz
- **Klasa psa**: Zgodność z wiekiem psa na datę wystawy
- **Wymagane pola**: Nazwa psa, rasa, płeć, data urodzenia, microchip

### Walidacja biznesowa
- **Limit uczestników**: Nie przekraczać max_participants
- **Status płatności**: Śledzenie opłaconych rejestracji
- **Zgoda RODO**: Wymagana dla właścicieli

## 10. Obsługa błędów

### Błędy ładowania danych
- Wyświetlenie komunikatu błędu z możliwością ponowienia
- Fallback UI dla częściowo załadowanych danych
- Indykator ładowania podczas retry

### Błędy walidacji formularzy
- Wyświetlenie błędów pod polami formularza
- Blokowanie wysłania formularza z błędami
- Real-time walidacja podczas wpisywania

### Błędy API
- Obsługa różnych kodów błędów (400, 401, 403, 404, 500)
- Komunikaty błędów dostosowane do kontekstu
- Możliwość ponowienia operacji

### Błędy uprawnień
- Ukrycie akcji niedostępnych dla użytkownika
- Komunikaty informujące o braku uprawnień
- Przekierowanie do odpowiedniej strony

### Błędy sieciowe
- Retry mechanism dla operacji krytycznych
- Offline detection i odpowiednie komunikaty
- Queue dla operacji offline

## 11. Kroki implementacji

1. **Utworzenie struktury plików**
   - Utworzenie strony Astro `/shows/[showId]/index.astro`
   - Utworzenie komponentów React w `/components/shows/`
   - Utworzenie typów w `/types/shows.ts`

2. **Implementacja głównego widoku**
   - Utworzenie `ShowDetailsView` z podstawowym layoutem
   - Implementacja `useShowDetails` hook
   - Podstawowe ładowanie danych

3. **Implementacja komponentów nagłówka**
   - `ShowHeader` z podstawowymi informacjami
   - `ShowActions` z przyciskami zarządzania
   - Integracja z API dla akcji wystawy

4. **Implementacja statystyk**
   - `ShowStats` komponent
   - Logika obliczania statystyk
   - Responsywny design

5. **Implementacja filtrów**
   - `RegistrationFilters` komponent
   - Logika filtrowania
   - Integracja z głównym stanem

6. **Implementacja listy psów**
   - `DogsList` komponent z grid layout
   - `DogCard` komponent z podstawowymi informacjami
   - Paginacja i sortowanie

7. **Implementacja modali**
   - `AddDogModal` z formularzem
   - `EditDogModal` z pre-wypełnionymi danymi
   - `DeleteDogConfirmation` z potwierdzeniem

8. **Implementacja walidacji**
   - Walidacja formularzy
   - Walidacja biznesowa
   - Obsługa błędów walidacji

9. **Implementacja obsługi błędów**
   - Komponenty błędów
   - Retry mechanism
   - Fallback UI

10. **Testowanie i optymalizacja**
    - Testy komponentów
    - Testy integracyjne
    - Optymalizacja wydajności
    - Accessibility testing

11. **Dokumentacja i finalizacja**
    - Dokumentacja komponentów
    - Przykłady użycia
    - Code review i refactoring 
