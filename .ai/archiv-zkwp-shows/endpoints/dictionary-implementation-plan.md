# API Endpoint Implementation Plan: Dictionary Resources

## 1. Przegląd punktów końcowych

System słowników referencyjnych dla aplikacji 10x Dog Show, obejmujący zarządzanie rasami psów, sędziami i obiektami wystaw. Słowniki zapewniają dane referencyjne dla głównych funkcjonalności systemu i są używane w formularzach, filtrowaniu i raportowaniu.

### Breeds Management

- Lista ras psów z klasyfikacją FCI (grupy G1-G10)
- Filtrowanie po grupach FCI i statusie aktywności
- Wyszukiwanie w nazwach ras (polski/angielski)
- Dane referencyjne dla rejestracji psów

### Judges Management

- Lista sędziów z licencjami FCI
- Specjalizacje sędziów w grupach FCI
- Filtrowanie po specjalizacjach i statusie aktywności
- Dane referencyjne dla przypisań do wystaw

### Branches Management

- Lista oddziałów organizujących wystawy
- Filtrowanie po regionie i statusie aktywności
- Dane referencyjne dla tworzenia wystaw

## 2. Szczegóły żądań

### 2.1 Breeds Management Endpoints

#### GET /breeds

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/breeds`
- **Parametry query:**
  - `fci_group` (optional): Filtr po grupie FCI (G1-G10)
  - `is_active` (optional): Filtr po statusie aktywności
  - `search` (optional): Wyszukiwanie w nazwach ras (pl/en)
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 50, max: 200)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista ras psów z filtrowaniem i paginacją

#### GET /breeds/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/breeds/{id}`
- **Parametry:** `id` (UUID) - Identyfikator rasy
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Szczegóły konkretnej rasy

#### GET /breeds/groups/{fciGroup}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/breeds/groups/{fciGroup}`
- **Parametry:** `fciGroup` (G1-G10) - Grupa FCI
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista ras w konkretnej grupie FCI

### 2.2 Judges Management Endpoints

#### GET /judges

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/judges`
- **Parametry query:**
  - `fci_group` (optional): Filtr po specjalizacji (G1-G10)
  - `is_active` (optional): Filtr po statusie aktywności
  - `search` (optional): Wyszukiwanie w imieniu, nazwisku lub licencji
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista sędziów z filtrowaniem i paginacją

#### GET /judges/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/judges/{id}`
- **Parametry:** `id` (UUID) - Identyfikator sędziego
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Szczegóły konkretnego sędziego z specjalizacjami

#### GET /judges/specializations/{fciGroup}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/judges/specializations/{fciGroup}`
- **Parametry:** `fciGroup` (G1-G10) - Grupa FCI
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista sędziów specjalizujących się w konkretnej grupie FCI

### 2.3 Branches Management Endpoints

#### GET /branches

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/branches`
- **Parametry query:**
  - `region` (optional): Filtr po regionie
  - `is_active` (optional): Filtr po statusie aktywności
  - `search` (optional): Wyszukiwanie w nazwie lub adresie
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista oddziałów organizujących wystawy z filtrowaniem i paginacją

#### GET /branches/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/branches/{id}`
- **Parametry:** `id` (UUID) - Identyfikator oddziału
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Szczegóły konkretnego oddziału

