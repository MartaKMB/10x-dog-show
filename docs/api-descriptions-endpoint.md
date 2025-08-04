# API Dokumentacja: POST /descriptions

## Przegląd

Endpoint `POST /descriptions` umożliwia sekretarzom ringów tworzenie nowych opisów psów podczas wystaw. Jest to kluczowa funkcjonalność systemu 10x Dog Show, która digitalizuje proces ręcznego notowania ocen psów.

## Specyfikacja Endpoint'u

- **URL**: `/api/descriptions`
- **Metoda**: `POST`
- **Content-Type**: `application/json`
- **Autoryzacja**: Currently using DEFAULT_USER mock (rola: secretary)

## Request Body

### Schema

```typescript
{
  show_id: string;     // UUID wystawy
  dog_id: string;      // UUID psa
  judge_id: string;    // UUID sędziego
  content_pl?: string; // Treść opisu w języku polskim (opcjonalnie)
  content_en?: string; // Treść opisu w języku angielskim (opcjonalnie)
}
```

### Walidacja

- **show_id**: Wymagane, musi być prawidłowym UUID
- **dog_id**: Wymagane, musi być prawidłowym UUID
- **judge_id**: Wymagane, musi być prawidłowym UUID
- **content_pl/content_en**: Przynajmniej jedna treść jest wymagana

### Przykład Request Body

```json
{
  "show_id": "550e8400-e29b-41d4-a716-446655440001",
  "dog_id": "550e8400-e29b-41d4-a716-446655440002",
  "judge_id": "550e8400-e29b-41d4-a716-446655440003",
  "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch.",
  "content_en": "Very good representative of the breed. Excellent structure, correct movement."
}
```

## Response Codes

| Code | Status                | Opis                                 |
| ---- | --------------------- | ------------------------------------ |
| 201  | Created               | Opis został pomyślnie utworzony      |
| 400  | Bad Request           | Błąd walidacji danych wejściowych    |
| 403  | Forbidden             | Brak uprawnień sekretarza do rasy    |
| 404  | Not Found             | Wystawa/Pies/Sędzia nie istnieje     |
| 409  | Conflict              | Opis już istnieje dla tej kombinacji |
| 422  | Unprocessable Entity  | Wystawa zakończona                   |
| 500  | Internal Server Error | Błąd serwera                         |

## Response Body

### Pomyślna odpowiedź (201 Created)

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "show": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "National Dog Show Warsaw 2024",
    "show_date": "2024-03-15",
    "show_type": "national"
  },
  "dog": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Bella",
    "breed": {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "name_pl": "Labrador retriever",
      "name_en": "Labrador Retriever",
      "fci_group": "G8"
    },
    "gender": "female",
    "birth_date": "2022-05-15",
    "microchip_number": "123456789012345"
  },
  "judge": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "license_number": "PL001"
  },
  "secretary": {
    "id": "00000000-0000-0000-0000-000000000001",
    "first_name": "Test",
    "last_name": "Secretary"
  },
  "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch.",
  "content_en": "Very good representative of the breed. Excellent structure, correct movement.",
  "version": 1,
  "is_final": false,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "finalized_at": null
}
```

### Błąd walidacji (400 Bad Request)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "show_id",
        "message": "Invalid UUID format"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00.000Z",
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### Błąd autoryzacji (403 Forbidden)

```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Secretary not assigned to this breed for this show"
  },
  "timestamp": "2024-01-15T11:30:00.000Z",
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

## Logika Biznesowa

### Walidacja Business Rules

Endpoint wykonuje następujące sprawdzenia:

1. **Weryfikacja wystawy**:

   - Wystawa musi istnieć
   - Status wystawy nie może być "completed" lub "cancelled"

2. **Weryfikacja psa**:

   - Pies musi istnieć w systemie
   - Pies musi być zarejestrowany na wystawę

3. **Weryfikacja sędziego**:

   - Sędzia musi istnieć w systemie
   - Sędzia musi być przypisany do wystawy

4. **Weryfikacja uprawnień sekretarza**:

   - Sekretarz musi mieć uprawnienia do rasy psa
   - Sekretarz musi być przypisany do wystawy

5. **Weryfikacja unikalności**:
   - Opis nie może już istnieć dla kombinacji (wystawa, pies, sędzia)

### Tworzenie Opisu

Po pomyślnej walidacji:

