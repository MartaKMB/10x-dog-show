# Plan implementacji widoku zarządzania psami

## 1. Przegląd

Widok zarządzania psami to hierarchiczna lista psów pogrupowana według grup FCI, ras i klas w kontekście konkretnej wystawy. Umożliwia sekretarzom i przedstawicielom oddziałów przeglądanie, edycję i zarządzanie psami uczestniczącymi w wystawie z uwzględnieniem statusów opisów i ograniczeń czasowych.

## 2. Routing widoku

- **Ścieżka**: `/shows/{showId}/dogs`
- **Parametry**: `showId` (UUID) - identyfikator wystawy
- **Layout**: Layout.astro z nawigacją i breadcrumbs

## 3. Struktura komponentów

```
DogsListView (główny kontener)
├── FilterPanel (filtry i wyszukiwanie)
│   ├── BreedFilter
│   ├── GenderFilter
│   ├── ClassFilter
│   ├── StatusFilter
│   └── SearchBar
├── HierarchicalList (hierarchiczna lista)
│   ├── FciGroupNode
│   │   ├── BreedGroupNode
│   │   │   ├── ClassGroupNode
│   │   │   │   └── DogCard
│   │   │   │       ├── StatusBadge
│   │   │   │       └── QuickActionMenu
│   │   │   └── ClassGroupNode
│   │   └── BreedGroupNode
│   └── FciGroupNode
├── Pagination (paginacja wyników)
└── Modals (AddDogModal, EditDogModal, DeleteDogConfirmation)
```

## 4. Szczegóły komponentów

### DogsListView

- **Opis**: Główny kontener widoku zarządzania psami, koordynuje stan i komunikację między komponentami
- **Główne elementy**: FilterPanel, HierarchicalList, Pagination, modals
- **Obsługiwane interakcje**: inicjalizacja danych, obsługa błędów, nawigacja
- **Obsługiwana walidacja**: sprawdzenie uprawnień użytkownika, walidacja showId
- **Typy**: DogsListViewModel, FilterState, PaginationDto
- **Propsy**: showId: string, userRole: UserRole

### FilterPanel

- **Opis**: Panel z filtrami i wyszukiwaniem dla listy psów
- **Główne elementy**: BreedFilter, GenderFilter, ClassFilter, StatusFilter, SearchBar, ClearFiltersButton
- **Obsługiwane interakcje**: zmiana filtrów, wyszukiwanie, czyszczenie filtrów
- **Obsługiwana walidacja**: walidacja wartości filtrów, minimalna długość wyszukiwania (2 znaki)
- **Typy**: FilterState, BreedResponseDto[], DogGender[], DogClass[]
- **Propsy**: filters: FilterState, onFiltersChange: (filters: FilterState) => void, breeds: BreedResponseDto[]

### HierarchicalList

- **Opis**: Renderuje hierarchiczną strukturę: Grupa FCI → Rasa → Klasa → Pies
- **Główne elementy**: FciGroupNode, BreedGroupNode, ClassGroupNode, DogCard
- **Obsługiwane interakcje**: expand/collapse węzłów, wybór elementu, nawigacja klawiaturą
- **Obsługiwana walidacja**: sprawdzenie czy użytkownik ma dostęp do danej grupy
- **Typy**: HierarchyNode[], HierarchyNode, FCIGroup, Breed, DogClass
- **Propsy**: nodes: HierarchyNode[], onNodeToggle: (nodeId: string) => void, selectedNodeId?: string

### DogCard

- **Opis**: Karta wyświetlająca podstawowe informacje o psie i status opisu
- **Główne elementy**: dog info, StatusBadge, QuickActionMenu, owner info (z privacy toggle)
- **Obsługiwane interakcje**: view details, edit dog, delete dog, create description
- **Obsługiwana walidacja**: sprawdzenie czy można edytować/usunąć psa (ograniczenia czasowe)
- **Typy**: DogCardViewModel, DogResponseDto, ShowRegistration, DescriptionStatus
- **Propsy**: dog: DogCardViewModel, onAction: (action: string, dogId: string) => void

### StatusBadge

- **Opis**: Wizualny wskaźnik statusu opisu psa z kolorami i ikonami
- **Główne elementy**: badge z kolorem, ikona, tekst statusu
- **Obsługiwane interakcje**: click (pokazuje szczegóły statusu)
- **Obsługiwana walidacja**: brak
- **Typy**: DescriptionStatus
- **Propsy**: status: DescriptionStatus, onClick?: () => void

### QuickActionMenu

- **Opis**: Menu z szybkimi akcjami dla psa (view, edit, delete, create description)
- **Główne elementy**: dropdown menu z akcjami, ikony, tooltips
- **Obsługiwane interakcje**: wybór akcji, hover effects
- **Obsługiwana walidacja**: sprawdzenie uprawnień do akcji, ograniczenia czasowe
- **Typy**: QuickAction[], UserRole
- **Propsy**: actions: QuickAction[], userRole: UserRole, canEdit: boolean, canDelete: boolean

