# End-to-End Testy - 10x Dog Show

## Przegląd

Ten katalog zawiera end-to-end (E2E) testy dla aplikacji 10x Dog Show. Testy są napisane przy użyciu **Playwright** i symulują rzeczywiste interakcje użytkownika w przeglądarce, testując pełne przepływy aplikacji.

## 🚀 Nowe ulepszenia (2024)

### ✅ **Zaimplementowane najlepsze praktyki:**

1. **Hybrydowe podejście środowiskowe**
   - Development: Lokalne Supabase
   - Testy: Dedykowana baza testowa + projekt chmurowy
   - Staging/Produkcja: Projekty chmurowe

2. **Page Object Model (POM)**
   - `BasePage` - bazowa klasa dla wszystkich stron
   - `HomePage` - przykład implementacji POM
   - Centralne selektory w `selectors.ts`

3. **Centralne zarządzanie selektorami**
   - Wszystkie selektory w jednym pliku
   - Hierarchiczna organizacja
   - Funkcje pomocnicze do tworzenia selektorów

4. **Ulepszona konfiguracja**
   - Obsługa `.env.test` przez `dotenv`
   - Skrypt `dev:e2e` dla trybu testowego
   - Lepsze zarządzanie środowiskami

## 🎯 Implementacja selektorów testowych

### Zasady implementacji

#### 1. **Selektory wewnątrz komponentów (NIE na zewnątrz)**

**✅ DOBRZE - selektor w komponencie:**
```tsx
// Topbar.tsx
return (
  <header data-testid="topbar">
    <nav data-testid="navigation">
      <a href="/auth/login" data-testid="login-link">Zaloguj</a>
      <a href="/auth/register" data-testid="register-link">Zarejestruj</a>
    </nav>
  </header>
);
```

**❌ ŹLE - selektor w komponencie nadrzędnym:**
```tsx
// Layout.tsx
<Topbar client:load data-testid="topbar" />
```

#### 2. **Hierarchia selektorów**

Używaj hierarchicznych selektorów dla lepszej organizacji:

```tsx
// Komponent formularza
<form data-testid="dog-form">
  <input 
    type="text" 
    data-testid="dog-form-name-input"
    placeholder="Nazwa psa"
  />
  <select data-testid="dog-form-breed-select">
    <option value="">Wybierz rasę</option>
  </select>
  <button type="submit" data-testid="dog-form-save-button">
    Zapisz
  </button>
</form>
```

#### 3. **Nazewnictwo selektorów**

Używaj konwencji: `[komponent]-[element]-[typ]`

```tsx
// Przykłady:
data-testid="show-card-title"
data-testid="dog-form-breed-select"
data-testid="owner-table-edit-button"
data-testid="auth-login-submit-button"
```

### Implementacja w komponentach

#### Komponenty React

```tsx
// LoginForm.tsx
export function LoginForm() {
  return (
    <form data-testid="auth-login-form">
      <h1 data-testid="auth-login-title">Zaloguj się</h1>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          data-testid="auth-login-email-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          type="password"
          data-testid="auth-login-password-input"
          required
        />
      </div>
      
      <button type="submit" data-testid="auth-login-submit-button">
        Zaloguj
      </button>
      
      <a href="/auth/forgot-password" data-testid="auth-login-forgot-password-link">
        Zapomniałeś hasła?
      </a>
    </form>
  );
}
```

#### Strony Astro

```astro
---
// pages/shows/index.astro
import ShowsListView from '../../components/shows/ShowsListView.astro';
---

<main data-testid="shows-page">
  <h1 data-testid="shows-page-title">Wystawy</h1>
  
  <div data-testid="shows-page-actions">
    <a href="/shows/new" data-testid="shows-page-add-button">
      Dodaj wystawę
    </a>
  </div>
  
  <ShowsListView />
</main>
```

### Aktualizacja centralnych selektorów

Po dodaniu nowych selektorów, zaktualizuj plik `selectors.ts`:

```typescript
// selectors.ts
export const TestSelectors = {
  // ... istniejące selektory ...
  
  // Nowe selektory
  shows: {
    pageTitle: '[data-testid="shows-page-title"]',
    addButton: '[data-testid="shows-page-add-button"]',
    showCard: '[data-testid="show-card"]',
    showTitle: '[data-testid="show-card-title"]',
    showDate: '[data-testid="show-card-date"]',
    showStatus: '[data-testid="show-card-status"]',
  },
  
  // ... więcej selektorów ...
};
```

### Testowanie selektorów

#### 1. **Sprawdzenie widoczności**

```typescript
// W testach
test("formularz logowania jest widoczny", async ({ page }) => {
  await page.goto("/auth/login");
  
  // Sprawdź czy wszystkie elementy są widoczne
  await expect(page.locator('[data-testid="auth-login-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="auth-login-email-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="auth-login-password-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="auth-login-submit-button"]')).toBeVisible();
});
```

