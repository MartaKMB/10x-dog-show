# Plan implementacji widoków UI - Klub Hovawarta Show

## 1. Przegląd

System Klub Hovawarta Show to aplikacja webowa do zarządzania wystawami klubowymi hovawartów. Aplikacja umożliwia członkom zarządu klubu zarządzanie wystawami, psami, właścicielami, ocenami i statystykami. System jest responsywny i wspiera urządzenia desktop oraz mobilne.

## 2. Routing widoków

### Główne ścieżki aplikacji:

- `/auth/login` - Logowanie użytkownika
- `/` - Dashboard główny
- `/shows` - Lista wystaw
- `/shows/[showId]` - Szczegóły wystawy (z kontrolą uprawnień)
- `/shows/new` - Tworzenie nowej wystawy (tylko zalogowani)
- `/shows/[showId]/edit` - Edycja wystawy (tylko zalogowani, status "SZKIC")
- `/shows/[showId]/registrations` - Rejestracje na wystawę (z kontrolą uprawnień)
- `/shows/[showId]/evaluations` - Oceny wystawy (z kontrolą uprawnień)
- `/shows/[showId]/stats` - Statystyki wystawy
- `/dogs` - Lista psów
- `/dogs/[dogId]` - Szczegóły psa
- `/dogs/new` - Dodawanie psa (tylko zalogowani)
- `/dogs/[dogId]/edit` - Edycja psa (tylko zalogowani)
- `/owners` - Lista właścicieli
- `/owners/[ownerId]` - Szczegóły właściciela
- `/owners/new` - Dodawanie właściciela (tylko zalogowani)
- `/owners/[ownerId]/edit` - Edycja właściciela (tylko zalogowani)
- `/users` - Zarządzanie użytkownikami (tylko admin)

### Kontrola dostępu:

- **Wszystkie ścieżki**: Dostęp do wglądu dla użytkowników niezalogowanych
- **Ścieżki edycji**: Wymagają autoryzacji i odpowiednich uprawnień
- **Ścieżki zarządzania**: Wymagają roli admin

## 3. Struktura komponentów

### Hierarchia głównych komponentów:

```
App
├── AuthGuard
├── Layout
│   ├── Sidebar (desktop) / TopNavigation (mobile)
│   ├── Breadcrumbs
│   └── Main Content
│       ├── Dashboard
│       ├── Shows Management
│       ├── Dogs Management
│       ├── Owners Management
│       └── Users Management
└── Common Components
    ├── LoadingSpinner
    ├── ErrorBoundary
    ├── EmptyState
    ├── SearchInput
    ├── FilterPanel
    ├── NotificationToast
    ├── Modal
    └── Tooltip
```

## 4. Szczegóły komponentów

### LoginForm

- **Opis**: Formularz logowania z walidacją email i hasła
- **Główne elementy**: Input email, input password, submit button, error messages
- **Obsługiwane zdarzenia**: onSubmit, onChange, onBlur
- **Walidacja**: Email format, password minimum 8 znaków, required fields
- **Typy**: LoginRequest, LoginResponse, ErrorResponse
- **Propsy**: onSubmit, isLoading, error

### AuthGuard

- **Opis**: Komponent ochrony tras wymagających uwierzytelnienia
- **Główne elementy**: Redirect logic, loading state
- **Obsługiwane zdarzenia**: Authentication check, redirect
- **Walidacja**: Token validity, user role
- **Typy**: UserProfile, UserRole
- **Propsy**: children, requiredRole

### Sidebar/TopNavigation

- **Opis**: Nawigacja główna aplikacji (desktop/mobile)
- **Główne elementy**: Navigation links, user menu, logout button
- **Obsługiwane zdarzenia**: onClick navigation, logout
- **Walidacja**: Active route highlighting
- **Typy**: UserProfile, NavigationItem
- **Propsy**: user, currentRoute, onLogout

### Dashboard

- **Opis**: Główny panel z statystykami i szybkimi akcjami
- **Główne elementy**: StatsCards, RecentShows, QuickActions, Notifications
- **Obsługiwane zdarzenia**: Quick action clicks, show navigation
- **Walidacja**: Data availability
- **Typy**: DashboardStats, ShowResponse[], QuickAction[]
- **Propsy**: stats, recentShows, quickActions

