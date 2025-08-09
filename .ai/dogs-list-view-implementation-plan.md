# Plan implementacji widoku Dogs List

## 1. Przegląd
Widok listy psów (Dogs List) zapewnia zarządzanie psami w systemie klubu hovawarta: przeglądanie, filtrowanie, wyszukiwanie oraz paginację. Wykorzystuje uproszczony model danych MVP (bez ras i FCI) i istniejące API do listowania i operacji na psach. Celem jest szybkie odnalezienie psa po nazwie, numerze chipa, płci czy nazwie hodowli oraz wgląd w powiązanych właścicieli.

## 2. Routing widoku
- Ścieżka: `/dogs`
- Plik strony: `src/pages/dogs/index.astro`
- Montowany komponent React: `DogsListView` (nowy, w `src/components/dogs/DogsListView.tsx`)

## 3. Struktura komponentów
- `pages/dogs/index.astro`
  - `components/dogs/DogsListView.tsx`
    - `components/dogs/DogFilters.tsx`
    - `components/dogs/DogsTable.tsx`
      - `components/dogs/DogRow.tsx`
    - Reużywane komponenty wspólne:
      - `components/shows/Pagination.tsx`
      - `components/shows/LoadingSpinner.tsx`
      - `components/shows/ErrorDisplay.tsx`
      - `components/shows/EmptyState.tsx`

## 4. Szczegóły komponentów
### DogsListView
- Opis: Kontener widoku listy psów. Odpowiada za stan, pobieranie danych, obsługę filtrów, wyszukiwania i paginacji. Renderuje filtry, tabelę i elementy stanu (ładowanie, błąd, pustka).
- Główne elementy:
  - Nagłówek z tytułem i (opcjonalnie) przyciskiem „Dodaj psa” (link do przyszłego `/dogs/new`).
  - `DogFilters` (search + filtry), `DogsTable`, `Pagination`, `LoadingSpinner`, `ErrorDisplay`, `EmptyState`.
- Obsługiwane interakcje:
  - Zmiana filtrów, wpisywanie zapytania wyszukiwania (debounce), zmiana strony.
  - Klik w wiersz psa (nawigacja do szczegółów `/dogs/[dogId]` – opcjonalne, jeżeli strona istnieje w przyszłości).
- Obsługiwana walidacja (UI):
  - Wyszukiwanie: min. 2 znaki, max. 100 (zgodnie z `DogQueryInput.search`).
  - Płeć: tylko `male` | `female` (Enum).
  - Numer chipa: opcjonalny, jeżeli podany – 15 cyfr (regex). Nie blokuje zapytania listującego, ale walidujemy input.
  - Paginacja: `page >= 1`, `1 <= limit <= 100`.
- Typy: `DogResponse`, `DogQueryParams`, `PaginationInfo`, `PaginatedResponse<DogResponse>` z `@types.ts`.
- Propsy: brak (to widok-strona). Opcjonalnie `initialQuery` w przyszłości.

### DogFilters
- Opis: Panel filtrów i wyszukiwarki dla listy psów (dostosowany do MVP bez ras/FCI).
- Główne elementy:
  - Search input (po nazwie psa, hodowli; backend przeszukuje `name`, `kennel_name`).
  - Select płci (`male`, `female`).
  - Input numeru chipa (15 cyfr, opcjonalny).
  - Input nazwy hodowli (`kennel_name`).
  - (Opcjonalnie) selektor właściciela w przyszłości – pobierany z `/api/owners` (nie jest wymagany dla MVP, ale API wspiera `owner_id`).
  - Przycisk „Wyczyść filtry”.
- Obsługiwane interakcje:
  - onSearch(query: string) z debounce 300 ms.
  - onFiltersChange(partialFilters).
  - onClearFilters().
- Walidacja UI:
  - search: min 2, max 100.
  - microchip_number: regex 15 cyfr.