#### 2. **Interakcje z elementami**

```typescript
// Wypełnianie formularza
await page.locator('[data-testid="auth-login-email-input"]').fill("test@example.com");
await page.locator('[data-testid="auth-login-password-input"]').fill("password123");
await page.locator('[data-testid="auth-login-submit-button"]').click();
```

### Najlepsze praktyki dla selektorów

#### 1. **Stabilność**

- Używaj `data-testid` zamiast klas CSS
- Unikaj selektorów zależnych od struktury DOM
- Nie używaj selektorów zależnych od tekstu (chyba że to konieczne)

#### 2. **Organizacja**

- Grupuj selektory według funkcjonalności
- Używaj spójnego nazewnictwa
- Dokumentuj złożone selektory

#### 3. **Wydajność**

- Unikaj zbyt głębokich selektorów
- Używaj precyzyjnych selektorów
- Testuj selektory pod kątem wydajności

### Przykłady implementacji

#### Komponent tabeli

```tsx
// DogsTable.tsx
export function DogsTable({ dogs }: { dogs: Dog[] }) {
  return (
    <div data-testid="dogs-table-container">
      <table data-testid="dogs-table">
        <thead>
          <tr>
            <th data-testid="dogs-table-header-name">Nazwa</th>
            <th data-testid="dogs-table-header-breed">Rasa</th>
            <th data-testid="dogs-table-header-actions">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {dogs.map((dog) => (
            <tr key={dog.id} data-testid={`dogs-table-row-${dog.id}`}>
              <td data-testid={`dogs-table-cell-name-${dog.id}`}>
                {dog.name}
              </td>
              <td data-testid={`dogs-table-cell-breed-${dog.id}`}>
                {dog.breed}
              </td>
              <td data-testid={`dogs-table-cell-actions-${dog.id}`}>
                <button data-testid={`dogs-table-edit-button-${dog.id}`}>
                  Edytuj
                </button>
                <button data-testid={`dogs-table-delete-button-${dog.id}`}>
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Komponent modalny

```tsx
// ConfirmDialog.tsx
export function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message 
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  return (
    <div data-testid="confirm-dialog-overlay">
      <div data-testid="confirm-dialog">
        <h2 data-testid="confirm-dialog-title">{title}</h2>
        <p data-testid="confirm-dialog-message">{message}</p>
        
        <div data-testid="confirm-dialog-actions">
          <button 
            onClick={onCancel}
            data-testid="confirm-dialog-cancel-button"
          >
            Anuluj
          </button>
          <button 
            onClick={onConfirm}
            data-testid="confirm-dialog-confirm-button"
          >
            Potwierdź
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Debugowanie selektorów

#### 1. **Sprawdzenie w DevTools**

```typescript
// W konsoli przeglądarki
document.querySelector('[data-testid="auth-login-form"]')
```

#### 2. **Testowanie selektorów**

```typescript
// W testach Playwright
test("sprawdź selektory", async ({ page }) => {
  await page.goto("/auth/login");
  
  // Sprawdź czy selektor istnieje
  const form = page.locator('[data-testid="auth-login-form"]');
  console.log("Form count:", await form.count());
  
  // Sprawdź czy element jest widoczny
  console.log("Form visible:", await form.isVisible());
});
```

## Struktura katalogów

```
src/test/e2e/
├── page-objects/           # Page Object Model
│   ├── BasePage.ts         # Bazowa klasa dla wszystkich stron
│   └── HomePage.ts         # Page Object dla strony głównej
├── cloud-connection.spec.ts    # Testy połączenia z chmurą
├── public-view.spec.ts         # Testy widoku publicznego (niezalogowany użytkownik)
├── global-setup.ts             # Globalna konfiguracja przed testami
├── global-teardown.ts          # Globalne czyszczenie po testach
├── test-utils.ts               # Narzędzia pomocnicze dla testów
├── selectors.ts                # Centralne selektory testowe
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

### **NOWY: Uruchomienie aplikacji w trybie testowym**
```bash
npm run dev:e2e
```

## Konfiguracja środowiska testowego

### 1. **Baza testowa (ZALECANE)**

Dla izolowanych i przewidywalnych testów używamy dedykowanej bazy testowej:

```bash
# Uruchom dedykowaną bazę testową
./scripts/start-test-db.sh

# Uruchom aplikację w trybie testowym
npm run dev:e2e

# Uruchom testy z bazą testową
npm run test:e2e:test
```

**Zalety bazy testowej:**
- Izolacja od danych deweloperskich
- Przewidywalny stan danych
- Możliwość resetowania przed każdym uruchomieniem
- Brak konfliktów z innymi środowiskami

### 2. **Baza lokalna (development)**

```bash
# Uruchom lokalną bazę Supabase
supabase start

# Uruchom aplikację
npm run dev

# Uruchom testy
npm run test:e2e
```

### 3. **Baza chmurowa (produkcja)**

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
NODE_ENV=test
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
TEST_BASE_URL=http://localhost:3000
SUPABASE_DB_PORT=54323

# Dane testowe
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
TEST_USER_ID=00000000-0000-0000-0000-000000000001
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

## 🏗️ Page Object Model (POM)

### Struktura POM

```typescript
// Przykład użycia w testach
import { HomePage } from "./page-objects/HomePage";

test.describe("Widok publiczny", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test("strona główna jest dostępna", async ({ page }) => {
    await homePage.gotoHome();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });
});
```

### Korzyści POM

- **Ponowne użycie**: Logika nawigacji w jednym miejscu
- **Łatwość utrzymania**: Zmiany w UI wymagają aktualizacji tylko POM
- **Czytelność**: Testy są bardziej zrozumiałe
- **Stabilność**: Lepsze zarządzanie selektorami

## 🎯 Centralne selektory

### Organizacja selektorów

```typescript
// selectors.ts
export const TestSelectors = {
  navigation: {
    loginLink: '[data-testid="login-link"]',
    registerLink: '[data-testid="register-link"]',
  },
  auth: {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
  },
  // ... więcej kategorii
};
```

### Użycie w Page Objects

```typescript
// HomePage.ts
private readonly selectors = {
  loginLink: TestSelectors.navigation.loginLink,
  // ... więcej selektorów
};
```

## Zasady pisania testów E2E

### 1. **Struktura testu**
```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test.describe('Nazwa funkcjonalności', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('opis testu', async ({ page }) => {
    // Przygotowanie
    await homePage.gotoHome();
    
    // Działanie
    await homePage.gotoLogin();
    
    // Sprawdzenie
    await expect(page.getByText('Zaloguj się')).toBeVisible();
  });
});
```

### 2. **Lokatory (Selectors)**

**Preferowane lokatory (w kolejności):**
```typescript
// 1. data-testid (najbardziej stabilne)
await page.locator('[data-testid="login-button"]').click();

