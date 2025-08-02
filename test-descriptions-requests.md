# Test Requests dla POST /descriptions

## Mock Data IDs do testowania:

- **Show ID**: `550e8400-e29b-41d4-a716-446655440001` (National Dog Show Warsaw 2024, status: in_progress)
- **Dog ID**: `550e8400-e29b-41d4-a716-446655440002` (Bella, Labrador retriever, female)
- **Judge ID**: `550e8400-e29b-41d4-a716-446655440003` (Jan Kowalski, PL001)
- **Secretary ID**: `00000000-0000-0000-0000-000000000001` (Test Secretary, uprawniony do rasy Labrador)

## 1. Pomyślne utworzenie opisu ✅

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002", 
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch.",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement."
  }'
```

**Oczekiwana odpowiedź (201 Created):**
```json
{
  "id": "uuid-generated",
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
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "finalized_at": null
}
```

## 2. Błąd walidacji - nieprawidłowy UUID ❌

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "invalid-uuid",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Test content"
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
        "field": "show_id",
        "message": "Invalid UUID format"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 3. Błąd walidacji - brak treści ❌

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003"
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
        "field": "content",
        "message": "At least one content (pl or en) is required"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 4. Błąd NOT_FOUND - nieistniejąca wystawa ❌

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "999e8400-e29b-41d4-a716-446655440999",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Test content"
  }'
```

**Oczekiwana odpowiedź (404 Not Found):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Show not found"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 5. Błąd CONFLICT - opis już istnieje ❌

```bash
# Po pierwszym pomyślnym utworzeniu opisu, ponowne żądanie:
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Drugi opis tego samego psa u tego samego sędziego"
  }'
```

**Oczekiwana odpowiedź (409 Conflict):**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Description already exists for this dog and judge in this show"
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

## 6. Testowanie z tylko angielską treścią ✅

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002",
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_en": "Only English content provided"
  }'
```

## 7. Testowanie z tylko polską treścią ✅

```bash
curl -X POST http://localhost:4321/api/descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": "550e8400-e29b-41d4-a716-446655440001",
    "dog_id": "550e8400-e29b-41d4-a716-446655440002", 
    "judge_id": "550e8400-e29b-41d4-a716-446655440003",
    "content_pl": "Tylko polska treść"
  }'
```

## Instrukcje testowania

1. **Uruchom serwer dev**: `npm run dev`
2. **Testuj kolejno wszystkie scenariusze** używając powyższych curl'i
3. **Sprawdź czy odpowiedzi są zgodne z oczekiwaniami**
4. **Sprawdź czy mock data jest poprawnie aktualizowana** (kolejne duplikaty powinny się nie udać)

## Mock Data do rozszerzenia testów

Aby przetestować więcej scenariuszy, można dodać do MOCK_DATA:

- Wystawę ze statusem "completed" do testowania business rule error
- Psa innej rasy do testowania autoryzacji
- Dodatkowych sędziów i sekretarzy 
