# API Endpoint Implementation Plan: Show Management + Show Registration

## 1. Przegląd punktów końcowych

Kompleksowy system zarządzania wystawami psów i rejestracji psów na wystawy. System obejmuje pełny cykl życia wystawy od tworzenia przez zarządzanie rejestracjami aż po zakończenie wystawy.

### Show Management

- Tworzenie, edycja, przeglądanie i usuwanie wystaw
- Zarządzanie statusem wystawy (draft, open_for_registration, etc.)
- Konfiguracja parametrów wystawy (daty, lokalizacja, opłaty)
- Statystyki i raporty wystaw

### Show Registration Management

- Rejestracja psów na wystawy
- Zarządzanie listą uczestników
- Filtrowanie i wyszukiwanie rejestracji
- Statystyki rejestracji (opłacone/nieopłacone, podział według klas)

## 2. Szczegóły żądań

### 2.1 Show Management Endpoints

#### GET /shows

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows`
- **Parametry query:**
  - `status` (optional): Filtr po statusie wystawy
  - `show_type` (optional): Filtr po typie wystawy (national/international)
  - `from_date` (optional): Filtr wystaw od daty (ISO 8601)
  - `to_date` (optional): Filtr wystaw do daty (ISO 8601)
  - `organizer_id` (optional): Filtr po organizatorze
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### GET /shows/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows/{id}`
- **Parametry:** `id` (UUID) - Identyfikator wystawy
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /shows

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/shows`
- **Request Body:** CreateShowDto
- **Autoryzacja:** Przedstawiciele oddziałów (rola: department_representative)

#### PUT /shows/{id}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/shows/{id}`
- **Request Body:** UpdateShowDto
- **Autoryzacja:** Przedstawiciele oddziałów (tylko przed rozpoczęciem wystawy)

#### PATCH /shows/{id}/status

- **Metoda HTTP:** PATCH
- **Struktura URL:** `/api/shows/{id}/status`
- **Request Body:** UpdateShowStatusDto
- **Autoryzacja:** Przedstawiciele oddziałów

#### DELETE /shows/{id}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/shows/{id}`
- **Autoryzacja:** Przedstawiciele oddziałów (tylko przed rozpoczęciem wystawy)

### 2.2 Show Registration Management Endpoints

#### GET /shows/{showId}/registrations

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows/{showId}/registrations`
- **Parametry query:**
  - `dog_class` (optional): Filtr po klasie psa
  - `is_paid` (optional): Filtr po statusie płatności
  - `breed_id` (optional): Filtr po rasie
  - `gender` (optional): Filtr po płci
  - `search` (optional): Wyszukiwanie w nazwie psa lub właściciela
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /shows/{showId}/registrations

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/shows/{showId}/registrations`
- **Request Body:** CreateRegistrationDto
- **Autoryzacja:** Przedstawiciele oddziałów i sekretarze

#### GET /shows/{showId}/registrations/{registrationId}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows/{showId}/registrations/{registrationId}`
- **Parametry:** `showId` (UUID), `registrationId` (UUID)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### PUT /shows/{showId}/registrations/{registrationId}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/shows/{showId}/registrations/{registrationId}`
- **Request Body:** UpdateRegistrationDto
- **Autoryzacja:** Przedstawiciele oddziałów (tylko przed rozpoczęciem wystawy)

#### DELETE /shows/{showId}/registrations/{registrationId}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/shows/{showId}/registrations/{registrationId}`
- **Autoryzacja:** Przedstawiciele oddziałów (tylko przed rozpoczęciem wystawy)

#### PATCH /shows/{showId}/registrations/{registrationId}/payment

- **Metoda HTTP:** PATCH
- **Struktura URL:** `/api/shows/{showId}/registrations/{registrationId}/payment`
- **Request Body:** UpdatePaymentStatusDto
- **Autoryzacja:** Przedstawiciele oddziałów

#### GET /shows/{showId}/registrations/stats

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows/{showId}/registrations/stats`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

## 3. Wykorzystywane typy

### 3.1 Show Management DTOs

```typescript
// Query Parameters
ShowQueryParams {
  status?: ShowStatus;
  show_type?: ShowType;
  from_date?: string;
  to_date?: string;
  organizer_id?: string;
  page?: number;
  limit?: number;
}

// Request DTOs
CreateShowDto {
  name: string;
  show_type: ShowType;
  show_date: string;
  registration_deadline: string;
  venue_id: string;
  max_participants?: number;
  entry_fee?: number;
  description?: string;
  language: Language;
}

