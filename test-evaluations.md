# Test Systemu Ocen - Klub Hovawarta

## Przegląd zmian

System ocen został dostosowany do nowych wytycznych dla klubu hovawarta:

### ✅ Zmiany zrealizowane:

1. **Oceny w języku polskim**:

   - `doskonała` (zamiast `excellent`)
   - `bardzo_dobra` (zamiast `very_good`)
   - `dobra` (zamiast `good`)
   - `zadowalająca` (zamiast `satisfactory`)
   - `zdyskwalifikowana` (zamiast `disqualified`)
   - `nieobecna` (zamiast `absent`)

2. **Oceny dla szczeniąt w języku polskim**:

   - `bardzo_obiecujący` (zamiast `very_promising`)
   - `obiecujący` (zamiast `promising`)
   - `dość_obiecujący` (zamiast `quite_promising`)

3. **Tytuły klubowe hovawartów**:

   - `młodzieżowy_zwycięzca_klubu`
   - `zwycięzca_klubu`
   - `zwycięzca_klubu_weteranów`
   - `najlepszy_reproduktor`
   - `najlepsza_suka_hodowlana`
   - `najlepsza_para`
   - `najlepsza_hodowla`
   - `zwycięzca_rasy`
   - `zwycięzca_płci_przeciwnej`
   - `najlepszy_junior`
   - `najlepszy_weteran`

4. **Bezpośrednie powiązanie z wystawami**:

   - Oceny są teraz bezpośrednio powiązane z wystawami, nie z opisami
   - Endpointy: `/shows/{showId}/evaluations`

5. **Usunięte niepotrzebne pola**:
   - `title` (CWC, CACIB)
   - `points`
   - `is_best_in_group`
   - `is_best_in_show`

## Endpointy API

### GET /shows/{showId}/evaluations

Pobiera listę ocen dla konkretnej wystawy.

**Query parameters:**

- `dog_class` - filtr według klasy psa
- `grade` - filtr według oceny
- `club_title` - filtr według tytułu klubowego
- `page` - numer strony (domyślnie 1)
- `limit` - liczba elementów na stronę (domyślnie 20)

**Przykład odpowiedzi:**

```json
{
  "evaluations": [
    {
      "id": "uuid",
      "dog": {
        "id": "uuid",
        "name": "Hovawart z Przykładu",
        "gender": "male",
        "birth_date": "2020-03-15"
      },
      "dog_class": "open",
      "grade": "doskonała",
      "baby_puppy_grade": null,
      "club_title": "zwycięzca_klubu",
      "placement": "1st",
      "created_at": "2024-01-15T10:30:00Z"
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

### POST /shows/{showId}/evaluations

Tworzy nową ocenę dla psa na konkretnej wystawie.

**Request body:**

```json
{
  "dog_id": "uuid",
  "dog_class": "open",
  "grade": "doskonała",
  "club_title": "zwycięzca_klubu",
  "placement": "1st"
}
```

**Dla szczeniąt (baby/puppy):**

```json
{
  "dog_id": "uuid",
  "dog_class": "baby",
  "baby_puppy_grade": "bardzo_obiecujący"
}
```

### PUT /shows/{showId}/evaluations/{evaluationId}

Aktualizuje istniejącą ocenę.

**Request body:**

```json
{
  "grade": "bardzo_dobra",
  "club_title": "zwycięzca_płci_przeciwnej"
}
```

### DELETE /shows/{showId}/evaluations/{evaluationId}

Usuwa ocenę.

## Walidacja biznesowa

### 1. Zgodność klasy z oceną

- **Baby/Puppy klasy** (baby, puppy): muszą używać `baby_puppy_grade`, nie mogą używać `grade`
- **Pozostałe klasy** (junior, intermediate, open, working, champion, veteran): muszą używać `grade`, nie mogą używać `baby_puppy_grade`

### 2. Rejestracja psa

- Pies musi być zarejestrowany na wystawę przed wprowadzeniem oceny
- Klasa w ocenie musi odpowiadać klasie w rejestracji

### 3. Status wystawy

- Oceny można wprowadzać tylko dla wystaw w statusie `in_progress` lub `completed`
- Oceny można edytować tylko dla wystaw, które nie są `completed`

### 4. Unikalność tytułów klubowych

- Każdy tytuł klubowy może być przyznany tylko jednemu psu na wystawę

## Przykłady testowe

### Test 1: Tworzenie oceny dla psa dorosłego

```bash
curl -X POST http://localhost:4321/api/shows/show-uuid/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "dog_id": "dog-uuid",
    "dog_class": "open",
    "grade": "doskonała",
    "club_title": "zwycięzca_klubu",
    "placement": "1st"
  }'
```

### Test 2: Tworzenie oceny dla szczenięcia

```bash
curl -X POST http://localhost:4321/api/shows/show-uuid/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "dog_id": "puppy-uuid",
    "dog_class": "baby",
    "baby_puppy_grade": "bardzo_obiecujący"
  }'
```

### Test 3: Błędna kombinacja (baby + grade)

```bash
curl -X POST http://localhost:4321/api/shows/show-uuid/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "dog_id": "puppy-uuid",
    "dog_class": "baby",
    "grade": "doskonała"
  }'
```

**Oczekiwany błąd:** "Baby/puppy classes use baby_puppy_grade, other classes use grade"

### Test 4: Pobieranie ocen z filtrami

```bash
curl "http://localhost:4321/api/shows/show-uuid/evaluations?dog_class=open&grade=doskonała&page=1&limit=10"
```

## Status implementacji

- ✅ **Walidacja schematów** - zaktualizowane z polskimi ocenami
- ✅ **Serwis ocen** - przepisany dla bezpośredniego powiązania z wystawami
- ✅ **Endpointy API** - utworzone nowe endpointy
- ✅ **Typy TypeScript** - zaktualizowane i uproszczone
- ✅ **Baza danych** - typy są zgodne z nowymi wymaganiami
- ❌ **Testy integracyjne** - do wykonania
- ❌ **Frontend** - komponenty do dostosowania

## Następne kroki

1. **Testy integracyjne** - sprawdzenie działania endpointów
2. **Aktualizacja frontendu** - dostosowanie komponentów do nowych typów
3. **Dokumentacja API** - aktualizacja dokumentacji
4. **Migracja danych** - jeśli istnieją stare dane do przeniesienia