### ShowsList

- **Opis**: Lista wszystkich wystaw z filtrami i paginacją
- **Główne elementy**: ShowsTable, ShowFilters, Pagination, SearchInput
- **Obsługiwane zdarzenia**: Filter changes, pagination, search, row clicks
- **Walidacja**: Filter validation, search input
- **Typy**: ShowResponse[], ShowQueryParams, PaginationInfo
- **Propsy**: shows, pagination, filters, onFilterChange, onPageChange

### ShowDetails

- **Opis**: Szczegółowy widok wystawy z rejestracjami i ocenami
- **Główne elementy**: ShowHeader, ShowStats, RegistrationsList, EvaluationsList, AccessControl
- **Obsługiwane zdarzenia**: Status changes, navigation to registrations/evaluations
- **Walidacja**: Show status transitions, user permissions
- **Typy**: ShowResponse, RegistrationResponse[], EvaluationResponse[], ShowPermissions
- **Propsy**: show, registrations, evaluations, onStatusChange, isAuthenticated
- **Kontrola dostępu**: Dynamiczne wyświetlanie przycisków edycji oparte na statusie i autoryzacji

### ShowForm

- **Opis**: Formularz tworzenia/edycji wystawy
- **Główne elementy**: Form fields, validation messages, submit/cancel buttons
- **Obsługiwane zdarzenia**: Form submission, field changes, validation
- **Walidacja**: Required fields, date validation, unique show name
- **Typy**: ShowCreateRequest, ShowUpdateRequest, ValidationError[]
- **Propsy**: initialData, onSubmit, onCancel, isLoading

### DogsList

- **Opis**: Lista psów z wyszukiwaniem i filtrami
- **Główne elementy**: DogsTable, DogFilters, SearchInput, Pagination
- **Obsługiwane zdarzenia**: Search, filter changes, row clicks, pagination
- **Walidacja**: Search input, filter validation
- **Typy**: DogResponse[], DogQueryParams, PaginationInfo
- **Propsy**: dogs, pagination, filters, onSearch, onFilterChange

### DogDetails

- **Opis**: Szczegółowy widok psa z historią wystaw
- **Główne elementy**: DogHeader, DogInfo, DogHistory, DogStats
- **Obsługiwane zdarzenia**: Navigation to shows, edit dog
- **Walidacja**: Data availability
- **Typy**: DogResponse, DogHistoryEntry[]
- **Propsy**: dog, history, onEdit

### DogForm

- **Opis**: Formularz dodawania/edycji psa
- **Główne elementy**: Form fields, owner selector, validation messages
- **Obsługiwane zdarzenia**: Form submission, owner selection, validation
- **Walidacja**: Required fields, microchip format, unique microchip
- **Typy**: DogCreateRequest, DogUpdateRequest, OwnerResponse[]
- **Propsy**: initialData, owners, onSubmit, onCancel

### OwnersList

- **Opis**: Lista właścicieli z filtrami GDPR
- **Główne elementy**: OwnersTable, OwnerFilters, GDPRStatusBadge, Pagination
- **Obsługiwane zdarzenia**: Filter changes, GDPR consent management
- **Walidacja**: Filter validation
- **Typy**: OwnerResponse[], OwnerQueryParams, PaginationInfo
- **Propsy**: owners, pagination, filters, onFilterChange

### OwnerDetails

- **Opis**: Szczegółowy widok właściciela z listą psów
- **Główne elementy**: OwnerHeader, OwnerInfo, OwnerDogs, GDPRHistory
- **Obsługiwane zdarzenia**: GDPR consent changes, navigation to dogs
- **Walidacja**: GDPR consent validation
- **Typy**: OwnerResponse, DogResponse[]
- **Propsy**: owner, dogs, onGDPRChange

### OwnerForm

- **Opis**: Formularz dodawania/edycji właściciela
- **Główne elementy**: Form fields, GDPR consent checkbox, validation
- **Obsługiwane zdarzenia**: Form submission, GDPR consent
- **Walidacja**: Required fields, email format, GDPR consent required
- **Typy**: OwnerCreateRequest, OwnerUpdateRequest
- **Propsy**: initialData, onSubmit, onCancel

