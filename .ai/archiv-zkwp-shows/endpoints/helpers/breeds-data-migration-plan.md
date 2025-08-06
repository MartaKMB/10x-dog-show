# Plan migracji danych ras psów FCI

## 1. Przegląd zadania

Przygotowanie kompletnej tabeli `dictionary.breeds` z wszystkimi rasami psów uznanymi przez FCI (Federation Cynologique Internationale) na podstawie listy z pliku `breeds-list-from-perplexity.md`. Celem jest zastąpienie mock data rzeczywistymi danymi z bazy danych.

## 2. Analiza danych źródłowych

### 2.1 Struktura danych z breeds-list:

- **Grupy FCI:** G1-G10 (10 grup)
- **Rasy:** ~350+ ras psów
- **Dane:** Nazwa polska, nazwa angielska, grupa FCI, numer FCI
- **Format:** Lista tekstowa z podziałem na grupy

### 2.2 Wymagane dane dla tabeli breeds:

```sql
CREATE TABLE dictionary.breeds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_pl varchar(100) NOT NULL,        -- Nazwa polska
    name_en varchar(100) NOT NULL,        -- Nazwa angielska
    fci_group dog_shows.fci_group NOT NULL, -- Grupa FCI (G1-G10)
    fci_number integer UNIQUE,            -- Numer FCI (opcjonalny)
    is_active boolean DEFAULT true,       -- Status aktywności
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

## 3. Plan implementacji

### Etap 1: Przygotowanie danych źródłowych

1. **Przetworzenie listy ras** z `breeds-list-from-perplexity.md`

   - Ekstrakcja nazw polskich i angielskich
   - Mapowanie na grupy FCI
   - Dodanie numerów FCI (jeśli dostępne)
   - Walidacja kompletności danych

2. **Utworzenie pliku SQL** z danymi do wstawienia
   - Format INSERT statements
   - Obsługa znaków specjalnych (polskie znaki)
   - Walidacja unikalności numerów FCI

### Etap 2: Optymalizacja bazy danych

1. **Dodanie indeksów** dla wydajności:

   ```sql
   -- Indeks dla filtrowania po grupie FCI
   CREATE INDEX idx_breeds_fci_group ON dictionary.breeds(fci_group) WHERE is_active = true;

   -- Indeks dla wyszukiwania w nazwach
   CREATE INDEX idx_breeds_name_search ON dictionary.breeds USING gin(to_tsvector('polish', name_pl || ' ' || name_en)) WHERE is_active = true;

   -- Indeks złożony dla częstych zapytań
   CREATE INDEX idx_breeds_active_group ON dictionary.breeds(is_active, fci_group);

   -- Indeks dla numerów FCI
   CREATE INDEX idx_breeds_fci_number ON dictionary.breeds(fci_number) WHERE fci_number IS NOT NULL;
   ```

2. **Dodanie komentarzy** do tabeli:
   ```sql
   COMMENT ON TABLE dictionary.breeds IS 'Słownik ras psów uznanych przez FCI z klasyfikacją grup G1-G10';
   COMMENT ON COLUMN dictionary.breeds.fci_number IS 'Oficjalny numer FCI rasy (opcjonalny)';
   ```

### Etap 3: Migracja danych

1. **Utworzenie pliku migracji** z danymi

   - Plik SQL z INSERT statements
   - Obsługa duplikatów (ON CONFLICT)
   - Walidacja integralności danych

2. **Testowanie migracji**
   - Weryfikacja liczby wstawionych rekordów
   - Sprawdzenie unikalności numerów FCI
   - Testowanie indeksów

### Etap 4: Aktualizacja BreedService

1. **Modyfikacja BreedService** aby używał bazy danych:

   - Usunięcie mock data
   - Implementacja zapytań SQL
   - Dodanie obsługi błędów bazy danych

2. **Optymalizacja zapytań**:
   - Użycie indeksów
   - Efektywna paginacja
   - Case-insensitive search

## 4. Szczegółowy plan implementacji

### 4.1 Przygotowanie danych (Etap 1)

#### Zadanie 1.1: Przetworzenie listy ras

- **Plik wejściowy:** `breeds-list-from-perplexity.md`
- **Plik wyjściowy:** `supabase/migrations/20241221000000_populate_breeds_data.sql`
- **Zadania:**
  - Ekstrakcja nazw ras z listy
  - Mapowanie na grupy FCI
  - Dodanie numerów FCI (z zewnętrznych źródeł)
  - Walidacja kompletności

#### Zadanie 1.2: Utworzenie pliku SQL

```sql
-- Przykład struktury INSERT
INSERT INTO dictionary.breeds (name_pl, name_en, fci_group, fci_number, is_active) VALUES
('Owczarek Niemiecki', 'German Shepherd Dog', 'G1', 166, true),
('Owczarek Australijski', 'Australian Shepherd', 'G1', 342, true),
-- ... kolejne rasy
ON CONFLICT (fci_number) DO UPDATE SET
    name_pl = EXCLUDED.name_pl,
    name_en = EXCLUDED.name_en,
    fci_group = EXCLUDED.fci_group,
    updated_at = now();
