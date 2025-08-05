# API Endpoint Implementation Plan: GET /breeds

## 1. Przegląd punktu końcowego

Endpoint `GET /breeds` służy do pobierania listy ras psów z systemu 10x Dog Show. Endpoint obsługuje filtrowanie po grupach FCI, statusie aktywności, wyszukiwanie w nazwach ras oraz paginację wyników. Dane są używane jako referencyjne w formularzach rejestracji psów, filtrowaniu i raportowaniu.

**Główne funkcjonalności:**
- Lista wszystkich aktywnych ras psów
- Filtrowanie po grupach FCI (G1-G10)
- Filtrowanie po statusie aktywności
- Wyszukiwanie w nazwach ras (polski/angielski)
- Paginacja wyników
- Dane referencyjne dla innych modułów systemu

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/breeds`
- **Parametry query:**
  - `fci_group` (optional): Filtr po grupie FCI (G1-G10)
  - `is_active` (optional): Filtr po statusie aktywności (boolean)
  - `search` (optional): Wyszukiwanie w nazwach ras (string)
  - `page` (optional): Numer strony (default: 1, min: 1)
  - `limit` (optional): Elementów na stronę (default: 50, max: 200, min: 1)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Request Body:** Brak

## 3. Wykorzystywane typy

### DTOs i Command Modele:
- `BreedResponseDto` (@types) - Struktura odpowiedzi dla pojedynczej rasy
- `PaginatedResponseDto<BreedResponseDto>` (@types) - Struktura paginowanej odpowiedzi
- `BreedQueryParams` (@types) - Parametry zapytania
- `Breed` (@types) - Podstawowy typ encji rasy

### Walidacja:
- `BreedQuerySchema` (Zod) - Walidacja parametrów zapytania
- `FCIGroup` (@types) - Enum grup FCI (G1-G10)

## 4. Szczegóły odpowiedzi

### Sukces (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "name_pl": "Labrador retriever",
      "name_en": "Labrador Retriever",
      "fci_group": "G8",
      "fci_number": 122,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 340,
    "pages": 7
  }
}
```

### Błędy:
- **400 Bad Request:** Nieprawidłowe parametry zapytania
- **401 Unauthorized:** Brak autoryzacji
- **500 Internal Server Error:** Błąd serwera

## 5. Przepływ danych

### 5.1 Sekwencja operacji:
1. **Walidacja żądania** - Sprawdzenie parametrów query i autoryzacji
2. **Przygotowanie zapytania** - Budowanie zapytania SQL z filtrami
3. **Wykonanie zapytania** - Pobranie danych z bazy przez Supabase
4. **Przetworzenie wyników** - Mapowanie na DTOs i paginacja
5. **Zwrócenie odpowiedzi** - Formatowanie odpowiedzi JSON

### 5.2 Interakcje z bazą danych:
- **Tabela:** `dictionary.breeds`
- **Kolumny:** id, name_pl, name_en, fci_group, fci_number, is_active, created_at, updated_at
- **Indeksy:** fci_group, is_active, name_pl, name_en (dla wyszukiwania)
- **Filtry:** WHERE is_active = true (domyślnie), fci_group = ?, search LIKE %

### 5.3 Serwisy:
- **BreedService** - Logika biznesowa i operacje na bazie danych
- **ValidationService** - Walidacja parametrów zapytania
- **PaginationService** - Obsługa paginacji

## 6. Względy bezpieczeństwa

### 6.1 Autoryzacja:
- Wymagane uwierzytelnienie użytkownika
- Dostęp dla wszystkich ról (department_representative, secretary)
- Brak wrażliwych danych w odpowiedzi

### 6.2 Walidacja danych wejściowych:
- Sanityzacja parametru `search` (prevention of SQL injection)
- Walidacja `fci_group` (enum G1-G10)
- Walidacja `page` i `limit` (rozsądne limity)
- Walidacja `is_active` (boolean)

### 6.3 Row Level Security (RLS):
- Brak RLS dla tabeli breeds (dane publiczne dla uwierzytelnionych użytkowników)
- Filtrowanie tylko aktywnych ras (is_active = true)

### 6.4 Rate Limiting:
- Standardowe limity dla uwierzytelnionych użytkowników (1000 req/hour)
- Brak specjalnych ograniczeń dla tego endpointu

## 7. Obsługa błędów

### 7.1 Scenariusze błędów:

#### 400 Bad Request:
- Nieprawidłowy format `fci_group` (nie z enum G1-G10)
- Nieprawidłowy format `is_active` (nie boolean)
- `page` < 1 lub `limit` < 1 lub `limit` > 200
- Nieprawidłowy format parametrów

#### 401 Unauthorized:
- Brak tokenu autoryzacji
- Nieprawidłowy token
- Token wygasł

#### 500 Internal Server Error:
- Błąd połączenia z bazą danych
- Błąd zapytania SQL
- Nieoczekiwany błąd serwera