### RegistrationsList

- **Opis**: Lista rejestracji na wystawę
- **Główne elementy**: RegistrationsTable, RegistrationFilters, CatalogNumbers
- **Obsługiwane zdarzenia**: Filter changes, registration actions
- **Walidacja**: Registration limits, class validation
- **Typy**: RegistrationResponse[], RegistrationQueryParams
- **Propsy**: registrations, show, onFilterChange, onRegistrationAction

### EvaluationsList

- **Opis**: Lista ocen na wystawie
- **Główne elementy**: EvaluationsTable, EvaluationFilters, GradeBadge, TitleBadge
- **Obsługiwane zdarzenia**: Filter changes, evaluation actions
- **Walidacja**: Grade validation, title uniqueness
- **Typy**: EvaluationResponse[], EvaluationQueryParams
- **Propsy**: evaluations, show, onFilterChange, onEvaluationAction

### EvaluationForm

- **Opis**: Formularz wprowadzania/edycji oceny
- **Główne elementy**: Grade selector, title selector, placement selector
- **Obsługiwane zdarzenia**: Form submission, validation
- **Walidacja**: Grade-title compatibility, unique titles
- **Typy**: EvaluationCreateRequest, EvaluationUpdateRequest
- **Propsy**: dog, show, initialData, onSubmit, onCancel

### UsersList

- **Opis**: Lista użytkowników systemu (tylko admin)
- **Główne elementy**: UsersTable, UserStatusBadge, UserActions
- **Obsługiwane zdarzenia**: User management actions
- **Walidacja**: Admin permissions
- **Typy**: UserProfile[], UserQueryParams
- **Propsy**: users, onUserAction

### Common Components

- **LoadingSpinner**: Wskaźnik ładowania
- **ErrorBoundary**: Obsługa błędów aplikacji
- **EmptyState**: Stan pustej listy
- **SearchInput**: Pole wyszukiwania z debounce
- **FilterPanel**: Panel filtrów z reset
- **NotificationToast**: Powiadomienia systemowe
- **Modal**: Modalne okna z backdrop
- **Tooltip**: Podpowiedzi kontekstowe

## 5. Typy

### Authentication Types

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: UserProfile;
  access_token: string;
  expires_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}
```

### Shows Types

```typescript
interface ShowListResponse {
  shows: ShowResponse[];
  pagination: PaginationInfo;
}

interface ShowCreateRequest {
  name: string;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description?: string;
  max_participants?: number;
}

interface ShowResponse {
  id: string;
  name: string;
  status: ShowStatus;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description: string | null;
  max_participants: number | null;
  registered_dogs: number;
  created_at: string;
}
```

### Dogs Types

```typescript
interface DogListResponse {
  dogs: DogResponse[];
  pagination: PaginationInfo;
}

interface DogCreateRequest {
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owners: {
    id: string;
    is_primary: boolean;
  }[];
}

interface DogResponse {
  id: string;
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string | null;
  kennel_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  owners: DogOwnerInfo[];
  created_at: string;
}
```

### Evaluations Types

```typescript
interface EvaluationListResponse {
  evaluations: EvaluationResponse[];
  pagination: PaginationInfo;
}

interface EvaluationCreateRequest {
  dog_id: string;
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
}

interface EvaluationResponse {
  id: string;
  dog: {
    id: string;
    name: string;
    gender: DogGender;
    birth_date: string;
  };
  dog_class: DogClass;
  grade: EvaluationGrade | null;
  baby_puppy_grade: BabyPuppyGrade | null;
  club_title: ClubTitle | null;
  placement: Placement | null;
  created_at: string;
}
```

### ViewModel Types

```typescript
interface ShowsListViewModel {
  shows: ShowResponse[];
  pagination: PaginationInfo;
  filters: ShowFilters;
  isLoading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface ShowDetailsViewModel {
  show: ShowResponse | null;
  registrations: RegistrationResponse[];
  evaluations: EvaluationResponse[];
  stats: ShowStats;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
}

interface DogsListViewModel {
  dogs: DogResponse[];
  pagination: PaginationInfo;
  filters: DogFilters;
  search: string;
  isLoading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
```

## 6. Zarządzanie stanem

### Custom Hooks

```typescript
// useAuth - zarządzanie uwierzytelnieniem
const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const login = async (email: string, password: string) => {
    /* ... */
  };
  const logout = async () => {
    /* ... */
  };
  const checkAuth = async () => {
    /* ... */
  };

