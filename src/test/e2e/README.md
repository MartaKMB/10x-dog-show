# End-to-End Testy - 10x Dog Show

## Przegląd

Ten katalog zawiera end-to-end (E2E) testy dla aplikacji 10x Dog Show. Testy są napisane przy użyciu **Playwright** i symulują rzeczywiste interakcje użytkownika w przeglądarce, testując pełne przepływy aplikacji.

## Struktura katalogów

```
src/test/e2e/
├── cloud-connection.spec.ts    # Testy połączenia z chmurą
├── public-view.spec.ts         # Testy widoku publicznego (niezalogowany użytkownik)
├── global-setup.ts             # Globalna konfiguracja przed testami
├── global-teardown.ts          # Globalne czyszczenie po testach
├── test-utils.ts               # Narzędzia pomocnicze dla testów
└── README.md                   # Ten plik
```

## Uruchamianie testów

### Wszystkie testy E2E
```bash
npm run test:e2e
```

### Testy z dedykowaną bazą testową
```bash
npm run test:e2e:test
```

### Testy z interfejsem UI
```bash
npm run test:e2e:ui
```

### Testy w trybie debug
```bash
npm run test:e2e:debug
```

### Testy przeciwko chmurze
```bash
npm run test:e2e:cloud
```

## Konfiguracja środowiska testowego

### 1. Baza testowa (zalecane)

Dla izolowanych i przewidywalnych testów używamy dedykowanej bazy testowej:

```bash
# Uruchom dedykowaną bazę testową
./scripts/start-test-db.sh

# Uruchom testy z bazą testową
npm run test:e2e:test
```

**Zalety bazy testowej:**
- Izolacja od danych deweloperskich
- Przewidywalny stan danych
- Możliwość resetowania przed każdym uruchomieniem
- Brak konfliktów z innymi środowiskami

### 2. Baza lokalna (development)

```bash
# Uruchom lokalną bazę Supabase
supabase start

# Uruchom testy
npm run test:e2e
```

### 3. Baza chmurowa (produkcja)

```bash
# Ustaw zmienne środowiskowe dla chmury
export VITE_SUPABASE_URL_CLOUD="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY_CLOUD="your-anon-key"

# Uruchom testy przeciwko chmurze
npm run test:e2e:cloud
```

## Konfiguracja Playwright

### Projekty testowe

Plik `playwright.config.ts` definiuje 3 projekty:

1. **chromium** - domyślny, używa lokalnej bazy
2. **test** - dedykowana baza testowa (port 54323)
3. **cloud** - baza chmurowa

### Zmienne środowiskowe

#### Dla bazy testowej (.env.test)
```bash
TEST_ENVIRONMENT=test
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
TEST_BASE_URL=http://localhost:3000
SUPABASE_DB_PORT=54323
```

#### Dla bazy lokalnej (.env)
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

#### Dla bazy chmurowej
```bash
VITE_SUPABASE_URL_CLOUD=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY_CLOUD=your-cloud-anon-key
```

## Zasady pisania testów E2E

### 1. Struktura testu
```typescript
import { test, expect } from '@playwright/test';

test.describe('Nazwa funkcjonalności', () => {
  test('opis testu', async ({ page }) => {
    // Przygotowanie
    await page.goto('/url');
    
    // Działanie
    await page.click('button');
    
    // Sprawdzenie
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 2. Lokatory (Selectors)

**Preferowane lokatory (w kolejności):**
```typescript
// 1. Role + accessible name
await page.getByRole('button', { name: 'Zapisz' }).click();

// 2. Text content
await page.getByText('Wystawa Klubowa').click();

// 3. Placeholder
await page.getByPlaceholder('Wprowadź nazwę').fill('Nazwa');

// 4. Data attributes (gdy inne nie działają)
await page.locator('[data-testid="dog-card"]').click();
```

**Unikaj:**
```typescript
// ❌ Zbyt ogólne
await page.locator('div').click();

// ❌ Zależne od struktury DOM
await page.locator('body > div > div > button').click();
```

### 3. Czekanie na elementy

```typescript
// Czekanie na załadowanie strony
await page.waitForLoadState('networkidle');