UpdateShowDto {
  name?: string;
  show_date?: string;
  registration_deadline?: string;
  venue_id?: string;
  max_participants?: number;
  entry_fee?: number;
  description?: string;
}

UpdateShowStatusDto {
  status: ShowStatus;
}

// Response DTOs
ShowResponseDto {
  id: string;
  name: string;
  show_type: ShowType;
  status: ShowStatus;
  show_date: string;
  registration_deadline: string;
  venue: VenueSummaryDto;
  organizer: UserSummaryDto;
  max_participants?: number;
  registered_dogs: number;
  entry_fee?: number;
  description?: string;
  language: Language;
  created_at: string;
  updated_at: string;
}

ShowDetailResponseDto extends ShowResponseDto {
  venue: VenueDetailDto;
  organizer: UserDetailDto;
  stats: ShowStatsDto;
}

ShowStatsDto {
  total_registrations: number;
  paid_registrations: number;
  unpaid_registrations: number;
  by_class: Record<DogClass, number>;
  by_gender: Record<DogGender, number>;
  by_breed_group: Record<FCIGroup, number>;
}

PaginatedResponseDto<ShowResponseDto>;
```

### 3.2 Show Registration Management DTOs

```typescript
// Query Parameters
RegistrationQueryParams {
  dog_class?: DogClass;
  is_paid?: boolean;
  breed_id?: string;
  gender?: DogGender;
  search?: string;
  page?: number;
  limit?: number;
}

// Request DTOs
CreateRegistrationDto {
  dog_id: string;
  dog_class: DogClass;
  registration_fee?: number;
  notes?: string;
}

UpdateRegistrationDto {
  dog_class?: DogClass;
  registration_fee?: number;
  notes?: string;
}

UpdatePaymentStatusDto {
  is_paid: boolean;
  payment_date?: string;
  payment_method?: string;
}

// Response DTOs
RegistrationResponseDto {
  id: string;
  show_id: string;
  dog: DogSummaryDto;
  dog_class: DogClass;
  catalog_number?: number;
  registration_fee: number;
  is_paid: boolean;
  payment_date?: string;
  notes?: string;
  registered_at: string;
}

RegistrationDetailResponseDto extends RegistrationResponseDto {
  dog: DogDetailDto;
  owner: OwnerDetailDto;
}

RegistrationStatsDto {
  total: number;
  paid: number;
  unpaid: number;
  by_class: Record<DogClass, number>;
  by_gender: Record<DogGender, number>;
  by_breed_group: Record<FCIGroup, number>;
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
}

PaginatedResponseDto<RegistrationResponseDto>;
```

### 3.3 Wspólne typy

```typescript
// Enums
ShowStatus: 'draft' | 'open_for_registration' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
ShowType: 'national' | 'international';
DogClass: 'baby' | 'puppy' | 'junior' | 'intermediate' | 'open' | 'working' | 'champion' | 'veteran';
DogGender: 'male' | 'female';
FCIGroup: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8' | 'G9' | 'G10';
Language: 'pl' | 'en';

// Summary DTOs
VenueSummaryDto {
  id: string;
  name: string;
  city: string;
}

VenueDetailDto extends VenueSummaryDto {
  address: string;
  postal_code: string;
  country: string;
}

UserSummaryDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

UserDetailDto extends UserSummaryDto {
  role: UserRole;
  phone?: string;
}

DogSummaryDto {
  id: string;
  name: string;
  breed: BreedSummaryDto;
  gender: DogGender;
  birth_date: string;
}

DogDetailDto extends DogSummaryDto {
  microchip_number: string;
  kennel_club_number?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

OwnerDetailDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  kennel_name?: string;
}