## 5. Typy

### DogsListViewModel

```typescript
interface DogsListViewModel {
  showId: string;
  dogs: HierarchyNode[];
  filters: FilterState;
  search: string;
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
}
```

### HierarchyNode

```typescript
interface HierarchyNode {
  type: "fci_group" | "breed" | "class" | "dog";
  id: string;
  name: string;
  children: HierarchyNode[];
  isExpanded: boolean;
  count: number;
  data?: DogResponseDto | Breed | FCIGroup | DogClass;
}
```

### DogCardViewModel

```typescript
interface DogCardViewModel {
  dog: DogResponseDto;
  registration: ShowRegistration;
  descriptionStatus: DescriptionStatus;
  canEdit: boolean;
  canDelete: boolean;
  canCreateDescription: boolean;
  isExpanded: boolean;
}
```

### FilterState

```typescript
interface FilterState {
  breedId?: string;
  gender?: DogGender;
  dogClass?: DogClass;
  descriptionStatus?: DescriptionStatus;
  search?: string;
}
```

### DescriptionStatus

```typescript
interface DescriptionStatus {
  status: "draft" | "completed" | "finalized" | "none";
  lastModified?: string;
  secretaryName?: string;
  version?: number;
}
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

### useDogsList Hook

```typescript
const useDogsList = (showId: string) => {
  const [state, setState] = useState<DogsListViewModel>({
    showId,
    dogs: [],
    filters: {},
    search: "",
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
    canEdit: false,
    canDelete: false,
    userRole: "secretary",
  });

  const fetchDogs = useCallback(async () => {
    // Implementacja pobierania psów z API
  }, [showId, state.filters, state.search, state.pagination.page]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    // Implementacja aktualizacji filtrów
  }, []);

  const searchDogs = useCallback((searchTerm: string) => {
    // Implementacja wyszukiwania
  }, []);

  return {
    state,
    fetchDogs,
    updateFilters,
    searchDogs,
  };
};
```

### useDogActions Hook

```typescript
const useDogActions = () => {
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const editDog = useCallback(async (dogId: string) => {
    // Implementacja edycji psa
  }, []);

  const deleteDog = useCallback(async (dogId: string) => {
    // Implementacja usuwania psa
  }, []);

  const createDescription = useCallback(async (dogId: string) => {
    // Implementacja tworzenia opisu
  }, []);

  return {
    selectedDog,
    isProcessing,
    editDog,
    deleteDog,
    createDescription,
  };
};
```

## 7. Integracja API

### Główne endpointy:

1. **GET /shows/{showId}/registrations** - pobranie rejestracji psów

   - Typ odpowiedzi: `RegistrationResponseDto[]`
   - Użycie: inicjalne ładowanie listy psów

2. **GET /dogs** - pobranie psów z filtrami

   - Typ odpowiedzi: `PaginatedResponseDto<DogResponseDto>`
   - Użycie: wyszukiwanie i filtrowanie psów

3. **GET /breeds** - pobranie ras dla filtrów

   - Typ odpowiedzi: `BreedResponseDto[]`
   - Użycie: lista ras w filtrach

4. **DELETE /dogs/{id}** - usunięcie psa

   - Typ odpowiedzi: `{ message: string }`
   - Użycie: usuwanie psa z wystawy

5. **GET /descriptions?dog_id={id}** - pobranie opisów psa
   - Typ odpowiedzi: `DescriptionResponseDto[]`
   - Użycie: sprawdzenie statusu opisu

### Implementacja wywołań:

```typescript
// W useDogsList
const fetchDogs = async () => {
  setState((prev) => ({ ...prev, isLoading: true }));
  try {
    const response = await fetch(`/api/shows/${showId}/registrations`);
    const data = await response.json();
    // Transformacja danych do hierarchii
    setState((prev) => ({
      ...prev,
      dogs: transformToHierarchy(data),
      isLoading: false,
    }));
  } catch (error) {
    setState((prev) => ({ ...prev, error: error.message, isLoading: false }));
  }
};
```

## 8. Interakcje użytkownika

### Filtrowanie:

- **Wybór rasy**: aktualizuje filtr `breedId`, odświeża listę
- **Wybór płci**: aktualizuje filtr `gender`, odświeża listę
- **Wybór klasy**: aktualizuje filtr `dogClass`, odświeża listę
- **Wybór statusu**: aktualizuje filtr `descriptionStatus`, odświeża listę
- **Czyszczenie filtrów**: resetuje wszystkie filtry, odświeża listę

### Wyszukiwanie:

- **Wprowadzenie tekstu**: debounced search z minimalną długością 2 znaki
- **Clear search**: usuwa filtr wyszukiwania, odświeża listę
- **Enter key**: natychmiastowe wyszukiwanie

### Hierarchia:

- **Kliknięcie grupy FCI**: rozwija/zwija grupę, aktualizuje `isExpanded`
- **Kliknięcie rasy**: rozwija/zwija rasę, aktualizuje `isExpanded`
- **Kliknięcie klasy**: rozwija/zwija klasę, aktualizuje `isExpanded`
- **Keyboard navigation**: strzałki, Enter, Escape

### Akcje na psach:

- **View Details**: otwiera modal z szczegółami psa
- **Edit Dog**: otwiera modal edycji (jeśli dozwolone)
- **Delete Dog**: otwiera modal potwierdzenia (jeśli dozwolone)
- **Create Description**: otwiera modal tworzenia opisu

## 9. Warunki i walidacja

### Uprawnienia użytkownika:

- **Sekretarz**: tylko przypisane rasy, ograniczone akcje
- **Przedstawiciel**: wszystkie psy, pełne uprawnienia
- **Sprawdzenie**: w komponencie `DogsListView` na podstawie `userRole`

### Ograniczenia czasowe:

- **Edycja**: tylko przed rozpoczęciem wystawy (`show.status !== 'in_progress'`)
- **Usuwanie**: tylko przed rozpoczęciem wystawy
- **Sprawdzenie**: w komponencie `QuickActionMenu` na podstawie `show.status`

### Walidacja filtrów:

- **breed_id**: musi istnieć w systemie (sprawdzenie w `FilterPanel`)
- **gender**: enum `DogGender` (walidacja w `GenderFilter`)
- **dogClass**: enum `DogClass` (walidacja w `ClassFilter`)
- **descriptionStatus**: enum statusów (walidacja w `StatusFilter`)

### Walidacja wyszukiwania:

- **Minimalna długość**: 2 znaki (sprawdzenie w `SearchBar`)
- **Maksymalna długość**: 100 znaków
- **Debounce**: 300ms opóźnienie

## 10. Obsługa błędów

### Błędy sieciowe:

- **Wyświetlenie**: komunikat błędu w `DogsListView`
- **Akcja**: przycisk "Retry" do ponownego pobrania danych
- **Fallback**: pusty stan z komunikatem

### Błędy uprawnień:

- **Wyświetlenie**: ukrycie akcji wymagających uprawnień
- **Akcja**: komunikat o braku dostępu w `QuickActionMenu`
- **Fallback**: tylko akcje "View Details"

### Błędy walidacji:

- **Wyświetlenie**: błędy pod polami w `FilterPanel`
- **Akcja**: blokada wysłania formularza
- **Fallback**: reset do poprzedniej wartości

### Pusty wynik:

- **Wyświetlenie**: komunikat "No results found" w `HierarchicalList`
- **Akcja**: sugestia zmiany filtrów
- **Fallback**: wyświetlenie wszystkich psów

## 11. Kroki implementacji

1. **Setup podstawowej struktury**

   - Utworzenie pliku `pages/shows/[showId]/dogs/index.astro`
   - Implementacja podstawowego layoutu z nawigacją
   - Setup TypeScript types dla widoku

2. **Implementacja głównych komponentów**

   - `DogsListView` - główny kontener
   - `FilterPanel` - panel filtrów
   - `SearchBar` - wyszukiwanie

3. **Implementacja hierarchicznej listy**

   - `HierarchicalList` - struktura drzewa
   - `FciGroupNode`, `BreedGroupNode`, `ClassGroupNode`
   - Logika expand/collapse

4. **Implementacja kart psów**

   - `DogCard` - karta pojedynczego psa
   - `StatusBadge` - wskaźnik statusu
   - `QuickActionMenu` - menu akcji

5. **Implementacja custom hooks**

   - `useDogsList` - zarządzanie stanem listy
   - `useDogActions` - akcje na psach
   - `useHierarchy` - zarządzanie hierarchią

6. **Integracja z API**

   - Implementacja wywołań do endpointów
   - Obsługa odpowiedzi i błędów
   - Transformacja danych do hierarchii

7. **Implementacja filtrów i wyszukiwania**

   - Logika filtrowania
   - Debounced search
   - Synchronizacja z API

8. **Implementacja modali**

   - `AddDogModal` - dodawanie psa
   - `EditDogModal` - edycja psa
   - `DeleteDogConfirmation` - potwierdzenie usunięcia

9. **Implementacja walidacji i uprawnień**

   - Sprawdzanie uprawnień użytkownika
   - Walidacja ograniczeń czasowych
   - Obsługa błędów walidacji

10. **Testowanie i optymalizacja**
    - Testy jednostkowe komponentów
    - Testy integracyjne
    - Optymalizacja wydajności
    - Testy accessibility