- Typy: `DogQueryParams` (podzbiór), lokalny `DogFiltersState` z polami: `{ gender?: DogGender; microchip_number?: string; kennel_name?: string; owner_id?: string; }` oraz `search: string`.
- Propsy:
  - `filters: DogFiltersState`
  - `searchValue: string`
  - `onFiltersChange: (filters: Partial<DogFiltersState>) => void`
  - `onSearch: (value: string) => void`
  - `onClearFilters: () => void`

### DogsTable
- Opis: Tabela wyników psów.
- Główne elementy: `<table>` z kolumnami: Imię, Płeć, Data urodzenia, Chip (jeśli jest), Hodowla, Właściciele (pierwszy + liczba), Akcje (opcjonalnie – np. „Zobacz szczegóły”).
- Obsługiwane interakcje: klik w wiersz lub przycisk „Szczegóły”.
- Walidacja: brak dodatkowej (dane przychodzą z API zwalidowane po stronie backendu).
- Typy: `DogResponse`.
- Propsy:
  - `dogs: DogResponse[]`
  - `isLoading: boolean`
  - `onRowClick?: (dogId: string) => void`

### DogRow
- Opis: Pojedynczy wiersz psa z formatowaniem danych oraz renderem listy właścicieli (ograniczonej dla czytelności).
- Główne elementy: `<tr>` + `<td>` kolumny, skrót właścicieli „Jan K. (+2)”.
- Interakcje: klik w wiersz → `onRowClick`.
- Typy: `DogResponse`.
- Propsy:
  - `dog: DogResponse`
  - `onClick?: (dogId: string) => void`

### Reużywane komponenty wspólne
- `Pagination` (z `components/shows/Pagination.tsx`):
  - Propsy: `currentPage`, `totalPages`, `totalItems`, `onPageChange(page)`.
- `LoadingSpinner`, `ErrorDisplay`, `EmptyState` (z `components/shows/…`): bez zmian.

## 5. Typy
- Reużywane z `@types.ts` (`10x-dog-show/src/types.ts`):
  - `DogResponse`, `DogQueryParams`, `PaginationInfo`, `PaginatedResponse<T>`.
- Nowe (ViewModely):
  - `DogFiltersState`:
    - `gender?: DogGender`
    - `microchip_number?: string`
    - `kennel_name?: string`
    - `owner_id?: string`
  - `DogsListViewModel` (lokalny stan widoku):
    - `dogs: DogResponse[]`
    - `filters: DogFiltersState`
    - `search: string`
    - `pagination: PaginationInfo`
    - `isLoading: boolean`
    - `error: string | null`

## 6. Zarządzanie stanem
- Lokalny stan w `DogsListView` lub dedykowany hook `useDogsCatalog` (zalecane) analogiczny do `useOwnersList`:
  - `state: DogsListViewModel` + akcje: `updateFilters`, `updateSearch`, `updatePagination`, `clearFilters`, `fetchDogs`.
- Debounce dla wyszukiwarki w `DogFilters` (300 ms).

## 7. Integracja API
- Specyfikacja: `@api-plan-hov.md` → sekcja Dogs Management (`GET /dogs`, `GET /dogs/{id}`, `POST /dogs`, `PUT /dogs/{id}`, `DELETE /dogs/{id}`).
- Implementacja endpointów w kodzie:
  - `@dogs/index.ts` → `src/pages/api/dogs/index.ts` (GET list, POST create)
  - `@dogs/[id].ts` → `src/pages/api/dogs/[id].ts` (GET by id, PUT, DELETE)
- Wywołania w widoku:
  - `GET /api/dogs?gender=&owner_id=&microchip_number=&kennel_name=&search=&page=&limit=`
  - Odpowiedź: `{ data: DogResponse[], pagination: PaginationInfo }` lub bezpośrednio `PaginatedResponseDto<DogResponse>`.
- Wymagania API (walidacja po stronie UI):
  - `gender` ∈ {`male`, `female`}
  - `search` max 100 znaków
  - `microchip_number` 15 cyfr (jeśli podany)
  - `page >= 1`, `1 <= limit <= 100`