// Czekanie na konkretny element
await page.waitForSelector('h1', { timeout: 10000 });

// Czekanie na tekst
await expect(page.locator('h1')).toContainText('Oczekiwany tekst');

// Czekanie na zniknięcie
await expect(page.locator('.loading')).not.toBeVisible();
```

### 4. Obsługa asynchroniczności

```typescript
// Czekanie na API call
await page.waitForResponse(response => 
  response.url().includes('/api/shows') && response.status() === 200
);

// Czekanie na timeout (ostateczność)
await page.waitForTimeout(2000);
```

## Testowane funkcjonalności

### 1. Widok publiczny (niezalogowany użytkownik)

#### ✅ Testy przechodzące (7/7)

**Nawigacja i dostępność:**
- `niezalogowany użytkownik może przejść do strony głównej`
- `niezalogowany użytkownik może przejść do strony logowania`
- `niezalogowany użytkownik może przejść do strony rejestracji`

**Przeglądanie list:**
- `niezalogowany użytkownik może przeglądać listę wystaw`
- `niezalogowany użytkownik może przeglądać listę psów`
- `niezalogowany użytkownik może przeglądać listę właścicieli`

**Bezpieczeństwo:**
- `niezalogowany użytkownik nie może dodawać nowych elementów`

#### 🔧 Dostosowania do rzeczywistych danych

Testy są dostosowane do rzeczywistej zawartości bazy testowej:
- **Wystawy**: 1 wystawa ("Wystawa Klubowa Hovawartów 2024")
- **Psy**: 2 psy (sprawdzanie obecności elementów)
- **Właściciele**: 1 właściciel (sprawdzanie obecności elementów)

### 2. Połączenie z chmurą

**Testy podstawowe:**
- Sprawdzenie dostępności dashboardu
- Weryfikacja połączenia z bazą chmurową

## Narzędzia pomocnicze

### TestUtils

Plik `test-utils.ts` zawiera funkcje pomocnicze:

```typescript
import { checkEnvironment } from './test-utils';

// Sprawdzenie środowiska testowego
await checkEnvironment(page);

// Czekanie na załadowanie aplikacji
await waitForAppLoad(page);

// Sprawdzenie błędów
await checkForErrors(page);

// Zrzut ekranu w przypadku błędu
await takeScreenshotOnError(page, 'nazwa-testu');
```

### Global Setup/Teardown

- **global-setup.ts**: Sprawdza dostępność aplikacji przed testami
- **global-teardown.ts**: Miejsce na czyszczenie po testach

## Rozwiązywanie problemów

### 1. Błędy "strict mode violation"

```typescript
// ❌ Problem: wiele elementów pasuje do selektora
await page.locator('a[href="/auth/login"]').click();

// ✅ Rozwiązanie: wybierz pierwszy element
await page.locator('a[href="/auth/login"]').first().click();

// ✅ Lepsze: użyj bardziej precyzyjnego selektora
await page.locator('a[href="/auth/login"]').filter({ hasText: 'Zaloguj' }).click();
```

### 2. Timeouty na elementy

```typescript
// ❌ Problem: element nie jest widoczny
await expect(page.locator('.dog-card')).toBeVisible();

// ✅ Rozwiązanie: czekaj na załadowanie danych
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000); // dla wolniejszych API
await expect(page.locator('.dog-card')).toBeVisible();
```

### 3. Problemy z bazą danych

```bash
# Resetuj bazę testową
supabase db reset --config-file=supabase.test.toml

# Sprawdź status bazy
supabase status --config-file=supabase.test.toml

# Uruchom ponownie
./scripts/start-test-db.sh
```

### 4. Konflikty portów

```bash
# Sprawdź zajęte porty
lsof -i :54321
lsof -i :54323