BreedSummaryDto {
  id: string;
  name_pl: string;
  name_en: string;
  fci_group: FCIGroup;
}
```

## 4. Szczegóły odpowiedzi

### 4.1 Kody statusu HTTP

- **200 OK:** Pomyślne operacje odczytu i aktualizacji
- **201 Created:** Pomyślne utworzenie nowego zasobu
- **400 Bad Request:** Błędy walidacji danych wejściowych
- **401 Unauthorized:** Brak lub nieprawidłowy token uwierzytelniający
- **403 Forbidden:** Brak uprawnień do wykonania operacji
- **404 Not Found:** Zasób nie został znaleziony
- **409 Conflict:** Rejestracja już istnieje, limit uczestników przekroczony
- **422 Unprocessable Entity:** Wystawa rozpoczęta, nie można edytować
- **500 Internal Server Error:** Błędy serwera

### 4.2 Przykłady odpowiedzi

#### GET /shows (200 OK)

```json
{
  "shows": [
    {
      "id": "uuid",
      "name": "National Dog Show Warsaw 2024",
      "show_type": "national",
      "status": "open_for_registration",
      "show_date": "2024-03-15",
      "registration_deadline": "2024-03-01",
      "venue": {
        "id": "uuid",
        "name": "Warsaw Expo Center",
        "city": "Warsaw"
      },
      "organizer": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "max_participants": 200,
      "registered_dogs": 45,
      "entry_fee": 50.0,
      "language": "pl",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

#### GET /shows/{showId}/registrations (200 OK)

```json
{
  "registrations": [
    {
      "id": "uuid",
      "show_id": "uuid",
      "dog": {
        "id": "uuid",
        "name": "Bella",
        "breed": {
          "name_pl": "Labrador retriever",
          "fci_group": "G8"
        },
        "gender": "female",
        "birth_date": "2022-05-15"
      },
      "dog_class": "open",
      "catalog_number": 45,
      "registration_fee": 50.0,
      "is_paid": true,
      "payment_date": "2024-01-15T10:30:00Z",
      "registered_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET /shows/{showId}/registrations/stats (200 OK)

```json
{
  "total": 45,
  "paid": 38,
  "unpaid": 7,
  "by_class": {
    "baby": 5,
    "puppy": 8,
    "junior": 12,
    "open": 15,
    "champion": 5
  },
  "by_gender": {
    "male": 25,
    "female": 20
  },
  "by_breed_group": {
    "G1": 8,
    "G8": 15,
    "G9": 12,
    "G10": 10
  },
  "revenue": {
    "total": 2250.0,
    "paid": 1900.0,
    "outstanding": 350.0
  }
}
```

## 5. Przepływ danych

### 5.1 Show Management Flow

#### POST /shows:

1. **Walidacja danych wejściowych** - sprawdzenie wymaganych pól
2. **Walidacja biznesowa** - daty, lokalizacja, uprawnienia
3. **Sprawdzenie duplikatu** - czy wystawa o tej nazwie już istnieje
4. **Transakcja** - utworzenie wystawy z statusem 'draft'
5. **Audyt** - logowanie operacji
6. **Odpowiedź** - zwrócenie utworzonej wystawy

#### PUT /shows/{id}:

1. **Sprawdzenie istnienia** - czy wystawa istnieje
2. **Walidacja stanu** - czy można edytować (nie rozpoczęta)
3. **Walidacja uprawnień** - czy użytkownik jest organizatorem
4. **Aktualizacja** - zapisanie zmian
5. **Odpowiedź** - zwrócenie zaktualizowanej wystawy

#### PATCH /shows/{id}/status:

1. **Sprawdzenie istnienia** - czy wystawa istnieje
2. **Walidacja przejścia** - czy przejście statusu jest dozwolone
3. **Aktualizacja statusu** - zmiana statusu wystawy
4. **Akcje dodatkowe** - powiadomienia, generowanie numerów katalogów
5. **Odpowiedź** - potwierdzenie zmiany statusu

### 5.2 Show Registration Management Flow

#### POST /shows/{showId}/registrations:

1. **Sprawdzenie wystawy** - czy wystawa istnieje i przyjmuje rejestracje
2. **Walidacja psa** - czy pies istnieje i spełnia wymagania
3. **Sprawdzenie limitu** - czy nie przekroczono max_participants
4. **Sprawdzenie duplikatu** - czy pies już nie jest zarejestrowany
5. **Walidacja klasy** - czy klasa psa jest odpowiednia dla wieku
6. **Transakcja** - utworzenie rejestracji
7. **Odpowiedź** - zwrócenie utworzonej rejestracji

#### PUT /shows/{showId}/registrations/{registrationId}:

1. **Sprawdzenie rejestracji** - czy rejestracja istnieje
2. **Walidacja stanu** - czy można edytować (wystawa nie rozpoczęta)
3. **Walidacja danych** - nowe wartości rejestracji
4. **Aktualizacja** - zapisanie zmian
5. **Odpowiedź** - zwrócenie zaktualizowanej rejestracji

#### PATCH /shows/{showId}/registrations/{registrationId}/payment:

1. **Sprawdzenie rejestracji** - czy rejestracja istnieje
2. **Aktualizacja płatności** - zmiana statusu płatności
3. **Logowanie** - zapisanie informacji o płatności
4. **Odpowiedź** - potwierdzenie aktualizacji płatności

#### GET /shows/{showId}/registrations/stats:

1. **Sprawdzenie wystawy** - czy wystawa istnieje
2. **Agregacja danych** - obliczenie statystyk z rejestracji
3. **Odpowiedź** - zwrócenie statystyk

## 6. Względy bezpieczeństwa

### 6.1 Autoryzacja i uwierzytelnianie

- **JWT Token Validation:** Sprawdzanie tokenu w headerze
- **Role-based Access Control:** Przedstawiciele oddziałów dla zarządzania, wszyscy dla odczytu
- **Row Level Security (RLS):** Polityki na poziomie bazy danych

### 6.2 Walidacja danych wejściowych

- **Zod Schemas:** Walidacja wszystkich DTOs
- **Date Validation:** Sprawdzenie relacji dat (registration_deadline <= show_date)
- **Business Rule Validation:** Reguły rejestracji i limitów
- **SQL Injection Prevention:** Parametryzowane zapytania

### 6.3 Walidacja biznesowa

- **Show Status:** Edycja tylko przed rozpoczęciem wystawy
- **Registration Limits:** Nie przekraczać max_participants
- **Dog Class Validation:** Zgodność klasy z wiekiem psa
- **Payment Tracking:** Śledzenie statusu płatności

### 6.4 Rate Limiting

- **Authenticated requests:** 1000 requests/hour per user
- **Registration creation:** 100 registrations/hour per user
- **Show creation:** 10 shows/hour per user

## 7. Obsługa błędów

### 7.1 Typy błędów i kody

- **VALIDATION_ERROR (400):** Błędy walidacji danych wejściowych
- **AUTHENTICATION_ERROR (401):** Nieprawidłowy lub wygasły token
- **AUTHORIZATION_ERROR (403):** Brak uprawnień do operacji
- **NOT_FOUND (404):** Wystawa/rejestracja nie istnieje
- **CONFLICT (409):** Rejestracja już istnieje, limit przekroczony
- **BUSINESS_RULE_ERROR (422):** Wystawa rozpoczęta, nie można edytować
- **INTERNAL_ERROR (500):** Błędy serwera

### 7.2 Przykłady błędów

```json
// Limit uczestników przekroczony
{
  "error": {
    "code": "CONFLICT",
    "message": "Maximum participants limit reached for this show"
  }
}

// Wystawa już rozpoczęta
{
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Cannot modify registrations for started shows"
  }
}

// Nieprawidłowa klasa psa
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid dog class for age",
    "details": [{"field": "dog_class", "message": "Dog age does not match selected class"}]
  }
}

