# API Endpoint Implementation Plan: Dogs and Owners Management

## 1. Przegląd punktów końcowych

### Dogs Management

Zestaw endpointów do zarządzania psami w systemie wystaw. Obsługuje tworzenie, edycję i usuwanie psów z walidacją ras, numerów mikrochipów i relacji z właścicielami.

### Owners Management

Zestaw endpointów do zarządzania właścicielami psów z uwzględnieniem zgodności RODO. Obsługuje operacje CRUD z automatycznym śledzeniem zgód na przetwarzanie danych.

## 2. Szczegóły żądań

### Dogs Management Endpoints

#### GET /dogs

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/dogs`
- **Parametry:**
  - Wymagane: Brak
  - Opcjonalne: `breed_id`, `gender`, `owner_id`, `microchip_number`, `kennel_club_number`, `page`, `limit`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### GET /dogs/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/dogs/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /dogs

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/dogs`
- **Parametry:**
  - Wymagane: Brak
  - Opcjonalne: Brak
- **Request Body:** CreateDogDto
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### PUT /dogs/{id}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/dogs/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Request Body:** UpdateDogDto
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### DELETE /dogs/{id}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/dogs/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

### Owners Management Endpoints

#### GET /owners

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/owners`
- **Parametry:**
  - Wymagane: Brak
  - Opcjonalne: `email`, `city`, `country`, `gdpr_consent`, `page`, `limit`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### GET /owners/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/owners/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /owners

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/owners`
- **Parametry:**
  - Wymagane: Brak
  - Opcjonalne: Brak
- **Request Body:** CreateOwnerDto
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### PUT /owners/{id}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/owners/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Request Body:** UpdateOwnerDto
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### DELETE /owners/{id}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/owners/{id}`
- **Parametry:**
  - Wymagane: `id` (UUID)
  - Opcjonalne: Brak
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

## 3. Wykorzystywane typy

### DTOs i Command Modele

#### Dogs Management

```typescript
// Query Parameters
DogQueryParams {
  breed_id?: string;
  gender?: DogGender;
  owner_id?: string;
  microchip_number?: string;
  kennel_club_number?: string;
  page?: number;
  limit?: number;
}

// Request DTOs
CreateDogDto {
  name: string;
  breed_id: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_club_number?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owners: { id: string; is_primary: boolean; }[];
}

UpdateDogDto {
  name?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

// Response DTOs
DogResponseDto extends Omit<Dog, "breed_id"> {
  breed: Pick<Breed, "id" | "name_pl" | "name_en" | "fci_group">;
  owners: (Pick<Owner, "id" | "first_name" | "last_name" | "email"> & { is_primary: boolean; })[];
}

DogDetailResponseDto extends DogResponseDto {
  breed: Breed;
  owners: (Pick<Owner, "id" | "first_name" | "last_name" | "email" | "phone"> & { is_primary: boolean; })[];
}

PaginatedResponseDto<DogResponseDto>;
```

#### Owners Management

```typescript
// Query Parameters
OwnerQueryParams {
  email?: string;
  city?: string;
  country?: string;
  gdpr_consent?: boolean;
  page?: number;
  limit?: number;
}

// Request DTOs
CreateOwnerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  kennel_name?: string;
  language: Language;
  gdpr_consent: boolean;
}

UpdateOwnerDto {
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

// Response DTOs
OwnerResponseDto extends Owner;
PaginatedResponseDto<OwnerResponseDto>;
```

#### Wspólne typy

```typescript
// Error Handling
ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: ErrorDetailDto[];
  };
  timestamp: string;
  request_id: string;
}

ErrorDetailDto {
  field: string;
  message: string;
}

// Pagination
PaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
```

## 4. Szczegóły odpowiedzi

### Kody statusu HTTP

- **200 OK:** Pomyślne operacje odczytu i aktualizacji
- **201 Created:** Pomyślne utworzenie nowego zasobu
- **400 Bad Request:** Błędy walidacji danych wejściowych
- **401 Unauthorized:** Brak lub nieprawidłowy token uwierzytelniający
- **403 Forbidden:** Brak uprawnień do wykonania operacji
- **404 Not Found:** Zasób nie został znaleziony
- **409 Conflict:** Konflikt (duplikat email, numeru mikrochipu)
- **500 Internal Server Error:** Błędy serwera

### Struktura odpowiedzi błędów

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 5. Przepływ danych