#### GET /branches/regions

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/branches/regions`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy
- **Opis:** Lista regionów z oddziałami organizującymi wystawy

## 3. Wykorzystywane typy

### 3.1 Breeds DTOs

```typescript
// Odpowiedź rasy (podstawowa)
interface BreedResponseDto {
  id: string;
  name_pl: string;
  name_en: string;
  fci_group: FCIGroup;
  fci_number: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Lista ras z paginacją
interface BreedsListResponseDto {
  breeds: BreedResponseDto[];
  pagination: PaginationDto;
}

// Rasy w grupie FCI
interface BreedsByGroupResponseDto {
  fci_group: FCIGroup;
  breeds: BreedResponseDto[];
  total_count: number;
}
```

### 3.2 Judges DTOs

```typescript
// Odpowiedź sędziego (podstawowa)
interface JudgeResponseDto {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  specializations: FCIGroup[];
  created_at: string;
  updated_at: string;
}

// Odpowiedź sędziego (szczegółowa)
interface JudgeDetailResponseDto extends JudgeResponseDto {
  specializations: JudgeSpecializationDto[];
  total_shows_judged: number;
  last_show_date: string | null;
}

// Specjalizacja sędziego
interface JudgeSpecializationDto {
  id: string;
  fci_group: FCIGroup;
  is_active: boolean;
  created_at: string;
}

// Lista sędziów z paginacją
interface JudgesListResponseDto {
  judges: JudgeResponseDto[];
  pagination: PaginationDto;
}

// Sędziowie w specjalizacji
interface JudgesBySpecializationResponseDto {
  fci_group: FCIGroup;
  judges: JudgeResponseDto[];
  total_count: number;
}
```

### 3.3 Branches DTOs

```typescript
// Odpowiedź oddziału (podstawowa)
interface BranchResponseDto {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string | null;
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Odpowiedź oddziału (szczegółowa)
interface BranchDetailResponseDto extends BranchResponseDto {
  total_shows: number;
  last_show_date: string | null;
  upcoming_shows: number;
}

// Lista oddziałów z paginacją
interface BranchesListResponseDto {
  branches: BranchResponseDto[];
  pagination: PaginationDto;
}

// Lista regionów
interface RegionsResponseDto {
  regions: {
    region: string;
    branches_count: number;
  }[];
}
```

### 3.4 Query Parameters

```typescript
interface BreedQueryParams {
  fci_group?: FCIGroup;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface JudgeQueryParams {
  fci_group?: FCIGroup;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface BranchQueryParams {
  region?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

## 4. Logika biznesowa

### 4.1 Breeds Management Logic

#### Lista ras:

1. **Filtrowanie:**

   - Po grupie FCI (G1-G10)
   - Po statusie aktywności
   - Wyszukiwanie w nazwach polskich i angielskich

2. **Paginacja:**

   - Domyślnie 50 elementów na stronę
   - Maksymalnie 200 elementów na stronę
   - Sortowanie po fci_group, fci_number, name_pl

3. **Wyszukiwanie:**
   - Case-insensitive wyszukiwanie
   - Wyszukiwanie w name_pl i name_en
   - Partial matching (LIKE %search%)

#### Rasy w grupie FCI:

1. **Agregacja:**
   - Grupowanie po fci_group
   - Liczenie ras w grupie
   - Sortowanie po fci_number

### 4.2 Judges Management Logic

#### Lista sędziów:

1. **Filtrowanie:**

   - Po specjalizacji (grupa FCI)
   - Po statusie aktywności
   - Wyszukiwanie w imieniu, nazwisku, licencji

2. **Paginacja:**

   - Domyślnie 20 elementów na stronę
   - Maksymalnie 100 elementów na stronę
   - Sortowanie po last_name, first_name

3. **Specjalizacje:**
   - JOIN z dictionary.judge_specializations
   - Filtrowanie po is_active = true
   - Agregacja specjalizacji w array

#### Sędziowie w specjalizacji:

1. **Filtrowanie:**
   - Tylko sędziowie z aktywną specjalizacją
   - Sortowanie po last_name, first_name

### 4.3 Branches Management Logic

#### Lista oddziałów:

1. **Filtrowanie:**

   - Po regionie
   - Po statusie aktywności
   - Wyszukiwanie w nazwie i adresie

2. **Paginacja:**

   - Domyślnie 20 elementów na stronę
   - Maksymalnie 100 elementów na stronę
   - Sortowanie po region, name

3. **Statystyki:**
   - Liczba wystaw organizowanych przez oddział
   - Data ostatniej wystawy
   - Liczba nadchodzących wystaw

#### Lista regionów:

1. **Agregacja:**
   - Grupowanie po region
   - Liczenie oddziałów w regionie
   - Sortowanie po region

## 5. Implementacja serwisów

### 5.1 DictionaryService

```typescript
class DictionaryService {
  // Breeds Management
  async getBreeds(params: BreedQueryParams): Promise<BreedsListResponseDto> {
    // Implementacja listy ras
  }

  async getBreedById(id: string): Promise<BreedResponseDto> {
    // Implementacja szczegółów rasy
  }

  async getBreedsByGroup(
    fciGroup: FCIGroup,
  ): Promise<BreedsByGroupResponseDto> {
    // Implementacja ras w grupie FCI
  }

  // Judges Management
  async getJudges(params: JudgeQueryParams): Promise<JudgesListResponseDto> {
    // Implementacja listy sędziów
  }

  async getJudgeById(id: string): Promise<JudgeDetailResponseDto> {
    // Implementacja szczegółów sędziego
  }

  async getJudgesBySpecialization(
    fciGroup: FCIGroup,
  ): Promise<JudgesBySpecializationResponseDto> {
    // Implementacja sędziów w specjalizacji
  }

  // Branches Management
  async getBranches(
    params: BranchQueryParams,
  ): Promise<BranchesListResponseDto> {
    // Implementacja listy oddziałów
  }

  async getBranchById(id: string): Promise<BranchDetailResponseDto> {
    // Implementacja szczegółów oddziału
  }

  async getRegions(): Promise<RegionsResponseDto> {
    // Implementacja listy regionów
  }
}
```

## 6. Zapytania SQL

### 6.1 Breeds Queries

```sql
-- Lista ras z filtrowaniem
SELECT
  id, name_pl, name_en, fci_group, fci_number, is_active,
  created_at, updated_at
FROM dictionary.breeds
WHERE is_active = true
  AND ($1::text IS NULL OR fci_group = $1::dog_shows.fci_group)
  AND ($2::text IS NULL OR (
    name_pl ILIKE '%' || $2 || '%' OR
    name_en ILIKE '%' || $2 || '%'
  ))
ORDER BY fci_group, fci_number, name_pl
LIMIT $3 OFFSET $4;

-- Rasy w grupie FCI
SELECT
  id, name_pl, name_en, fci_group, fci_number, is_active,
  created_at, updated_at
FROM dictionary.breeds
WHERE fci_group = $1 AND is_active = true
ORDER BY fci_number, name_pl;
```

### 6.2 Judges Queries

```sql
-- Lista sędziów z specjalizacjami
SELECT
  j.id, j.first_name, j.last_name, j.license_number,
  j.email, j.phone, j.is_active, j.created_at, j.updated_at,
  array_agg(js.fci_group) FILTER (WHERE js.is_active = true) as specializations
FROM dictionary.judges j
LEFT JOIN dictionary.judge_specializations js ON j.id = js.judge_id
WHERE j.deleted_at IS NULL
  AND ($1::text IS NULL OR js.fci_group = $1::dog_shows.fci_group)
  AND ($2::boolean IS NULL OR j.is_active = $2)
  AND ($3::text IS NULL OR (
    j.first_name ILIKE '%' || $3 || '%' OR
    j.last_name ILIKE '%' || $3 || '%' OR
    j.license_number ILIKE '%' || $3 || '%'
  ))
GROUP BY j.id, j.first_name, j.last_name, j.license_number,
         j.email, j.phone, j.is_active, j.created_at, j.updated_at
ORDER BY j.last_name, j.first_name
LIMIT $4 OFFSET $5;

-- Sędziowie w specjalizacji
SELECT
  j.id, j.first_name, j.last_name, j.license_number,
  j.email, j.phone, j.is_active, j.created_at, j.updated_at,
  array_agg(js.fci_group) FILTER (WHERE js.is_active = true) as specializations
FROM dictionary.judges j
JOIN dictionary.judge_specializations js ON j.id = js.judge_id
WHERE j.deleted_at IS NULL
  AND js.fci_group = $1
  AND js.is_active = true
  AND j.is_active = true
GROUP BY j.id, j.first_name, j.last_name, j.license_number,
         j.email, j.phone, j.is_active, j.created_at, j.updated_at
ORDER BY j.last_name, j.first_name;
```

### 6.3 Branches Queries

```sql
-- Lista oddziałów z filtrowaniem
SELECT
  id, name, address, city, postal_code, region, is_active,
  created_at, updated_at
FROM dictionary.branches
WHERE is_active = true
  AND ($1::text IS NULL OR region = $1)
  AND ($2::text IS NULL OR (
    name ILIKE '%' || $2 || '%' OR
    address ILIKE '%' || $2 || '%'
  ))
ORDER BY region, name
LIMIT $3 OFFSET $4;

-- Lista regionów
SELECT
  region, COUNT(*) as branches_count
FROM dictionary.branches
WHERE is_active = true
GROUP BY region
ORDER BY region;
```

## 7. Cache Strategy

### 7.1 Caching Configuration

```typescript
// Konfiguracja cache dla słowników
const cacheConfig = {
  // Cache dla ras (1 godzina)
  breeds: {
    ttl: 60 * 60, // 1 godzina
    key: "breeds",
    version: "v1",
  },
  // Cache dla sędziów (30 minut)
  judges: {
    ttl: 30 * 60, // 30 minut
    key: "judges",
    version: "v1",
  },
  // Cache dla oddziałów (2 godziny)
  branches: {
    ttl: 2 * 60 * 60, // 2 godziny
    key: "branches",
    version: "v1",
  },
};

// Implementacja cache
class DictionaryCache {
  async getBreeds(
    params: BreedQueryParams,
  ): Promise<BreedsListResponseDto | null> {
    const cacheKey = `breeds:${JSON.stringify(params)}`;
    return await this.get(cacheKey);
  }

  async setBreeds(
    params: BreedQueryParams,
    data: BreedsListResponseDto,
  ): Promise<void> {
    const cacheKey = `breeds:${JSON.stringify(params)}`;
    await this.set(cacheKey, data, cacheConfig.breeds.ttl);
  }

  async invalidateBreeds(): Promise<void> {
    await this.delPattern("breeds:*");
  }
}
```

## 8. Walidacja danych

### 8.1 Query Parameters Validation

```typescript
// Walidacja parametrów ras
const breedQuerySchema = z.object({
  fci_group: z
    .enum(["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"])
    .optional(),
  is_active: z.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.number().min(1).max(1000).optional(),
  limit: z.number().min(1).max(200).optional(),
});

// Walidacja parametrów sędziów
const judgeQuerySchema = z.object({
  fci_group: z
    .enum(["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"])
    .optional(),
  is_active: z.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.number().min(1).max(1000).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Walidacja parametrów obiektów
const branchQuerySchema = z.object({
  region: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.number().min(1).max(1000).optional(),
  limit: z.number().min(1).max(100).optional(),
});
```

## 9. Obsługa błędów

### 9.1 Dictionary Errors

```typescript
// Błędy słowników
const DICTIONARY_ERRORS = {
  BREED_NOT_FOUND: {
    code: "BREED_NOT_FOUND",
    message: "Rasa nie została znaleziona",
    status: 404,
  },
  JUDGE_NOT_FOUND: {
    code: "JUDGE_NOT_FOUND",
    message: "Sędzia nie został znaleziony",
    status: 404,
  },
  BRANCH_NOT_FOUND: {
    code: "BRANCH_NOT_FOUND",
    message: "Oddział nie został znaleziony",
    status: 404,
  },
  INVALID_FCI_GROUP: {
    code: "INVALID_FCI_GROUP",
    message: "Nieprawidłowa grupa FCI",
    status: 400,
  },
  CACHE_ERROR: {
    code: "CACHE_ERROR",
    message: "Błąd cache",
    status: 500,
  },
};
```

## 10. Testy

### 10.1 Unit Tests

```typescript
describe("DictionaryService", () => {
  describe("getBreeds", () => {
    it("should return paginated breeds list", async () => {
      // Test listy ras
    });

    it("should filter breeds by FCI group", async () => {
      // Test filtrowania po grupie FCI
    });

    it("should search breeds by name", async () => {
      // Test wyszukiwania
    });
  });

  describe("getJudges", () => {
    it("should return judges with specializations", async () => {
      // Test listy sędziów
    });

    it("should filter judges by specialization", async () => {
      // Test filtrowania po specjalizacji
    });
  });

  describe("getBranches", () => {
    it("should return branches with statistics", async () => {
      // Test listy oddziałów
    });

    it("should filter branches by region", async () => {
      // Test filtrowania po regionie
    });
  });
});
```

### 10.2 Integration Tests

```typescript
describe("Dictionary API", () => {
  describe("GET /api/breeds", () => {
    it("should return breeds list", async () => {
      // Test endpointu ras
    });
  });

  describe("GET /api/judges", () => {
    it("should return judges list", async () => {
      // Test endpointu sędziów
    });
  });

  describe("GET /api/branches", () => {
    it("should return branches list", async () => {
      // Test endpointu oddziałów
    });
  });
});
```

## 11. Performance Optimization

### 11.1 Database Indexes

```sql
-- Indeksy dla ras
CREATE INDEX IF NOT EXISTS idx_breeds_fci_group ON dictionary.breeds(fci_group) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_breeds_name_search ON dictionary.breeds USING gin(to_tsvector('polish', name_pl || ' ' || name_en)) WHERE is_active = true;

-- Indeksy dla sędziów
CREATE INDEX IF NOT EXISTS idx_judges_active ON dictionary.judges(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_judges_name_search ON dictionary.judges USING gin(to_tsvector('polish', first_name || ' ' || last_name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_judge_specializations_group ON dictionary.judge_specializations(fci_group) WHERE is_active = true;

-- Indeksy dla oddziałów
CREATE INDEX IF NOT EXISTS idx_branches_region ON dictionary.branches(region) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_branches_name_search ON dictionary.branches USING gin(to_tsvector('polish', name || ' ' || address)) WHERE is_active = true;
```

### 11.2 Query Optimization

```typescript
// Optymalizacja zapytań z JOIN
const optimizedJudgesQuery = `
  WITH judge_specializations AS (
    SELECT 
      judge_id,
      array_agg(fci_group) FILTER (WHERE is_active = true) as specializations
    FROM dictionary.judge_specializations
    GROUP BY judge_id
  )
  SELECT 
    j.id, j.first_name, j.last_name, j.license_number,
    j.email, j.phone, j.is_active, j.created_at, j.updated_at,
    COALESCE(js.specializations, ARRAY[]::dog_shows.fci_group[]) as specializations
  FROM dictionary.judges j
  LEFT JOIN judge_specializations js ON j.id = js.judge_id
  WHERE j.deleted_at IS NULL
    AND ($1::text IS NULL OR $1 = ANY(js.specializations))
    AND ($2::boolean IS NULL OR j.is_active = $2)
  ORDER BY j.last_name, j.first_name
  LIMIT $3 OFFSET $4;
`;
```

## 12. Monitoring i metryki

### 12.1 Performance Metrics

```typescript
// Metryki wydajności słowników
const dictionaryMetrics = {
  // Czas odpowiedzi
  responseTime: {
    breeds: new Histogram(
      "dictionary_breeds_response_time",
      "Breeds API response time",
    ),
    judges: new Histogram(
      "dictionary_judges_response_time",
      "Judges API response time",
    ),
    branches: new Histogram(
      "dictionary_branches_response_time",
      "Branches API response time",
    ),
  },

  // Liczba zapytań
  requestCount: {
    breeds: new Counter(
      "dictionary_breeds_requests_total",
      "Total breeds requests",
    ),
    judges: new Counter(
      "dictionary_judges_requests_total",
      "Total judges requests",
    ),
    branches: new Counter(
      "dictionary_branches_requests_total",
      "Total branches requests",
    ),
  },

  // Cache hit rate
  cacheHitRate: {
    breeds: new Gauge(
      "dictionary_breeds_cache_hit_rate",
      "Breeds cache hit rate",
    ),
    judges: new Gauge(
      "dictionary_judges_cache_hit_rate",
      "Judges cache hit rate",
    ),
    branches: new Gauge(
      "dictionary_branches_cache_hit_rate",
      "Branches cache hit rate",
    ),
  },
};
```

## 13. Dokumentacja API

### 13.1 OpenAPI/Swagger

```yaml
paths:
  /api/breeds:
    get:
      summary: Lista ras psów
      tags: [Dictionary]
      parameters:
        - name: fci_group
          in: query
          schema:
            type: string
            enum: [G1, G2, G3, G4, G5, G6, G7, G8, G9, G10]
        - name: search
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
            maximum: 200
      responses:
        "200":
          description: Lista ras
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BreedsListResponseDto"

  /api/judges:
    get:
      summary: Lista sędziów
      tags: [Dictionary]
      parameters:
        - name: fci_group
          in: query
          schema:
            type: string
            enum: [G1, G2, G3, G4, G5, G6, G7, G8, G9, G10]
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Lista sędziów
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JudgesListResponseDto"

  /api/branches:
    get:
      summary: Lista oddziałów organizujących wystawy
      tags: [Dictionary]
      parameters:
        - name: region
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Lista oddziałów
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BranchesListResponseDto"
```

## 14. Podsumowanie

Ten plan implementacji zapewnia:

### ✅ **Funkcjonalności Breeds Management:**

- Lista ras psów z klasyfikacją FCI
- Filtrowanie po grupach FCI i statusie aktywności
- Wyszukiwanie w nazwach ras (polski/angielski)
- Agregacja ras w grupach FCI

### ✅ **Funkcjonalności Judges Management:**

- Lista sędziów z licencjami FCI
- Specjalizacje sędziów w grupach FCI
- Filtrowanie po specjalizacjach i statusie aktywności
- Wyszukiwanie w danych sędziów

### ✅ **Funkcjonalności Branches Management:**

- Lista oddziałów organizujących wystawy
- Filtrowanie po regionie i statusie aktywności
- Statystyki oddziałów (liczba wystaw, ostatnia wystawa)
- Lista regionów z oddziałami

### ✅ **Wydajność i skalowalność:**

- Cache strategy dla słowników
- Zoptymalizowane zapytania SQL
- Indeksy dla szybkiego wyszukiwania
- Paginacja i filtrowanie

### ✅ **Monitoring:**

- Metryki wydajności API
- Cache hit rate monitoring
- Error tracking
- Performance optimization

**Następne kroki:** Implementacja endpointów zgodnie z tym planem, konfiguracja cache, testy wydajnościowe, dokumentacja API.