// 2. Role + accessible name
await page.getByRole('button', { name: 'Zapisz' }).click();

// 3. Text content
await page.getByText('Wystawa Klubowa').click();

// 4. Placeholder
await page.getByPlaceholder('Wprowadź nazwę').fill('Nazwa');
```

**Unikaj:**
```typescript
// ❌ Zbyt ogólne
await page.locator('div').click();

// ❌ Zależne od struktury DOM
await page.locator('body > div > div > button').click();
```

### 3. **Czekanie na elementy**

```typescript
// Czekanie na załadowanie strony
await page.waitForLoadState('networkidle');

// Czekanie na konkretny element
await page.waitForSelector('[data-testid="dog-card"]', { timeout: 10000 });

// Czekanie na tekst
await expect(page.locator('h1')).toContainText('Oczekiwany tekst');

// Czekanie na zniknięcie
await expect(page.locator('.loading')).not.toBeVisible();
```

### 4. **Obsługa asynchroniczności**

```typescript
// Czekanie na API call
await page.waitForResponse(response => 
  response.url().includes('/api/shows') && response.status() === 200
);

// Czekanie na timeout (ostateczność)
await page.waitForTimeout(2000);
```

## Testowane funkcjonalności

### 1. **Widok publiczny (niezalogowany użytkownik)**

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

### 2. **Połączenie z chmurą**

**Testy podstawowe:**
- Sprawdzenie dostępności dashboardu
- Weryfikacja połączenia z bazą chmurową

## Narzędzia pomocnicze

### TestUtils

Plik `test-utils.ts` zawiera funkcje pomocnicze:

```typescript
import { TestUtils } from './test-utils';

// Sprawdzenie środowiska testowego
TestUtils.logTestEnvironment();

// Czekanie na załadowanie aplikacji
await TestUtils.waitForAppLoad(page);

// Sprawdzenie błędów
await TestUtils.checkForCriticalErrors(page);

// Sprawdzenie połączenia z chmurą
await TestUtils.checkCloudConnection(page);

// Pobranie danych testowych
const credentials = TestUtils.getTestUserCredentials();
const testIds = TestUtils.getTestDataIds();
```

### Global Setup/Teardown

- **global-setup.ts**: Sprawdza dostępność aplikacji przed testami
- **global-teardown.ts**: Miejsce na czyszczenie po testach

## Rozwiązywanie problemów

### 1. **Błędy "strict mode violation"**

```typescript
// ❌ Problem: wiele elementów pasuje do selektora
await page.locator('a[href="/auth/login"]').click();

// ✅ Rozwiązanie: użyj data-testid
await page.locator('[data-testid="login-link"]').click();