### Dogs Management Flow

1. **POST /dogs:**

   - Walidacja danych wejściowych
   - Sprawdzenie unikalności numeru mikrochipu
   - Sprawdzenie istnienia rasy
   - Sprawdzenie istnienia właścicieli
   - Transakcja: utworzenie psa + relacje z właścicielami
   - Zwrócenie utworzonego `DogResponseDto`

2. **GET /dogs:**

   - Walidacja parametrów zapytania
   - Zastosowanie filtrów RLS
   - JOIN z `dictionary.breeds` i `dog_shows.owners`
   - Paginacja wyników
   - Zwrócenie `PaginatedResponseDto<DogResponseDto>`

3. **GET /dogs/{id}:**

   - Sprawdzenie istnienia psa
   - Pobranie szczegółowych danych z relacjami
   - Zwrócenie `DogDetailResponseDto`

4. **PUT /dogs/{id}:**

   - Sprawdzenie istnienia psa
   - Walidacja danych wejściowych
   - Aktualizacja w `dog_shows.dogs`
   - Zwrócenie zaktualizowanego `DogResponseDto`

5. **DELETE /dogs/{id}:**
   - Sprawdzenie istnienia psa
   - Soft delete (ustawienie `deleted_at` i `scheduled_for_deletion`)
   - Zwrócenie komunikatu o sukcesie

### Owners Management Flow

1. **POST /owners:**

   - Walidacja danych wejściowych (email format, wymagane pola)
   - Sprawdzenie unikalności email
   - Jeśli `gdpr_consent: true`, ustawienie `gdpr_consent_date`
   - Utworzenie w `dog_shows.owners`
   - Zwrócenie utworzonego `OwnerResponseDto`

2. **GET /owners:**

   - Walidacja parametrów zapytania
   - Zastosowanie filtrów RLS
   - Paginacja wyników
   - Zwrócenie `PaginatedResponseDto<OwnerResponseDto>`

3. **GET /owners/{id}:**

   - Sprawdzenie istnienia właściciela
   - Pobranie szczegółowych danych
   - Zwrócenie `OwnerResponseDto`

4. **PUT /owners/{id}:**

   - Sprawdzenie istnienia właściciela
   - Walidacja danych wejściowych
   - Aktualizacja w `dog_shows.owners`
   - Zwrócenie zaktualizowanego `OwnerResponseDto`

5. **DELETE /owners/{id}:**
   - Sprawdzenie istnienia właściciela
   - Sprawdzenie czy właściciel ma przypisane psy
   - Soft delete (ustawienie `deleted_at` i `scheduled_for_deletion`)
   - Zwrócenie komunikatu o sukcesie

## 6. Względy bezpieczeństwa

### Autoryzacja i uwierzytelnianie

- **JWT Token Validation:** Sprawdzanie tokenu w headerze `Authorization: Bearer <token>`
- **Role-based Access Control:** Wszyscy uwierzytelnieni użytkownicy mogą zarządzać psami i właścicielami
- **Row Level Security (RLS):** Polityki na poziomie bazy danych

### Walidacja danych wejściowych

- **Zod Schemas:** Walidacja wszystkich DTOs
- **Email Validation:** RFC 5322 compliant
- **Microchip Validation:** Dokładnie 15 cyfr
- **Date Validation:** Realistyczne daty urodzenia psów (nie więcej niż 20 lat wstecz)
- **SQL Injection Prevention:** Parametryzowane zapytania

### Zgodność RODO

- **GDPR Consent Tracking:** Automatyczne śledzenie zgód z timestampami
- **Soft Delete:** Dane nie są fizycznie usuwane
- **Data Retention:** Automatyczne planowanie usuwania po 3 latach
- **Audit Logging:** Logowanie wszystkich operacji CRUD

### Rate Limiting

- **Authenticated requests:** 1000 requests/hour per user
- **Unauthenticated requests:** 100 requests/hour per IP

## 7. Obsługa błędów

### Typy błędów i kody

- **VALIDATION_ERROR (400):** Błędy walidacji danych wejściowych
- **AUTHENTICATION_ERROR (401):** Nieprawidłowy lub wygasły token
- **AUTHORIZATION_ERROR (403):** Brak uprawnień do operacji
- **NOT_FOUND (404):** Zasób nie istnieje
- **CONFLICT (409):** Duplikat email, numeru mikrochipu
- **BUSINESS_RULE_ERROR (400):** Naruszenie reguł biznesowych
- **INTERNAL_ERROR (500):** Błędy serwera