### 7.2 Format odpowiedzi błędów:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": [
      {
        "field": "fci_group",
        "message": "Invalid FCI group value"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

### 7.3 Logowanie błędów:
- Logowanie wszystkich błędów 4xx i 5xx
- Zawartość: timestamp, request_id, user_id, error_details
- Brak logowania parametrów wyszukiwania (privacy)

## 8. Rozważania dotyczące wydajności

### 8.1 Optymalizacja bazy danych:
- **Indeksy:** fci_group, is_active, name_pl, name_en
- **Indeks złożony:** (is_active, fci_group) dla częstych filtrów
- **Indeks tekstowy:** GIN dla wyszukiwania w nazwach

### 8.2 Caching:
- **Cache:** Redis dla często używanych filtrów (15 minut)
- **Klucze cache:** `breeds:fci_group:{group}`, `breeds:active`
- **Invalidacja:** Przy aktualizacji ras

### 8.3 Paginacja:
- **Domyślny limit:** 50 elementów
- **Maksymalny limit:** 200 elementów
- **Offset-based pagination** (nie cursor-based)

### 8.4 Wyszukiwanie:
- **LIKE operator** z indeksami
- **Case-insensitive search** w obu językach
- **Prefix matching** dla lepszej wydajności

### 8.5 Monitoring:
- **Metryki:** Response time, throughput, error rate
- **Alerty:** Response time > 500ms, error rate > 5%
- **Logs:** Structured logging z request_id

## 9. Etapy wdrożenia

### Etap 1: Przygotowanie infrastruktury
1. **Utworzenie BreedService** (`src/lib/services/breedService.ts`)
   - Implementacja metody `getMany()` z filtrowaniem i paginacją
   - Integracja z Supabase client
   - Obsługa błędów i walidacji

2. **Utworzenie schematów walidacji** (`src/lib/validation/breedSchemas.ts`)
   - `BreedQuerySchema` z walidacją parametrów
   - Walidacja enum FCI groups
   - Walidacja limitów paginacji

3. **Utworzenie typów** (jeśli brakuje w `src/types.ts`)
   - `BreedQueryParams` interface
   - Aktualizacja `BreedResponseDto` jeśli potrzebne

### Etap 2: Implementacja endpointu
4. **Implementacja API route** (`src/pages/api/breeds.ts`)
   - Obsługa metody GET
   - Parsowanie parametrów query
   - Walidacja z użyciem Zod
   - Integracja z BreedService

5. **Obsługa autoryzacji**
   - Sprawdzenie tokenu z context.locals
   - Zwracanie 401 dla nieautoryzowanych żądań
   - Logowanie prób nieautoryzowanego dostępu

### Etap 3: Obsługa błędów i walidacja
6. **Implementacja obsługi błędów**
   - Try-catch bloki w service i endpoint
   - Formatowanie odpowiedzi błędów
   - Logowanie błędów z kontekstem

7. **Testowanie walidacji**
   - Testy jednostkowe dla schematów walidacji
   - Testy integracyjne dla endpointu
   - Testy przypadków brzegowych

### Etap 4: Optymalizacja i monitoring
8. **Implementacja cache** (opcjonalnie)
   - Redis cache dla częstych filtrów
   - Strategia invalidacji cache
   - Monitoring hit/miss ratio

9. **Dodanie metryk i logowania**
   - Structured logging z request_id
   - Metryki wydajności
   - Alerty dla błędów

### Etap 5: Testy i dokumentacja
10. **Testy end-to-end**
    - Testy wszystkich scenariuszy użycia
    - Testy wydajności z różnymi filtrami
    - Testy bezpieczeństwa

11. **Dokumentacja API**
    - Aktualizacja OpenAPI specyfikacji
    - Przykłady użycia
    - Dokumentacja błędów

### Etap 6: Deployment i monitoring
12. **Deployment**
    - Code review i merge
    - Deployment do środowiska testowego
    - Testy w środowisku testowym

13. **Monitoring produkcji**
    - Monitoring metryk wydajności
    - Alerty dla błędów
    - Analiza logów

## 10. Pliki do utworzenia/modyfikacji

### Nowe pliki:
- `src/lib/services/breedService.ts` - Serwis dla operacji na rasach
- `src/lib/validation/breedSchemas.ts` - Schematy walidacji

### Modyfikowane pliki:
- `src/pages/api/breeds.ts` - Implementacja endpointu API
- `src/types.ts` - Dodanie brakujących typów (jeśli potrzebne)

### Pliki konfiguracyjne:
- `supabase/migrations/` - Indeksy dla optymalizacji (jeśli potrzebne)
- `.env` - Zmienne środowiskowe dla cache (jeśli implementowane)

## 11. Kryteria akceptacji

- [ ] Endpoint zwraca listę ras z paginacją
- [ ] Filtrowanie po fci_group działa poprawnie
- [ ] Filtrowanie po is_active działa poprawnie
- [ ] Wyszukiwanie w nazwach ras działa poprawnie
- [ ] Paginacja działa z domyślnymi i niestandardowymi limitami
- [ ] Walidacja parametrów zwraca odpowiednie błędy 400
- [ ] Autoryzacja wymagana (401 dla nieautoryzowanych)
- [ ] Obsługa błędów bazy danych (500)
- [ ] Response time < 200ms dla standardowych zapytań
- [ ] Testy jednostkowe pokrywają > 90% kodu
- [ ] Dokumentacja API jest aktualna 
