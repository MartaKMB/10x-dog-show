# API Endpoint Implementation Plan: GET /branches

## 1. Przegląd punktu końcowego

Endpoint `GET /branches` służy do pobierania listy oddziałów organizujących wystawy psów. Endpoint obsługuje filtrowanie po regionie i statusie aktywności, a także paginację wyników. Jest to endpoint tylko do odczytu, dostępny dla wszystkich uwierzytelnionych użytkowników.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/branches`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Parametry:**
  - **Wymagane:** Brak
  - **Opcjonalne:**
    - `region` (string): Filtr po regionie
    - `is_active` (boolean): Filtr po statusie aktywności
    - `page` (number): Numer strony (domyślnie: 1)
    - `limit` (number): Liczba elementów na stronę (domyślnie: 20, max: 100)
- **Request Body:** Brak

## 3. Wykorzystywane typy

### 3.1 DTOs

```typescript
// Referencje do istniejących typów
import type {
  BaseEntity,
  PaginationDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from "@types";

// Nowe typy dla endpointu branches
interface Branch extends BaseEntity {
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  region: string;
  is_active: boolean;
}

interface BranchResponseDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchesListResponseDto {
  branches: BranchResponseDto[];
  pagination: PaginationDto;
}

interface BranchQueryParams {
  region?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
```

### 3.2 Zod Schemas

```typescript
import { z } from "zod";

const branchQuerySchema = z.object({
  region: z.string().optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const branchResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().nullable(),
  city: z.string().max(100).nullable(),
  postal_code: z.string().max(20).nullable(),
  region: z.string().min(1).max(100),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const branchesListResponseSchema = z.object({
  branches: z.array(branchResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});
```

## 4. Szczegóły odpowiedzi

### 4.1 Sukces (200 OK)

```json
{
  "branches": [
    {
      "id": "uuid",
      "name": "Oddział Warszawa",
      "address": "ul. Marszałkowska 1",
      "city": "Warszawa",
      "postal_code": "00-001",
      "region": "Mazowieckie",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "name": "Oddział Kraków",
      "address": null,
      "city": null,
      "postal_code": null,
      "region": "Małopolskie",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### 4.2 Kody błędów

- **401 Unauthorized:** Brak tokenu uwierzytelniającego
- **400 Bad Request:** Nieprawidłowe parametry zapytania
- **500 Internal Server Error:** Błąd serwera

## 5. Przepływ danych

### 5.1 Główny przepływ

1. **Walidacja tokenu** - Sprawdzenie JWT tokenu w headerze Authorization
2. **Walidacja parametrów** - Walidacja query parameters za pomocą Zod
3. **Budowanie zapytania** - Konstrukcja zapytania SQL z filtrami
4. **Wykonanie zapytania** - Pobranie danych z tabeli `dictionary.branches`
5. **Paginacja** - Obliczenie paginacji i filtrowanie wyników
6. **Mapowanie danych** - Konwersja wyników do DTO
7. **Odpowiedź** - Zwrócenie sformatowanej odpowiedzi

### 5.2 Szczegóły implementacji

```typescript
// Struktura zapytania SQL
const query = supabase
  .from("dictionary.branches")
  .select("*", { count: "exact" });

// Dodanie filtrów
if (params.region) {
  query.ilike("region", `%${params.region}%`);
}

if (params.is_active !== undefined) {
  query.eq("is_active", params.is_active);
}

// Paginacja
const offset = (params.page - 1) * params.limit;
query.range(offset, offset + params.limit - 1);

// Sortowanie
query.order("name", { ascending: true });
```

## 6. Względy bezpieczeństwa

### 6.1 Autoryzacja i uwierzytelnianie

- **JWT Token Validation:** Sprawdzanie tokenu w headerze Authorization
- **Role-based Access Control:** Wszyscy uwierzytelnieni użytkownicy mają dostęp do odczytu
- **Row Level Security (RLS):** Polityki na poziomie bazy danych dla tabeli branches

### 6.2 Walidacja danych wejściowych

- **Zod Schemas:** Walidacja wszystkich query parameters
- **SQL Injection Prevention:** Parametryzowane zapytania przez Supabase
- **Input Sanitization:** Sanityzacja parametrów wyszukiwania

### 6.3 Rate Limiting

- **Authenticated requests:** 1000 requests/hour per user
- **Dictionary endpoints:** 2000 requests/hour per user (wyższy limit dla słowników)

## 7. Obsługa błędów

### 7.1 Typy błędów i kody

- **VALIDATION_ERROR (400):** Błędy walidacji parametrów zapytania
- **AUTHENTICATION_ERROR (401):** Nieprawidłowy lub wygasły token
- **INTERNAL_ERROR (500):** Błędy serwera i bazy danych

### 7.2 Przykłady błędów

```json
// Nieprawidłowe parametry
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": [
      {
        "field": "limit",
        "message": "Limit must be between 1 and 100"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}

// Brak autoryzacji
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired authentication token"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 8. Rozważania dotyczące wydajności

### 8.1 Optymalizacja zapytań

- **Indexing:** Indeksy na kolumnach `region`, `is_active`, `name`
- **Query Optimization:** Użycie `count: 'exact'` dla efektywnej paginacji
- **Connection Pooling:** Wykorzystanie Supabase connection pooling

### 8.2 Caching

- **Response Caching:** Cache dla statycznych danych słownikowych (TTL: 1 godzina)
- **Query Result Caching:** Cache wyników zapytań z filtrami (TTL: 30 minut)

### 8.3 Paginacja

- **Efficient Pagination:** Użycie `range()` zamiast `offset/limit`
- **Count Optimization:** Osobne zapytanie dla liczenia total z `count: 'exact'`

## 9. Etapy wdrożenia

### 9.1 Przygotowanie typów i schematów

1. **Dodanie typów DTO** do `src/types.ts`
2. **Utworzenie Zod schematów** w `src/lib/validation/branchSchemas.ts`
3. **Aktualizacja database types** (jeśli potrzebne)

### 9.2 Implementacja serwisu

1. **Utworzenie BranchService** w `src/lib/services/branchService.ts`
2. **Implementacja metody list()** z filtrowaniem i paginacją
3. **Dodanie walidacji biznesowej** i obsługi błędów

### 9.3 Implementacja endpointu

1. **Utworzenie pliku API** w `src/pages/api/branches.ts`
2. **Implementacja GET handler** z walidacją i autoryzacją
3. **Integracja z BranchService** i obsługa odpowiedzi

### 9.4 Testy i walidacja

1. **Unit tests** dla BranchService
2. **Integration tests** dla endpointu
3. **Manual testing** z różnymi parametrami
4. **Performance testing** z dużymi zbiorami danych

### 9.5 Dokumentacja i deployment

1. **Aktualizacja API dokumentacji**
2. **Dodanie przykładów użycia**
3. **Deployment** i monitoring
4. **Code review** i finalizacja

### 9.6 Monitoring i optymalizacja

1. **Dodanie logowania** dla endpointu
2. **Monitoring wydajności** i błędów
3. **Optymalizacja zapytań** na podstawie metryk
4. **Aktualizacja cache strategy** jeśli potrzebne