## 8. Interakcje użytkownika
- Wpisz frazę w wyszukiwarkę → po 300 ms automatyczne zapytanie do API z `search`.
- Zmień filtr płci / hodowli / chipu → reset strony na 1, zapytanie do API.
- Kliknij numer strony w paginacji → aktualizacja `page`, zapytanie do API.
- Klik w psa → (opcjonalnie) nawigacja do `/dogs/[dogId]` (gdy strona powstanie).

## 9. Warunki i walidacja
- Walidacja formularza filtrów przed wykonaniem zapytania:
  - `search.length === 0 || 2 <= length <= 100`.
  - `microchip_number` spełnia `/^[0-9]{15}$/` jeśli niepusty.
  - `gender` zgodny z enumem.
- Obsługa paginacji: blokuj przejście na `< 1` i `> pages`.

## 10. Obsługa błędów
- Format błędów zgodny z `ErrorResponse` (`@types.ts`).
- Scenariusze:
  - `VALIDATION_ERROR` (400) → pokaż listę pól w `ErrorDisplay` lub komunikat pod filtrami.
  - `NOT_FOUND` (404) przy `GET /dogs/{id}` → komunikat i powrót do listy.
  - `CONFLICT` (409) dot. duplikatów (relevant dla tworzenia psa – poza zakresem listy, ale przewidziane na przyszłość).
  - `INTERNAL_ERROR` (5xx) → komunikat ogólny z przyciskiem „Spróbuj ponownie”.
- Timeouts / sieć: retry on demand (`onRetry`).

## 11. Kroki implementacji
1. Routing:
   - Utwórz `src/pages/dogs/index.astro` montujący komponent React `DogsListView` w layoucie głównym.
2. Komponenty:
   - Dodaj katalog `src/components/dogs/`.
   - Zaimplementuj `DogsListView.tsx` (stan, fetch, render, integracja z komponentami wspólnymi z `components/shows/*`).
   - Zaimplementuj `DogFilters.tsx` (search + filtry zgodnie z MVP, bez ras/FCI).
   - Zaimplementuj `DogsTable.tsx` i `DogRow.tsx` (prezentacja wyników i właścicieli).
3. Hook:
   - Dodaj `src/hooks/useDogsCatalog.ts` inspirowany `useOwnersList.ts` (stan, budowa query params, fetch, akcje).
4. Integracja API:
   - W `useDogsCatalog.fetchDogs` wywołuj `GET /api/dogs` z parametrami (`DogQueryParams`).
   - Mapuj odpowiedź do `state.dogs` i `state.pagination`.
5. Walidacja UI:
   - W `DogFilters` zastosuj ograniczenia długości i regex dla chipu, min długość dla search.
6. Błędy i stany:
   - Obsłuż `isLoading` (spinner), brak wyników (EmptyState), błędy (ErrorDisplay z `onRetry`).
7. Paginacja:
   - Użyj `Pagination` z `components/shows/Pagination.tsx` i podłącz `onPageChange` do `updatePagination`.
8. QA/UAT:
   - Sprawdź scenariusze: pusta lista, duża liczba wyników (paginacja), filtry kombinowane, długie wartości pól.
   - Weryfikacja zgodności z PRD i User Stories.

---
- PRD: `@prd-hov.md` (`10x-dog-show/.ai/prd-hov.md`)
- Opis widoku (UI plan): `@ui-plan-hov.md` → sekcja „Dogs List”
- User Stories adresowane: US-003 (Dodawanie psa do systemu – nawigacja z listy), US-009 (Wyszukiwanie psów)
- Endpointy: `@api-plan-hov.md` → Dogs Management
- Implementacja endpointów: `@dogs/index.ts`, `@dogs/[id].ts`
- Typy: `@types.ts`
- Tech Stack: `@tech-stack.md`