// Rejestracja już istnieje
{
  "error": {
    "code": "CONFLICT",
    "message": "Dog is already registered for this show"
  }
}
```

## 8. Rozważania dotyczące wydajności

### 8.1 Optymalizacja zapytań

- **Indexing:** Indeksy na (organizer_id, status), (show_date), (registration_deadline)
- **JOIN Optimization:** Efektywne JOINy z tabelami venues, users, dogs, owners
- **Pagination:** Cursor-based pagination dla dużych zbiorów
- **Query Caching:** Cache dla często używanych danych

### 8.2 Strategie buforowania

- **Redis Cache:** Cache dla wystaw i rejestracji
- **Stats Caching:** Cache statystyk rejestracji
- **Response Caching:** Cache odpowiedzi dla operacji odczytu

### 8.3 Monitoring wydajności

- **Query Performance:** Monitorowanie czasu wykonywania zapytań
- **Registration Rate:** Śledzenie tempa rejestracji
- **Payment Processing:** Monitorowanie płatności
- **Error Rate Monitoring:** Śledzenie wskaźników błędów

## 9. Etapy wdrożenia

### 9.1 Faza 1: Podstawowa infrastruktura

1. **Setup Validation Schemas**

   - Utworzenie Zod schemas dla wszystkich DTOs
   - Implementacja walidacji biznesowej
   - Testy jednostkowe dla schemas

2. **Error Handling Infrastructure**

   - Implementacja centralnego error handler
   - Utworzenie typów ErrorResponseDto
   - Setup logging system

3. **Database Connection Setup**
   - Konfiguracja Supabase client
   - Implementacja middleware dla context.locals
   - Setup TypeScript types

### 9.2 Faza 2: Show Management

1. **ShowService**

   - Implementacja CRUD operacji dla wystaw
   - Zarządzanie statusem wystaw
   - Walidacja uprawnień organizatorów
   - Statystyki wystaw

2. **API Endpoints**
   - GET /shows (z paginacją i filtrami)
   - GET /shows/{id}
   - POST /shows
   - PUT /shows/{id}
   - PATCH /shows/{id}/status
   - DELETE /shows/{id}

### 9.3 Faza 3: Show Registration Management

1. **RegistrationService**

   - Implementacja CRUD operacji dla rejestracji
   - Walidacja limitów uczestników
   - Zarządzanie płatnościami
   - Statystyki rejestracji

2. **API Endpoints**
   - GET /shows/{showId}/registrations
   - POST /shows/{showId}/registrations
   - GET /shows/{showId}/registrations/{registrationId}
   - PUT /shows/{showId}/registrations/{registrationId}
   - DELETE /shows/{showId}/registrations/{registrationId}
   - PATCH /shows/{showId}/registrations/{registrationId}/payment
   - GET /shows/{showId}/registrations/stats

### 9.4 Faza 4: Security & Testing

1. **Authentication & Authorization**

   - JWT token validation
   - Row Level Security policies
   - Role-based access control

2. **Input Validation & Sanitization**

   - Comprehensive input validation
   - SQL injection prevention
   - XSS protection

3. **Testing**
   - Unit tests dla services
   - Integration tests dla endpoints
   - Security tests
   - Performance tests

### 9.5 Faza 5: Performance & Monitoring

1. **Performance Optimization**

   - Database indexing
   - Query optimization
   - Caching implementation

2. **Monitoring & Logging**

   - Error tracking
   - Performance monitoring
   - Audit logging

3. **Documentation**
   - API documentation
   - Code documentation
   - Deployment guides

### 9.6 Faza 6: Deployment & Maintenance

1. **Production Deployment**

   - Environment configuration
   - Database migrations
   - Monitoring setup

2. **Maintenance & Updates**
   - Regular security updates
   - Performance monitoring
   - Bug fixes and improvements

## 10. Pliki do utworzenia/modyfikacji

### 10.1 Nowe pliki:

- `src/lib/validation/showSchemas.ts` (rozszerzenie)
- `src/lib/validation/registrationSchemas.ts`
- `src/lib/services/showService.ts` (rozszerzenie)
- `src/lib/services/registrationService.ts`
- `src/pages/api/shows.ts` (rozszerzenie)
- `src/pages/api/shows/[id].ts` (rozszerzenie)
- `src/pages/api/shows/[id]/registrations.ts`
- `src/pages/api/shows/[id]/registrations/[registrationId].ts`
- `src/pages/api/shows/[id]/registrations/stats.ts`

### 10.2 Modyfikowane pliki:

- `src/types.ts` (dodanie brakujących typów)
- `src/lib/services/errorHandler.ts` (rozszerzenie o nowe błędy)
- `src/lib/services/permissionService.ts` (dodanie uprawnień dla rejestracji)

### 10.3 Pliki konfiguracyjne:

- `supabase/migrations/` (nowe migracje dla indeksów)
- `package.json` (dodanie zależności testowych)

## 11. Kryteria akceptacji

### 11.1 Funkcjonalne:

- ✅ Endpointy akceptują prawidłowe dane i tworzą/aktualizują wystawy
- ✅ System zarządzania statusem wystaw działa poprawnie
- ✅ Rejestracje psów są walidowane zgodnie z regułami biznesowymi
- ✅ Limity uczestników są przestrzegane
- ✅ Statystyki rejestracji są obliczane poprawnie
- ✅ Obsługa wszystkich scenariuszy błędów
- ✅ Logowanie audytu dla każdej akcji

### 11.2 Niefunkcjonalne:

- ✅ Czas odpowiedzi < 500ms dla 95% żądań
- ✅ Obsługa 1000 żądań na godzinę na użytkownika
- ✅ 99.9% dostępność endpointów
- ✅ Pełne pokrycie testami (>90%)

### 11.3 Bezpieczeństwo:

- ✅ Tylko przedstawiciele oddziałów mogą zarządzać wystawami
- ✅ Wszystkie dane wejściowe są walidowane i sanityzowane
- ✅ RLS policies chronią dane użytkowników
- ✅ Brak ekspozycji wrażliwych informacji w błędach

Ten plan zapewnia kompleksową implementację systemu zarządzania wystawami i rejestracjami psów z uwzględnieniem wszystkich aspektów bezpieczeństwa, wydajności i niezawodności wymaganych w aplikacji zarządzania wystawami psów.
