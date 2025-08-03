# API Endpoint Implementation Plan: POST /shows

## 1. Przegląd punktu końcowego

Endpoint `POST /shows` służy do tworzenia nowych wystaw psów w systemie 10x Dog Show. Tylko użytkownicy z rolą `department_representative` mogą tworzyć wystawy. Nowo utworzona wystawa automatycznie otrzymuje status `draft` i jest przypisana do organizatora (bieżącego użytkownika).

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/shows`
- **Parametry wymagane**:
  - `name`: Nazwa wystawy (string, max 200 znaków)
  - `show_type`: Typ wystawy (`national` | `international`)
  - `show_date`: Data wystawy (ISO 8601 date)
  - `registration_deadline`: Termin rejestracji (ISO 8601 date)
  - `venue_id`: ID obiektu (UUID)
  - `language`: Język (`pl` | `en`)
- **Parametry opcjonalne**:
  - `max_participants`: Maksymalna liczba uczestników (integer)
  - `entry_fee`: Opłata wpisowa (decimal, 2 miejsca po przecinku)
  - `description`: Opis wystawy (text)
- **Request Body**: JSON zgodny ze schematem `CreateShowDto`

## 3. Wykorzystywane typy

### DTOs i Command Modele:
- `CreateShowDto` - walidacja danych wejściowych
- `Show` - reprezentacja encji w bazie danych
- `ShowResponseDto` - format odpowiedzi API
- `ErrorResponseDto` - obsługa błędów

### Typy pomocnicze:
- `ShowType` - enum typów wystaw
- `ShowStatus` - enum statusów wystaw
- `Language` - enum języków

## 4. Szczegóły odpowiedzi

### Sukces (201 Created):
```json
{
  "id": "uuid",
  "name": "National Dog Show Warsaw 2024",
  "show_type": "national",
  "status": "draft",
  "show_date": "2024-03-15",
  "registration_deadline": "2024-03-01",
  "venue_id": "uuid",
  "organizer_id": "uuid",
  "max_participants": 200,
  "entry_fee": 50.00,
  "description": "Annual national dog show featuring all FCI groups",
  "language": "pl",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Kody błędów:
- `400 Bad Request`: Nieprawidłowe dane wejściowe
- `401 Unauthorized`: Brak autoryzacji
- `403 Forbidden`: Brak uprawnień (nie department_representative)
- `404 Not Found`: Obiekt nie istnieje
- `500 Internal Server Error`: Błąd serwera

## 5. Przepływ danych

1. **Walidacja autoryzacji**: Sprawdzenie JWT token i roli użytkownika
2. **Parsowanie żądania**: Deserializacja JSON do obiektu
3. **Walidacja danych**: Walidacja z użyciem Zod schema
4. **Walidacja biznesowa**: Sprawdzenie logiki biznesowej
5. **Wstawienie do bazy**: Utworzenie rekordu w tabeli `dog_shows.shows`
6. **Audyt**: Zapisanie akcji w tabeli audytu
7. **Odpowiedź**: Zwrócenie utworzonego obiektu

### Interakcje z zewnętrznymi usługami:
- **Supabase Auth**: Weryfikacja tokenu i roli użytkownika
- **Supabase Database**: Wstawienie rekordu z RLS
- **Audit Service**: Logowanie akcji tworzenia

## 6. Względy bezpieczeństwa

### Autoryzacja:
- Wymagany JWT token w headerze `Authorization: Bearer <token>`
- Tylko użytkownicy z rolą `department_representative` mogą tworzyć wystawy
- Row Level Security (RLS) zapewnia izolację danych

### Walidacja danych:
- Walidacja formatu dat (ISO 8601)
- Sprawdzenie relacji dat: `registration_deadline <= show_date`
- Walidacja UUID dla `venue_id`
- Sanityzacja stringów (trim, escape)
- Walidacja długości pól

### Bezpieczeństwo bazy danych:
- Parametryzowane zapytania SQL
- RLS policies dla tabeli `shows`
- Automatyczne ustawienie `organizer_id` na bieżącego użytkownika

## 7. Obsługa błędów

### Scenariusze błędów walidacji:
- **Nieprawidłowy format daty**: 400 Bad Request
- **Data rejestracji po dacie wystawy**: 400 Bad Request
- **Nieprawidłowy UUID obiektu**: 400 Bad Request
- **Brak wymaganych pól**: 400 Bad Request
- **Nieprawidłowy typ wystawy**: 400 Bad Request

### Scenariusze błędów autoryzacji:
- **Brak tokenu**: 401 Unauthorized
- **Nieprawidłowy token**: 401 Unauthorized
- **Token wygasł**: 401 Unauthorized
- **Brak roli department_representative**: 403 Forbidden

### Scenariusze błędów biznesowych:
- **Obiekt nie istnieje**: 404 Not Found
- **Błąd bazy danych**: 500 Internal Server Error
- **Błąd audytu**: 500 Internal Server Error

### Format odpowiedzi błędów:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "registration_deadline",
        "message": "Registration deadline must be before show date"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacje:
- Indeksy na kolumnach: `organizer_id`, `show_date`, `status`
- Walidacja po stronie klienta przed wysłaniem
- Caching obiektów (venues) w pamięci
- Asynchroniczne logowanie audytu

### Potencjalne wąskie gardła:
- Sprawdzanie uprawnień użytkownika
- Walidacja relacji z tabelą venues
- Zapisywanie do tabeli audytu

### Monitoring:
- Czas odpowiedzi endpointu
- Liczba błędów walidacji
- Liczba utworzonych wystaw
- Wykorzystanie pamięci

## 9. Etapy wdrożenia

### Krok 1: Utworzenie schematów walidacji
1. Utworzenie pliku `src/lib/validation/showSchemas.ts`
2. Definicja schematu `createShowSchema` z użyciem Zod
3. Walidacja wszystkich pól zgodnie ze specyfikacją
4. Dodanie custom validators dla logiki biznesowej

### Krok 2: Implementacja serwisu
1. Utworzenie pliku `src/lib/services/showService.ts`
2. Implementacja klasy `ShowService` z metodą `create`
3. Logika biznesowa i walidacja
4. Integracja z Supabase Client
5. Obsługa błędów i rollback

### Krok 3: Implementacja endpointu API
1. Utworzenie pliku `src/pages/api/shows.ts`
2. Implementacja funkcji `POST` z użyciem Astro APIRoute
3. Integracja z serwisem i walidacją
4. Obsługa autoryzacji i uprawnień
5. Formatowanie odpowiedzi

### Krok 4: Implementacja audytu
1. Utworzenie serwisu audytu `src/lib/services/auditService.ts`
2. Logowanie akcji tworzenia wystawy
3. Zapisywanie metadanych użytkownika i kontekstu

### Krok 5: Testy i walidacja
1. Testy jednostkowe dla serwisu
2. Testy integracyjne dla endpointu
3. Testy walidacji i obsługi błędów
4. Testy wydajnościowe
5. Testy bezpieczeństwa

### Krok 6: Dokumentacja i deployment
1. Aktualizacja dokumentacji API
2. Dodanie przykładów użycia
3. Deployment na środowisko testowe
4. Monitoring i debugowanie
5. Deployment na produkcję

### Krok 7: Monitoring i optymalizacja
1. Konfiguracja alertów dla błędów
2. Monitoring wydajności
3. Analiza logów i metryk
4. Optymalizacja na podstawie danych
5. Aktualizacja dokumentacji

## 10. Pliki do utworzenia/modyfikacji

### Nowe pliki:
- `src/lib/validation/showSchemas.ts`
- `src/lib/services/showService.ts`
- `src/lib/services/auditService.ts`
- `src/pages/api/shows.ts`
- `src/lib/hooks/useShowValidation.ts`

### Modyfikowane pliki:
- `src/types.ts` (dodanie brakujących typów)
- `src/lib/services/errorHandler.ts` (rozszerzenie o nowe błędy)
- `src/lib/services/permissionService.ts` (dodanie uprawnień dla wystaw)

### Pliki konfiguracyjne:
- `supabase/migrations/` (nowa migracja dla indeksów)
- `package.json` (dodanie zależności testowych)

## 11. Kryteria akceptacji

### Funkcjonalne:
- ✅ Endpoint akceptuje prawidłowe dane i tworzy wystawę
- ✅ Automatyczne ustawienie statusu `draft` i `organizer_id`
- ✅ Walidacja wszystkich wymaganych i opcjonalnych pól
- ✅ Obsługa wszystkich scenariuszy błędów
- ✅ Logowanie audytu dla każdej akcji

### Niefunkcjonalne:
- ✅ Czas odpowiedzi < 500ms dla 95% żądań
- ✅ Obsługa 1000 żądań na godzinę na użytkownika
- ✅ 99.9% dostępność endpointu
- ✅ Pełne pokrycie testami (>90%)

### Bezpieczeństwo:
- ✅ Tylko department_representative może tworzyć wystawy
- ✅ Wszystkie dane wejściowe są walidowane i sanityzowane
- ✅ RLS policies chronią dane użytkowników
- ✅ Brak ekspozycji wrażliwych informacji w błędach 

# API Endpoint Implementation Plan: GET /shows

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania listy wystaw psów z możliwością filtrowania, sortowania i paginacji. Zwraca paginowaną listę wystaw wraz z podstawowymi informacjami o lokalizacji i organizatorze.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/shows`
- **Parametry query:**
  - **Opcjonalne:**
    - `status` (ShowStatus): Filtr po statusie wystawy
    - `show_type` (ShowType): Filtr po typie wystawy (national/international)
    - `from_date` (string): Filtr wystaw od daty (ISO 8601)
    - `to_date` (string): Filtr wystaw do daty (ISO 8601)
    - `organizer_id` (string): Filtr po organizatorze
    - `page` (number): Numer strony (default: 1)
    - `limit` (number): Liczba elementów na stronę (default: 20, max: 100)

## 3. Wykorzystywane typy
- `ShowQueryParams` - parametry zapytania
- `ShowResponseDto` - pojedynczy obiekt wystawy w odpowiedzi
- `PaginatedResponseDto<ShowResponseDto>` - paginowana odpowiedź
- `Show` - główny typ encji z bazy danych
- `Venue` - typ lokalizacji
- `User` - typ użytkownika (organizator)

## 4. Szczegóły odpowiedzi
- **Kod statusu:** 200 OK
- **Struktura odpowiedzi:**
```typescript
{
  data: ShowResponseDto[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## 5. Przepływ danych
1. **Walidacja parametrów** - sprawdzenie formatu dat, limitów paginacji
2. **Autoryzacja** - weryfikacja tokenu JWT i uprawnień użytkownika
3. **Budowanie zapytania** - konstrukcja SQL z filtrami i paginacją
4. **Wykonanie zapytania** - pobranie danych z Supabase z RLS
5. **Transformacja danych** - mapowanie na DTO
6. **Paginacja** - obliczenie metadanych paginacji
7. **Zwrócenie odpowiedzi** - sformatowana odpowiedź JSON

## 6. Względy bezpieczeństwa
- **Autentykacja:** Wymagany token JWT w headerze Authorization
- **Autoryzacja:** RLS policies w Supabase zapewniają dostęp tylko do odpowiednich danych
- **Walidacja danych:** 
  - Walidacja formatu dat (ISO 8601)
  - Sprawdzenie limitów paginacji (max 100)
  - Sanityzacja parametrów query
- **SQL Injection:** Używanie Supabase Client z parametrami
- **Rate Limiting:** Implementacja rate limitingu na poziomie API

## 7. Obsługa błędów
- **400 Bad Request:**
  - Nieprawidłowy format daty
  - Nieprawidłowe parametry paginacji
  - Nieprawidłowe wartości enum
- **401 Unauthorized:**
  - Brak tokenu JWT
  - Nieprawidłowy token
  - Token wygasł
- **403 Forbidden:**
  - Brak uprawnień do dostępu do danych
- **500 Internal Server Error:**
  - Błąd połączenia z bazą danych
  - Nieoczekiwany błąd aplikacji

## 8. Rozważania dotyczące wydajności
- **Indeksy bazy danych:** Wykorzystanie indeksów na polach filtrowania
- **Paginacja:** Implementacja cursor-based pagination dla dużych zbiorów
- **Caching:** Cache dla często pobieranych danych
- **Query optimization:** Minimalizacja liczby zapytań do bazy
- **Response compression:** Gzip compression dla odpowiedzi

## 9. Etapy wdrożenia

### Krok 1: Utworzenie serwisu
```typescript
// src/lib/services/showService.ts
export class ShowService {
  async getShows(params: ShowQueryParams): Promise<PaginatedResponseDto<ShowResponseDto>>
}
```

### Krok 2: Implementacja walidacji
```typescript
// src/lib/validation/showSchemas.ts
export const showQuerySchema = z.object({
  status: z.enum(['draft', 'open_for_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled']).optional(),
  show_type: z.enum(['national', 'international']).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  organizer_id: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})
```

### Krok 3: Implementacja endpointu
```typescript
// src/pages/api/shows.ts
export async function GET(request: Request) {
  try {
    // 1. Walidacja parametrów
    const queryParams = showQuerySchema.parse(searchParams)
    
    // 2. Autoryzacja
    const user = await authenticateUser(request)
    
    // 3. Pobranie danych
    const showService = new ShowService()
    const result = await showService.getShows(queryParams)
    
    // 4. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Krok 4: Implementacja logiki biznesowej
```typescript
// W ShowService
async getShows(params: ShowQueryParams): Promise<PaginatedResponseDto<ShowResponseDto>> {
  const { data: shows, count } = await this.supabase
    .from('shows')
    .select(`
      *,
      venue:venues(id, name, city),
      organizer:users!organizer_id(id, first_name, last_name)
    `)
    .match(this.buildFilters(params))
    .range(this.calculateRange(params))
    .order('show_date', { ascending: false })
  
  return this.buildPaginatedResponse(shows, count, params)
}
```

### Krok 5: Testy
- Unit tests dla ShowService
- Integration tests dla endpointu
- E2E tests dla pełnego flow

### Krok 6: Dokumentacja
- Aktualizacja API dokumentacji
- Przykłady użycia
- Opis kodów błędów

### Krok 7: Monitoring
- Logowanie błędów
- Metryki wydajności
- Alerty dla błędów 5xx 