  return { ...state, login, logout, checkAuth };
};

// useShows - zarządzanie wystawami
const useShows = () => {
  const [state, setState] = useState<ShowsState>({
    /* ... */
  });

  const fetchShows = async (params?: ShowQueryParams) => {
    /* ... */
  };
  const createShow = async (data: ShowCreateRequest) => {
    /* ... */
  };
  const updateShow = async (id: string, data: ShowUpdateRequest) => {
    /* ... */
  };
  const deleteShow = async (id: string) => {
    /* ... */
  };

  return { ...state, fetchShows, createShow, updateShow, deleteShow };
};

// useDogs - zarządzanie psami
const useDogs = () => {
  const [state, setState] = useState<DogsState>({
    /* ... */
  });

  const fetchDogs = async (params?: DogQueryParams) => {
    /* ... */
  };
  const createDog = async (data: DogCreateRequest) => {
    /* ... */
  };
  const updateDog = async (id: string, data: DogUpdateRequest) => {
    /* ... */
  };
  const deleteDog = async (id: string) => {
    /* ... */
  };
  const searchDogs = async (query: string) => {
    /* ... */
  };

  return { ...state, fetchDogs, createDog, updateDog, deleteDog, searchDogs };
};
```

## 7. Integracja API

### Authentication API

```typescript
// POST /auth/login
const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// GET /auth/me
const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### Shows API

```typescript
// GET /shows
const getShows = async (
  params?: ShowQueryParams,
): Promise<ShowListResponse> => {
  const queryString = new URLSearchParams(
    params as Record<string, string>,
  ).toString();
  const response = await fetch(`/api/shows?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// POST /shows
const createShow = async (data: ShowCreateRequest): Promise<ShowResponse> => {
  const response = await fetch("/api/shows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### Dogs API

```typescript
// GET /dogs
const getDogs = async (params?: DogQueryParams): Promise<DogListResponse> => {
  const queryString = new URLSearchParams(
    params as Record<string, string>,
  ).toString();
  const response = await fetch(`/api/dogs?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// POST /dogs
const createDog = async (data: DogCreateRequest): Promise<DogResponse> => {
  const response = await fetch("/api/dogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

## 8. Interakcje użytkownika

### Authentication Interactions

1. **Logowanie**: Wprowadzenie email/hasła → Walidacja → Przekierowanie do dashboardu
2. **Wylogowanie**: Kliknięcie "Wyloguj" → Potwierdzenie → Przekierowanie do logowania
3. **Brak uprawnień**: Próba dostępu → Przekierowanie do logowania

### Shows Interactions

1. **Tworzenie wystawy**: Kliknięcie "Dodaj" → Formularz → Walidacja → Zapisywanie
2. **Edycja wystawy**: Kliknięcie "Edytuj" → Formularz → Walidacja → Aktualizacja
3. **Usuwanie wystawy**: Kliknięcie "Usuń" → Potwierdzenie → Usunięcie
4. **Zmiana statusu**: Wybór statusu → Walidacja → Aktualizacja

### Dogs Interactions

1. **Dodawanie psa**: Kliknięcie "Dodaj psa" → Formularz → Walidacja → Zapisywanie
2. **Wyszukiwanie psów**: Wprowadzenie tekstu → Debounced search → Filtrowanie
3. **Filtrowanie psów**: Wybór filtrów → Aktualizacja listy
4. **Edycja psa**: Kliknięcie "Edytuj" → Formularz → Walidacja → Aktualizacja

### Evaluations Interactions

1. **Wprowadzanie oceny**: Wybór oceny → Walidacja → Zapisywanie
2. **Przypisywanie tytułu**: Wybór tytułu → Walidacja → Zapisywanie
3. **Przypisywanie lokaty**: Wybór lokaty → Walidacja → Zapisywanie

## 9. Warunki i walidacja

### Authentication Validation

- **Email format**: Regex walidacja w LoginForm
- **Password length**: Minimum 8 znaków w LoginForm
- **Token expiration**: Sprawdzanie w AuthGuard
- **Role permissions**: Sprawdzanie w komponentach

### Access Control Validation

- **User authentication**: Sprawdzanie czy użytkownik jest zalogowany
- **Show status permissions**: Walidacja uprawnień do edycji na podstawie statusu wystawy
- **Guest access**: Umożliwienie wglądu bez autoryzacji
- **Permission enforcement**: Blokowanie operacji edycji dla użytkowników bez uprawnień

### Shows Validation

- **Unique show name**: Walidacja w ShowForm
- **Date validation**: Registration deadline < show date
- **Status transitions**: Walidacja w ShowActions
- **Required fields**: Walidacja w ShowForm
- **Access permissions**: Walidacja uprawnień do edycji na podstawie statusu
- **Status-based editing**: Edycja tylko w statusie "SZKIC"

### Dogs Validation

- **Unique microchip**: Walidacja w DogForm
- **Valid birth date**: Walidacja wieku w DogForm
- **Required owners**: Minimum 1 właściciel w DogForm
- **Valid microchip format**: 15 cyfr w DogForm

### Evaluations Validation

- **Dog registered for show**: Sprawdzanie w EvaluationForm
- **Valid grade for class**: Baby/puppy vs regular grades
- **Unique titles**: Sprawdzanie w EvaluationForm
- **Valid placement**: 1st, 2nd, 3rd, 4th

## 10. Obsługa błędów

### Network Errors

- **Brak połączenia**: Wyświetlenie komunikatu z retry button
- **Timeout**: Wyświetlenie komunikatu z retry button
- **Server error**: Wyświetlenie komunikatu o kontakcie z adminem

### Validation Errors

- **Form validation**: Wyświetlenie błędów pod polami formularza
- **API validation**: Wyświetlenie błędów w toast notification
- **Business logic errors**: Wyświetlenie komunikatów w modal

### Authentication Errors

- **Invalid credentials**: Wyświetlenie błędu w formularzu logowania
- **Token expired**: Przekierowanie do logowania
- **Insufficient permissions**: Wyświetlenie komunikatu o braku uprawnień

### Data Errors

- **Missing data**: Wyświetlenie EmptyState komponentu
- **Corrupted data**: Wyświetlenie komunikatu o błędzie danych
- **Inconsistent data**: Walidacja i ostrzeżenia dla użytkownika

## 11. Kroki implementacji

### Faza 1: Podstawowa infrastruktura

1. **Setup projektu**: Konfiguracja Astro + React + TypeScript
2. **Authentication**: Implementacja LoginForm, AuthGuard, useAuth hook
3. **Layout**: Implementacja Sidebar, TopNavigation, Breadcrumbs
4. **Common components**: LoadingSpinner, ErrorBoundary, EmptyState
5. **Access Control**: Implementacja systemu uprawnień opartego na autoryzacji i statusie
6. **Guest Preview Mode**: Implementacja trybu podglądu dla użytkowników niezalogowanych

### Faza 2: Zarządzanie danymi

1. **Shows management**: ShowsList, ShowDetails, ShowForm, useShows hook
2. **Dogs management**: DogsList, DogDetails, DogForm, useDogs hook
3. **Owners management**: OwnersList, OwnerDetails, OwnerForm, useOwners hook

### Faza 3: System ocen

1. **Registrations**: RegistrationsList, RegistrationForm
2. **Evaluations**: EvaluationsList, EvaluationForm
3. **Statistics**: ShowStats, StatsCharts, StatsTables

### Faza 4: Finalizacja

1. **Users management**: UsersList, UserForm (tylko admin)
2. **Search i filtry**: SearchInput, FilterPanel dla wszystkich list
3. **Responsywność**: Mobile-first design dla wszystkich komponentów
4. **Testowanie**: Unit tests, integration tests, E2E tests

### Faza 5: Optymalizacja

1. **Performance**: Lazy loading, code splitting, caching
2. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
3. **Error handling**: Comprehensive error boundaries i fallbacks
4. **Documentation**: Component documentation, API documentation