// ✅ Lepsze: użyj Page Object
await homePage.gotoLogin();
```

### 2. **Timeouty na elementy**

```typescript
// ❌ Problem: element nie jest widoczny
await expect(page.locator('.dog-card')).toBeVisible();

// ✅ Rozwiązanie: czekaj na załadowanie danych
await TestUtils.waitForStableState(page);
await expect(page.locator('[data-testid="dog-card"]')).toBeVisible();
```

### 3. **Problemy z bazą danych**

```bash
# Resetuj bazę testową
supabase db reset --config-file=supabase.test.toml

# Sprawdź status bazy
supabase status --config-file=supabase.test.toml

# Uruchom ponownie
./scripts/start-test-db.sh
```

### 4. **Konflikty portów**

```bash
# Sprawdź zajęte porty
lsof -i :54321
lsof -i :54323

# Zatrzymaj wszystkie instancje Supabase
supabase stop
supabase stop --config-file=supabase.test.toml
```

## Najlepsze praktyki

### 1. **Izolacja testów**
- Każdy test powinien być niezależny
- Używaj `test.beforeEach()` do resetowania stanu
- Nie polegaj na kolejności testów

### 2. **Stabilność testów**
- Czekaj na stabilny stan aplikacji
- Używaj `TestUtils.waitForStableState()`
- Dodaj timeouty dla wolniejszych operacji

### 3. **Czytelność testów**
- Używaj opisowych nazw testów w języku polskim
- Grupuj powiązane testy w `test.describe()`
- Używaj Page Objects dla lepszej organizacji

### 4. **Obsługa błędów**
- Używaj `TestUtils` do sprawdzania błędów
- Rob zrzuty ekranu w przypadku niepowodzenia
- Loguj informacje diagnostyczne

### 5. **Selektory testowe**
- Używaj `data-testid` zamiast klas CSS
- Dodawaj selektory wewnątrz komponentów
- Aktualizuj centralne selektory w `selectors.ts`

## Debugowanie testów

### 1. **Tryb debug**
```bash
npm run test:e2e:debug
```

### 2. **Zrzuty ekranu**
```typescript
// Automatyczny zrzut w przypadku błędu
await page.screenshot({ path: 'debug-screenshot.png' });

// Zrzut przez Page Object
await homePage.takeScreenshot('nazwa-testu');
```

### 3. **Logowanie**
```typescript
// Logowanie do konsoli
console.log('Stan aplikacji:', await page.title());

// Logowanie do Playwright
test.info().annotations.push({
  type: 'info',
  description: 'Wartość zmiennej: ' + value
});
```

### 4. **Tryb headed**
```typescript
// W playwright.config.ts
use: {
  headless: false, // Widoczne okno przeglądarki
  slowMo: 1000,   // Zwolnienie animacji
}
```

## Rozszerzanie testów

### 1. **Dodawanie nowych testów funkcjonalności**

1. Utwórz plik `nazwa-funkcjonalnosci.spec.ts`
2. Dodaj testy dla wszystkich scenariuszy
3. Uwzględnij przypadki brzegowe i błędy
4. Dodaj testy do odpowiedniego projektu w `playwright.config.ts`

### 2. **Dodawanie testów autoryzacji**

1. Utwórz plik `auth-flow.spec.ts`
2. Testuj pełne przepływy logowania/rejestracji
3. Testuj obsługę błędów autoryzacji
4. Testuj przekierowania i sesje

### 3. **Dodawanie testów CRUD**

1. Utwórz plik `crud-operations.spec.ts`
2. Testuj tworzenie, edycję, usuwanie elementów
3. Testuj walidację formularzy
4. Testuj obsługę błędów API

### 4. **Dodawanie nowych Page Objects**

1. Utwórz plik `NazwaStrony.ts` w `page-objects/`
2. Rozszerz `BasePage`
3. Dodaj selektory do `selectors.ts`
4. Zaimplementuj metody nawigacji i sprawdzania

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
- [Page Object Model](https://playwright.dev/docs/pom)

## Status testów

**Ostatnie uruchomienie: ✅ 7/7 testów przeszło**

- **Widok publiczny**: 7/7 ✅
- **Połączenie z chmurą**: W trakcie implementacji
- **Autoryzacja**: Planowane
- **Operacje CRUD**: Planowane

**Pokrycie funkcjonalności: ~25% (MVP)**

## 🎯 Następne kroki

1. **Implementacja selektorów** w komponentach zgodnie z sekcją "Implementacja selektorów testowych"
2. **Rozszerzenie Page Objects** o kolejne strony
3. **Dodanie testów autoryzacji** z użyciem danych testowych
4. **Implementacja testów CRUD** dla głównych funkcjonalności
5. **Dodanie testów wydajnościowych** i dostępności
