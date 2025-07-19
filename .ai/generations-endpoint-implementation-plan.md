# API Endpoint Implementation Plan: POST /descriptions

## 1. Przegląd punktu końcowego

Endpoint `POST /descriptions` umożliwia sekretarzom ringów tworzenie nowych opisów psów podczas wystaw. Jest to kluczowa funkcjonalność systemu, która digitalizuje proces ręcznego notowania ocen psów. Endpoint automatycznie przypisuje aktualnie zalogowanego użytkownika jako sekretarza opisu oraz tworzy pierwszą wersję w systemie wersjonowania.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/descriptions`
- **Content-Type**: `application/json`
- **Autoryzacja**: Bearer token (rola: secretary)

### Parametry żądania:

**Wymagane:**
- `show_id` (string, UUID) - Identyfikator wystawy
- `dog_id` (string, UUID) - Identyfikator psa  
- `judge_id` (string, UUID) - Identyfikator sędziego

**Opcjonalne:**
- `content_pl` (string) - Treść opisu w języku polskim
- `content_en` (string) - Treść opisu w języku angielskim

### Request Body Example:
```json
{
  "show_id": "123e4567-e89b-12d3-a456-426614174000",
  "dog_id": "123e4567-e89b-12d3-a456-426614174001", 
  "judge_id": "123e4567-e89b-12d3-a456-426614174002",
  "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch...",
  "content_en": "Very good representative of the breed. Excellent structure, correct movement..."
}
```

## 3. Wykorzystywane typy

### DTOs potrzebne do implementacji:
- `CreateDescriptionDto` - walidacja danych wejściowych
- `DescriptionResponseDto` - struktura odpowiedzi
- `ErrorResponseDto` - obsługa błędów

### Command Models:
- `CreateDescriptionCommand` - komenda dla service layer
- `DescriptionCreatedEvent` - event dla audytu

### Database Models:
- `Description` - główna tabela opisów
- `DescriptionVersion` - tabela wersjonowania
- `SecretaryAssignment` - sprawdzenie uprawnień

## 4. Szczegóły odpowiedzi

### Pomyślna odpowiedź (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174003",
  "show_id": "123e4567-e89b-12d3-a456-426614174000",
  "dog_id": "123e4567-e89b-12d3-a456-426614174001",
  "judge_id": "123e4567-e89b-12d3-a456-426614174002", 
  "secretary_id": "123e4567-e89b-12d3-a456-426614174004",
  "content_pl": "Bardzo dobry przedstawiciel rasy...",
  "content_en": "Very good representative of the breed...",
  "version": 1,
  "is_final": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Możliwe kody błędów:
- **400 Bad Request**: Nieprawidłowe dane wejściowe
- **401 Unauthorized**: Brak autoryzacji
- **403 Forbidden**: Brak uprawnień do rasy/wystawy  
- **404 Not Found**: Show/Dog/Judge nie istnieje
- **409 Conflict**: Opis już istnieje
- **422 Unprocessable Entity**: Wystawa zakończona
- **500 Internal Server Error**: Błąd serwera

## 5. Przepływ danych

### 1. Walidacja żądania:
- Sprawdzenie formatu UUID dla wszystkich ID
- Walidacja że co najmniej jeden content (pl/en) jest podany
- Sprawdzenie autoryzacji i roli użytkownika

### 2. Walidacja biznesowa:
```sql
-- Sprawdzenie czy wystawa nie została zakończona
SELECT status FROM dog_shows.shows WHERE id = :show_id

-- Sprawdzenie czy sekretarz ma uprawnienia do rasy psa
SELECT sa.id FROM dog_shows.secretary_assignments sa 
JOIN dog_shows.dogs d ON d.breed_id = sa.breed_id
WHERE sa.secretary_id = :current_user_id 
  AND sa.show_id = :show_id 
  AND d.id = :dog_id

-- Sprawdzenie czy opis już nie istnieje
SELECT id FROM dog_shows.descriptions 
WHERE show_id = :show_id AND dog_id = :dog_id AND judge_id = :judge_id
```

### 3. Utworzenie opisu:
```sql
-- Insert do tabeli descriptions
INSERT INTO dog_shows.descriptions (
  show_id, dog_id, judge_id, secretary_id, 
  content_pl, content_en, version, is_final
) VALUES (:show_id, :dog_id, :judge_id, :secretary_id, 
         :content_pl, :content_en, 1, false)

-- Insert pierwszej wersji do description_versions  
INSERT INTO dog_shows.description_versions (
  description_id, version, content_pl, content_en, 
  changed_by, change_reason
) VALUES (:description_id, 1, :content_pl, :content_en,
         :secretary_id, 'Initial creation')
