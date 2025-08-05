# Test Requests dla POST /shows

## Mock Data IDs do testowania:

- **Branch ID**: `550e8400-e29b-41d4-a716-446655440201` (Oddział Warszawa, active)
- **Branch ID**: `550e8400-e29b-41d4-a716-446655440202` (Oddział Kraków, active)
- **Organizer ID**: `00000000-0000-0000-0000-000000000002` (John Organizer, department_representative)

## 1. Pomyślne utworzenie wystawy ✅

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "National Dog Show Warsaw 2024",
    "show_type": "national",
    "show_date": "2024-06-15T10:00:00.000Z",
    "registration_deadline": "2024-06-01T23:59:59.000Z",
    "branch_id": "550e8400-e29b-41d4-a716-446655440201",
    "language": "pl",
    "max_participants": 200,
    "entry_fee": 50.00,
    "description": "Annual national dog show featuring all FCI groups"
  }'
```

**Oczekiwana odpowiedź (201 Created):**

```json
{
  "id": "uuid-generated",
  "name": "National Dog Show Warsaw 2024",
  "show_type": "national",
  "status": "draft",
  "show_date": "2024-06-15T10:00:00.000Z",
  "registration_deadline": "2024-06-01T23:59:59.000Z",
  "branch": {
    "id": "550e8400-e29b-41d4-a716-446655440201",
    "name": "Oddział Warszawa",
    "region": "Mazowieckie"
  },
  "organizer": {
    "id": "00000000-0000-0000-0000-000000000002",
    "first_name": "John",
    "last_name": "Organizer"
  },
  "max_participants": 200,
  "registered_dogs": 0,
  "entry_fee": 50.0,
  "description": "Annual national dog show featuring all FCI groups",
  "language": "pl",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## 2. Błąd walidacji - nieprawidłowy UUID obiektu ❌

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Show",
    "show_type": "national",
    "show_date": "2024-06-15T10:00:00.000Z",
    "registration_deadline": "2024-06-01T23:59:59.000Z",
    "branch_id": "invalid-uuid",
    "language": "pl"
  }'
```

**Oczekiwana odpowiedź (400 Bad Request):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "branch_id",
        "message": "Invalid UUID format"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 3. Błąd walidacji - data rejestracji po dacie wystawy ❌

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Show",
    "show_type": "national",
    "show_date": "2024-06-15T10:00:00.000Z",
    "registration_deadline": "2024-06-20T23:59:59.000Z",
    "branch_id": "550e8400-e29b-41d4-a716-446655440201",
    "language": "pl"
  }'
```

**Oczekiwana odpowiedź (400 Bad Request):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "registration_deadline",
        "message": "Registration deadline must be before or equal to show date"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 4. Błąd walidacji - data wystawy w przeszłości ❌

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Show",
    "show_type": "national",
    "show_date": "2023-06-15T10:00:00.000Z",
    "registration_deadline": "2023-06-01T23:59:59.000Z",
    "branch_id": "550e8400-e29b-41d4-a716-446655440201",
    "language": "pl"
  }'
```

**Oczekiwana odpowiedź (422 Unprocessable Entity):**

```json
{
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Show date must be in the future"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 5. Błąd NOT_FOUND - nieistniejący obiekt ❌

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Show",
    "show_type": "national",
    "show_date": "2024-06-15T10:00:00.000Z",
    "registration_deadline": "2024-06-01T23:59:59.000Z",
    "branch_id": "999e8400-e29b-41d4-a716-446655440999",
    "language": "pl"
  }'
```

**Oczekiwana odpowiedź (404 Not Found):**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Branch not found"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 6. Testowanie z minimalnymi danymi ✅

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minimal Show",
    "show_type": "international",
    "show_date": "2024-08-15T10:00:00.000Z",
    "registration_deadline": "2024-08-01T23:59:59.000Z",
    "branch_id": "550e8400-e29b-41d4-a716-446655440202",
    "language": "en"
  }'
```

## 7. Testowanie GET /shows ✅

```bash
# Pobierz wszystkie wystawy
curl -X GET "http://localhost:3000/api/shows"

# Pobierz wystawy z filtrowaniem
curl -X GET "http://localhost:3000/api/shows?show_type=national&status=draft&page=1&limit=10"

# Pobierz wystawy z filtrowaniem dat
curl -X GET "http://localhost:3000/api/shows?from_date=2024-01-01T00:00:00.000Z&to_date=2024-12-31T23:59:59.000Z"
```

**Oczekiwana odpowiedź (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "National Dog Show Warsaw 2024",
      "show_type": "national",
      "status": "draft",
      "show_date": "2024-06-15T10:00:00.000Z",
      "registration_deadline": "2024-06-01T23:59:59.000Z",
      "branch": {
        "id": "550e8400-e29b-41d4-a716-446655440201",
        "name": "Oddział Warszawa",
        "region": "Mazowieckie"
      },
      "organizer": {
        "id": "00000000-0000-0000-0000-000000000002",
        "first_name": "John",
        "last_name": "Organizer"
      },
      "max_participants": 200,
      "registered_dogs": 0,
      "entry_fee": 50.0,
      "description": "Annual national dog show featuring all FCI groups",
      "language": "pl",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## Instrukcje testowania

1. **Uruchom serwer dev**: `npm run dev`
2. **Testuj kolejno wszystkie scenariusze** używając powyższych curl'i
3. **Sprawdź czy odpowiedzi są zgodne z oczekiwaniami**
4. **Sprawdź czy mock data jest poprawnie aktualizowana** (GET powinien zwracać utworzone wystawy)

## Mock Data do rozszerzenia testów

Aby przetestować więcej scenariuszy, można dodać do MOCK_DATA:

- Obiekt ze statusem `is_active: false` do testowania business rule error
- Dodatkowych użytkowników z różnymi rolami
- Wystawy w różnych statusach do testowania filtrowania

## Uwagi implementacyjne

- Wszystkie nowe wystawy automatycznie otrzymują status `draft`
- Organizator jest automatycznie ustawiany na bieżącego użytkownika (department_representative)
- Walidacja dat sprawdza, czy data wystawy jest w przyszłości
- Walidacja relacji dat sprawdza, czy deadline rejestracji <= data wystawy