```

### 4.2 Optymalizacja bazy danych (Etap 2)

#### Zadanie 2.1: Utworzenie migracji z indeksami

- **Plik:** `supabase/migrations/20241221000001_add_breeds_indexes.sql`
- **Zawartość:**
  - Indeksy dla wydajności
  - Komentarze do tabeli
  - Walidacja struktury

#### Zadanie 2.2: Testowanie indeksów

- Sprawdzenie planów wykonania zapytań
- Testowanie wydajności wyszukiwania
- Weryfikacja filtrowania

### 4.3 Migracja danych (Etap 3)

#### Zadanie 3.1: Wykonanie migracji

```bash
# Zatrzymanie lokalnego Supabase
supabase stop

# Generowanie migracji (jeśli potrzebne)
supabase db diff -f populate_breeds_data

# Uruchomienie Supabase
supabase start

# Weryfikacja danych
supabase db reset
```

#### Zadanie 3.2: Weryfikacja migracji

- Sprawdzenie liczby wstawionych rekordów
- Walidacja unikalności
- Testowanie endpointu `/api/breeds`

### 4.4 Aktualizacja BreedService (Etap 4)

#### Zadanie 4.1: Modyfikacja BreedService

```typescript
// Usunięcie mock data
// const MOCK_BREEDS: BreedResponseDto[] = [...];

// Implementacja zapytań SQL
async getMany(query: BreedQueryInput): Promise<PaginatedResponseDto<BreedResponseDto>> {
  const { fci_group, is_active, search, page, limit } = query;

  let queryBuilder = this.supabase
    .from('dictionary.breeds')
    .select('*', { count: 'exact' });

  // Dodanie filtrów
  if (fci_group) {
    queryBuilder = queryBuilder.eq('fci_group', fci_group);
  }

  if (is_active !== undefined) {
    queryBuilder = queryBuilder.eq('is_active', is_active);
  } else {
    queryBuilder = queryBuilder.eq('is_active', true);
  }

  // Dodanie wyszukiwania
  if (search && search.trim()) {
    queryBuilder = queryBuilder.or(`name_pl.ilike.%${search}%,name_en.ilike.%${search}%`);
  }

  // Paginacja
  const offset = (page - 1) * limit;
  queryBuilder = queryBuilder.range(offset, offset + limit - 1);

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new Error(`DATABASE_ERROR: ${error.message}`);
  }

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  };
}
```

#### Zadanie 4.2: Testowanie wydajności

- Testy z różnymi filtrami
- Pomiar czasu odpowiedzi
- Optymalizacja zapytań

## 5. Struktura plików do utworzenia

### Nowe pliki:

1. `supabase/migrations/20241221000000_populate_breeds_data.sql` - Dane ras
2. `supabase/migrations/20241221000001_add_breeds_indexes.sql` - Indeksy
3. `scripts/process-breeds-list.js` - Skrypt do przetwarzania listy (opcjonalnie)

### Modyfikowane pliki:

1. `src/lib/services/breedService.ts` - Usunięcie mock data, implementacja SQL
2. `src/pages/api/breeds.ts` - Ewentualne poprawki w obsłudze błędów

## 6. Kryteria akceptacji

### Funkcjonalne:

- [ ] Tabela `dictionary.breeds` zawiera wszystkie rasy z listy FCI
- [ ] Endpoint `/api/breeds` zwraca dane z bazy zamiast mock data
- [ ] Filtrowanie po grupach FCI działa poprawnie
- [ ] Wyszukiwanie w nazwach ras działa poprawnie
- [ ] Paginacja działa z rzeczywistymi danymi

### Wydajnościowe:

- [ ] Response time < 200ms dla standardowych zapytań
- [ ] Indeksy są używane w planach wykonania zapytań
- [ ] Wyszukiwanie tekstowe jest zoptymalizowane

### Jakościowe:

- [ ] Wszystkie nazwy ras są poprawne (polskie znaki)
- [ ] Numery FCI są unikalne
- [ ] Grupy FCI są poprawnie przypisane
- [ ] Brak duplikatów w danych

## 7. Harmonogram realizacji

### Dzień 1: Przygotowanie danych

- Przetworzenie listy ras z breeds-list
- Utworzenie pliku SQL z danymi
- Walidacja kompletności danych

### Dzień 2: Migracja bazy danych

- Utworzenie migracji z indeksami
- Wykonanie migracji danych
- Weryfikacja poprawności

### Dzień 3: Aktualizacja kodu

- Modyfikacja BreedService
- Testowanie endpointu
- Optymalizacja wydajności

### Dzień 4: Testy i dokumentacja

- Testy end-to-end
- Dokumentacja zmian
- Code review

## 8. Ryzyka i mitgacje

### Ryzyko 1: Niekompletne dane źródłowe

- **Mitgacja:** Weryfikacja z oficjalnymi źródłami FCI
- **Plan B:** Dodanie flagi `is_verified` dla weryfikacji później

### Ryzyko 2: Problemy z wydajnością

- **Mitgacja:** Testowanie z pełnym zestawem danych
- **Plan B:** Dodanie cache Redis dla często używanych zapytań

### Ryzyko 3: Problemy z kodowaniem znaków

- **Mitgacja:** Testowanie z polskimi znakami
- **Plan B:** Konwersja kodowania w migracji

## 9. Następne kroki

1. **Rozpoczęcie od Etapu 1** - przetworzenie danych źródłowych
2. **Utworzenie skryptu** do automatycznego przetwarzania listy ras
3. **Weryfikacja danych** z oficjalnymi źródłami FCI
4. **Implementacja migracji** krok po kroku
5. **Testowanie** na środowisku deweloperskim
6. **Deployment** do środowiska testowego