```

### 4. Audyt i logging:
- Zapis do tabeli `audit.activity_log`
- Logowanie operacji dla monitoringu
- Potencjalne powiadomienia real-time

## 6. Względy bezpieczeństwa

### Authentication & Authorization:
- **JWT Token**: Walidacja Bearer token z Supabase Auth
- **Role Check**: Użytkownik musi mieć rolę 'secretary'
- **Assignment Check**: Sekretarz musi być przypisany do rasy psa

### Row Level Security (RLS):
```sql
-- Polityka RLS dla descriptions
CREATE POLICY descriptions_secretary_access ON dog_shows.descriptions
FOR INSERT USING (
  EXISTS (
    SELECT 1 FROM dog_shows.secretary_assignments sa
    JOIN dog_shows.dogs d ON d.breed_id = sa.breed_id  
    WHERE sa.secretary_id = auth.uid()
      AND sa.show_id = descriptions.show_id
      AND d.id = descriptions.dog_id
  )
);
```

### Walidacja danych:
- **SQL Injection**: Użycie prepared statements
- **XSS Prevention**: Sanityzacja treści opisów
- **UUID Validation**: Sprawdzenie formatu UUID
- **Content Validation**: Filtrowanie niebezpiecznych znaków

### Rate Limiting:
- Maksymalnie 100 opisów na godzinę na użytkownika
- Throttling dla częstych żądań z tego samego IP

## 7. Obsługa błędów

### Walidacja danych wejściowych (400):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "show_id", 
        "message": "Invalid UUID format"
      },
      {
        "field": "content",
        "message": "At least one content (pl or en) is required"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "req_123456"
}
```

### Brak uprawnień (403):
```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR", 
    "message": "Secretary not assigned to this breed for this show"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "req_123456"
}
```

### Opis już istnieje (409):
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Description already exists for this dog and judge in this show"
  },
  "timestamp": "2024-01-15T11:30:00Z", 
  "request_id": "req_123456"
}
```

### Wystawa zakończona (422):
```json
{
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Cannot create descriptions for completed shows"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "req_123456"
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacje bazy danych:
- **Indeksy**: Złożone indeksy na (show_id, dog_id, judge_id)
- **Connection Pooling**: Supabase automatycznie zarządza połączeniami
- **Query Optimization**: Użycie JOIN zamiast multiple queries

### Caching:
- Cache informacji o secretary assignments na 1 godzinę
- Cache metadanych wystaw (status, daty)
- Redis dla session data jeśli potrzebne

### Monitoring:
- Śledzenie czasu odpowiedzi endpointu
- Monitoring liczby tworzonych opisów
- Alerty przy wysokim error rate

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie struktury
- [ ] Utworzenie pliku route w `/src/pages/api/descriptions.ts`
- [ ] Definicja DTO w `/src/types/descriptions.ts`  
- [ ] Utworzenie service w `/src/lib/services/descriptionService.ts`

### Krok 2: Implementacja walidacji
- [ ] Zod schema dla `CreateDescriptionDto`
- [ ] Walidacja UUID i wymaganych pól
- [ ] Walidacja biznesowa (show status, permissions)

### Krok 3: Implementacja service layer  
- [ ] `DescriptionService.create()` method
- [ ] Sprawdzenie uprawnień sekretarza
- [ ] Utworzenie opisu i wersji w transakcji
- [ ] Error handling i logging

### Krok 4: Implementacja API route
- [ ] Astro API route handler
- [ ] Integracja z Supabase client z context.locals
- [ ] Mappowanie błędów na odpowiednie kody HTTP
- [ ] Response formatting

### Krok 5: Bezpieczeństwo i RLS
- [ ] Konfiguracja RLS policies w Supabase
- [ ] Testy bezpieczeństwa (unauthorized access)
- [ ] Rate limiting implementation
- [ ] Content sanitization

### Krok 6: Testy i dokumentacja
- [ ] Unit testy dla service layer
- [ ] Integration testy dla API endpoint
- [ ] E2E testy dla complete flow
- [ ] API dokumentacja i examples

### Krok 7: Monitoring i audyt
- [ ] Audit logging implementation  
- [ ] Performance monitoring setup
- [ ] Error tracking i alerting
- [ ] Analytics dla usage patterns

### Krok 8: Deployment i weryfikacja
- [ ] Deploy na staging environment
- [ ] Load testing z realistic data
- [ ] Security penetration testing
- [ ] Production deployment
- [ ] Post-deployment monitoring

## 10. Struktura plików do utworzenia

```
src/
├── pages/api/
│   └── descriptions.ts                    # Main API route
├── lib/
│   ├── services/
│   │   └── descriptionService.ts          # Business logic
│   ├── validation/
│   │   └── descriptionSchemas.ts          # Zod schemas  
│   ├── utils/
│   │   └── errorHandling.ts               # Error utilities
│   └── types/
│       └── api.ts                         # API response types
└── middleware/
    ├── auth.ts                            # Authentication
    └── rateLimit.ts                       # Rate limiting
```

Ten plan zapewnia kompleksową implementację endpointu z uwzględnieniem wszystkich aspektów bezpieczeństwa, wydajności i niezawodności wymaganych w aplikacji zarządzania wystawami psów. 