# Zatrzymaj wszystkie instancje Supabase
supabase stop
supabase stop --config-file=supabase.test.toml
```

## Najlepsze praktyki

### 1. Izolacja testów
- Każdy test powinien być niezależny
- Używaj `test.beforeEach()` do resetowania stanu
- Nie polegaj na kolejności testów

### 2. Stabilność testów
- Czekaj na stabilny stan aplikacji
- Używaj `waitForLoadState('networkidle')`
- Dodaj timeouty dla wolniejszych operacji

### 3. Czytelność testów
- Używaj opisowych nazw testów w języku polskim
- Grupuj powiązane testy w `test.describe()`
- Dodawaj komentarze wyjaśniające skomplikowane kroki

### 4. Obsługa błędów
- Używaj `test-utils.ts` do sprawdzania błędów
- Rob zrzuty ekranu w przypadku niepowodzenia
- Loguj informacje diagnostyczne

## Debugowanie testów

### 1. Tryb debug
```bash
npm run test:e2e:debug
```

### 2. Zrzuty ekranu
```typescript
// Automatyczny zrzut w przypadku błędu
await takeScreenshotOnError(page, 'nazwa-testu');

// Ręczny zrzut
await page.screenshot({ path: 'debug-screenshot.png' });
```

### 3. Logowanie
```typescript
// Logowanie do konsoli
console.log('Stan aplikacji:', await page.title());

// Logowanie do Playwright
test.info().annotations.push({
  type: 'info',
  description: 'Wartość zmiennej: ' + value
});
```

### 4. Tryb headed
```typescript
// W playwright.config.ts
use: {
  headless: false, // Widoczne okno przeglądarki
  slowMo: 1000,   // Zwolnienie animacji
}
```

## Rozszerzanie testów

### 1. Dodawanie nowych testów funkcjonalności

1. Utwórz plik `nazwa-funkcjonalnosci.spec.ts`
2. Dodaj testy dla wszystkich scenariuszy
3. Uwzględnij przypadki brzegowe i błędy
4. Dodaj testy do odpowiedniego projektu w `playwright.config.ts`

### 2. Dodawanie testów autoryzacji

1. Utwórz plik `auth-flow.spec.ts`
2. Testuj pełne przepływy logowania/rejestracji
3. Testuj obsługę błędów autoryzacji
4. Testuj przekierowania i sesje

### 3. Dodawanie testów CRUD

1. Utwórz plik `crud-operations.spec.ts`
2. Testuj tworzenie, edycję, usuwanie elementów
3. Testuj walidację formularzy
4. Testuj obsługę błędów API

## Planowane rozszerzenia

### Funkcjonalności podstawowe
- [ ] `auth-flow.spec.ts` - pełne przepływy autoryzacji
- [ ] `crud-operations.spec.ts` - operacje CRUD dla psów, wystaw, właścicieli
- [ ] `form-validation.spec.ts` - walidacja formularzy
- [ ] `navigation.spec.ts` - nawigacja między stronami

### Funkcjonalności zaawansowane
- [ ] `evaluation-system.spec.ts` - system oceniania psów
- [ ] `registration-flow.spec.ts` - przepływ rejestracji na wystawy
- [ ] `statistics.spec.ts` - statystyki i raporty
- [ ] `mobile-responsive.spec.ts` - responsywność na urządzeniach mobilnych

### Testy wydajnościowe
- [ ] `performance.spec.ts` - czasy ładowania stron
- [ ] `memory-leaks.spec.ts` - wycieki pamięci
- [ ] `database-performance.spec.ts` - wydajność zapytań

## Konfiguracja CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e:test
  env:
    TEST_ENVIRONMENT: test
    SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
```

### Docker

```dockerfile
# Uruchomienie bazy testowej w Docker
FROM supabase/postgres:15
ENV POSTGRES_DB=test_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
```

## Przydatne linki

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Supabase Testing](https://supabase.com/docs/guides/testing)

## Status testów

**Ostatnie uruchomienie: ✅ 7/7 testów przeszło**

- **Widok publiczny**: 7/7 ✅
- **Połączenie z chmurą**: W trakcie implementacji
- **Autoryzacja**: Planowane
- **Operacje CRUD**: Planowane

**Pokrycie funkcjonalności: ~25% (MVP)**