1. **Generowany jest nowy UUID** dla opisu
2. **Tworzony jest rekord opisu** z:
   - Wersją = 1
   - Status is_final = false
   - Aktualnym timestampem
3. **Opis jest dodawany do MOCK_DATA** (w wersji production: zapisywany w bazie)
4. **Zwracana jest sformatowana odpowiedź** z powiązanymi danymi

## Mock Data

Aktualnie endpoint używa mock danych dla testowania:

### Dostępne Test Data

```javascript
// Wystawa
{
  id: "550e8400-e29b-41d4-a716-446655440001",
  status: "in_progress",
  name: "National Dog Show Warsaw 2024",
  show_date: "2024-03-15",
  show_type: "national"
}

// Pies
{
  id: "550e8400-e29b-41d4-a716-446655440002",
  breed_id: "550e8400-e29b-41d4-a716-446655440101",
  name: "Bella",
  gender: "female",
  birth_date: "2022-05-15",
  microchip_number: "123456789012345"
}

// Sędzia
{
  id: "550e8400-e29b-41d4-a716-446655440003",
  first_name: "Jan",
  last_name: "Kowalski",
  license_number: "PL001"
}

// Sekretarz (DEFAULT_USER)
{
  id: "00000000-0000-0000-0000-000000000001",
  role: "secretary"
}
```

## Przykłady Użycia

### cURL Example

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Bardzo dobry przedstawiciel rasy.",
    "content_en": "Very good representative of the breed."
  }'
```

### JavaScript/TypeScript Example

```typescript
interface CreateDescriptionRequest {
  show_id: string;
  dog_id: string;
  judge_id: string;
  content_pl?: string;
  content_en?: string;
}

async function createDescription(data: CreateDescriptionRequest) {
  const response = await fetch("/api/descriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${error.error.code}: ${error.error.message}`);
  }

  return response.json();
}

// Użycie
try {
  const description = await createDescription({
    show_id: "550e8400-e29b-41d4-a716-446655440001",
    dog_id: "550e8400-e29b-41d4-a716-446655440002",
    judge_id: "550e8400-e29b-41d4-a716-446655440003",
    content_pl: "Bardzo dobry przedstawiciel rasy.",
    content_en: "Very good representative of the breed.",
  });

  console.log("Opis utworzony:", description.id);
} catch (error) {
  console.error("Błąd:", error.message);
}
```

## Ograniczenia Mock Implementacji

**Obecne ograniczenia:**

- Używa DEFAULT_USER zamiast rzeczywistej autoryzacji
- Mock data nie persystuje między restartami serwera
- Brak rzeczywistej integracji z bazą danych Supabase
- Uproszczone sprawdzenie uprawnień

**Planowane ulepszenia:**

- Integracja z Supabase Auth
- Rzeczywiste zapytania do bazy danych
- Row Level Security (RLS) policies
- Rate limiting
- Audit logging

## Error Handling Best Practices

### Client-side Error Handling

```typescript
async function handleCreateDescription(data: CreateDescriptionRequest) {
  try {
    const result = await createDescription(data);
    // Sukces
    return result;
  } catch (error) {
    if (error.message.includes("VALIDATION_ERROR")) {
      // Pokaż błędy walidacji użytkownikowi
      showValidationErrors(error.details);
    } else if (error.message.includes("AUTHORIZATION_ERROR")) {
      // Przekieruj do logowania lub pokaż komunikat o braku uprawnień
      redirectToLogin();
    } else if (error.message.includes("CONFLICT")) {
      // Pokaż komunikat o duplikacie
      showMessage("Opis już istnieje dla tego psa i sędziego");
    } else {
      // Ogólny błąd
      showMessage("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    }
  }
}
```

## Testing

Szczegółowe instrukcje testowania znajdują się w `test-descriptions-requests.md`. Obejmują one:

- ✅ Pomyślne utworzenie opisu
- ❌ Błędy walidacji
- ❌ Błędy autoryzacji
- ❌ Błędy business logic
- ❌ Błędy conflict

## Roadmap

**Następne kroki:**

1. Integracja z rzeczywistą bazą danych
2. Implementacja autoryzacji JWT
3. Dodanie rate limiting
4. Rozszerzenie audit logging
5. Implementacja wersjonowania opisów
6. Dodanie endpoint'ów PUT/PATCH dla edycji opisów