### Strategie obsługi błędów

1. **Centralized Error Handler:** Wspólny handler dla wszystkich endpointów
2. **Structured Error Responses:** Spójny format odpowiedzi błędów
3. **Request ID Tracking:** Unikalny ID dla każdego żądania
4. **Error Logging:** Logowanie błędów z kontekstem
5. **Graceful Degradation:** Łagodne obsługiwanie błędów bazodanowych

### Przykłady błędów

```json
// Walidacja mikrochipu
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid microchip number",
    "details": [{"field": "microchip_number", "message": "Must be exactly 15 digits"}]
  }
}

// Konflikt mikrochipu
{
  "error": {
    "code": "CONFLICT",
    "message": "Microchip number already exists",
    "details": [{"field": "microchip_number", "message": "This microchip is already registered"}]
  }
}

// Nieprawidłowa data urodzenia
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid birth date",
    "details": [{"field": "birth_date", "message": "Birth date must be in the past and not more than 20 years ago"}]
  }
}

// Brak rasy
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Breed not found",
    "details": [{"field": "breed_id", "message": "Specified breed does not exist"}]
  }
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacja zapytań

- **Indexing:** Indeksy na często używanych kolumnach (email, microchip_number, breed_id, owner_id)
- **JOIN Optimization:** Efektywne JOINy z tabelami breeds i owners
- **Pagination:** Implementacja cursor-based pagination dla dużych zbiorów danych
- **Query Caching:** Cache dla słowników (breeds)

### Strategie buforowania

- **Redis Cache:** Cache dla często używanych danych
- **Database Connection Pooling:** Optymalizacja połączeń z bazą
- **Response Caching:** Cache odpowiedzi dla operacji odczytu

### Monitoring wydajności

- **Query Performance:** Monitorowanie czasu wykonywania zapytań
- **Response Time Tracking:** Śledzenie czasu odpowiedzi endpointów
- **Resource Usage:** Monitorowanie wykorzystania CPU i pamięci
- **Error Rate Monitoring:** Śledzenie wskaźników błędów

## 9. Etapy wdrożenia

### Faza 1: Podstawowa infrastruktura

1. **Setup Validation Schemas**

   - Utworzenie Zod schemas dla CreateDogDto, UpdateDogDto, CreateOwnerDto, UpdateOwnerDto
   - Implementacja walidacji email, mikrochipów, dat urodzenia
   - Testy jednostkowe dla schemas

2. **Error Handling Infrastructure**

   - Implementacja centralnego error handler
   - Utworzenie typów ErrorResponseDto
   - Setup logging system

3. **Database Connection Setup**
   - Konfiguracja Supabase client
   - Implementacja middleware dla context.locals
   - Setup TypeScript types

### Faza 2: Service Layer Implementation

1. **DogService**

   - Implementacja CRUD operacji dla psów
   - Breed validation i relationships
   - Microchip uniqueness validation
   - Owner relationship management

2. **OwnerService**
   - Implementacja CRUD operacji dla właścicieli
   - GDPR consent tracking
   - Email validation i uniqueness

### Faza 3: API Endpoints Implementation

1. **Dogs Endpoints**

   - GET /dogs (z paginacją i filtrami)
   - GET /dogs/{id}
   - POST /dogs
   - PUT /dogs/{id}
   - DELETE /dogs/{id}

2. **Owners Endpoints**
   - GET /owners (z paginacją i filtrami)
   - GET /owners/{id}
   - POST /owners
   - PUT /owners/{id}
   - DELETE /owners/{id}

### Faza 4: Security & Testing

1. **Authentication & Authorization**

   - JWT token validation
   - Row Level Security policies

2. **Input Validation & Sanitization**

   - Comprehensive input validation
   - SQL injection prevention
   - XSS protection

3. **Testing**
   - Unit tests dla services
   - Integration tests dla endpoints
   - Security tests
   - Performance tests

### Faza 5: Performance & Monitoring

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

### Faza 6: Deployment & Maintenance

1. **Production Deployment**

   - Environment configuration
   - Database migrations
   - Monitoring setup

2. **Maintenance & Updates**
   - Regular security updates
   - Performance monitoring
   - Bug fixes and improvements
