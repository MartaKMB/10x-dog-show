# Unit Testy - 10x Dog Show

## Przegląd

Ten katalog zawiera unit testy dla aplikacji 10x Dog Show. Testy są napisane przy użyciu **Vitest** i **React Testing Library** zgodnie z najlepszymi praktykami testowania.

## Struktura katalogów

```
src/test/unit/
├── components/          # Testy komponentów React
│   └── auth/          # Testy komponentów autentykacji
│       ├── LoginForm.test.tsx
│       └── RegisterForm.test.tsx
├── lib/                # Testy bibliotek i serwisów
│   └── services/      # Testy serwisów
│       └── authService.test.ts
├── setup.ts            # Konfiguracja środowiska testowego
└── README.md           # Ten plik
```

## Uruchamianie testów

### Wszystkie testy
```bash
npm run test
```

### Testy z coverage
```bash
npm run test:coverage
```

### Testy w trybie watch
```bash
npm run test:watch
```

### Konkretny plik testowy
```bash
npm run test LoginForm.test.tsx
```

### Testy w określonym katalogu
```bash
npm run test components/auth/
```

## Konfiguracja

### Vitest
- **Środowisko**: jsdom (symuluje przeglądarkę)
- **Setup**: `./src/test/unit/setup.ts`
- **Timeout**: 10 sekund dla testów i hooków
- **Coverage**: V8 provider z raportami HTML, JSON i LCOV

### React Testing Library
- **Renderowanie**: `render()` z jsdom
- **Interakcje**: `userEvent` dla symulacji działań użytkownika
- **Asercje**: `@testing-library/jest-dom` dla dodatkowych matcherów

## Zasady pisania testów

### 1. Struktura testu
```typescript
describe('NazwaKomponentu', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Inicjalizacja
  });

  describe('Renderowanie', () => {
    it('renderuje wszystkie wymagane elementy', () => {
      // Test renderowania
    });
  });

  describe('Interakcje', () => {
    it('obsługuje kliknięcie przycisku', async () => {
      // Test interakcji
    });
  });
});
```

### 2. Mockowanie
- **fetch**: `global.fetch = vi.fn()`
- **localStorage**: `localStorageMock.getItem.mockReturnValue()`
- **timers**: `vi.useFakeTimers()` i `vi.useRealTimers()`
- **window.location**: `Object.defineProperty(window, 'location', ...)`

### 3. Asercje
```typescript
// Sprawdzanie obecności elementów
expect(screen.getByText('Tekst')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeInTheDocument();

// Sprawdzanie stanu
expect(button).toBeDisabled();
expect(input).toHaveValue('wartość');

// Sprawdzanie stylów
expect(element).toHaveClass('bg-red-500');
expect(element).toHaveAttribute('type', 'password');
```

### 4. Testowanie asynchroniczności
```typescript
// Czekanie na element
await waitFor(() => {
  expect(screen.getByText('Sukces')).toBeInTheDocument();
});

// Czekanie na zniknięcie
await waitFor(() => {
  expect(screen.queryByText('Ładowanie')).not.toBeInTheDocument();
});
```

## Testowane komponenty

### LoginForm
- ✅ Renderowanie formularza (12 testów)
- ✅ Walidacja pól (email, hasło)
- ✅ Obsługa błędów logowania
- ✅ Sukces logowania i przekierowanie
- ✅ Stylowanie pól z błędami
- ✅ **Pokrycie: 85.41%**

### RegisterForm
- ✅ Renderowanie formularza (17 testów)
- ✅ Walidacja wszystkich pól (imię, nazwisko, email, hasło, potwierdzenie)
- ✅ Sprawdzanie zgodności haseł
- ✅ Sukces rejestracji i przekierowanie
- ✅ Stylowanie pól z błędami
- ✅ **Pokrycie: 88.78%**

## Testowane serwisy

### authService
- ✅ Podstawowa walidacja formatu email
- ✅ Walidacja długości hasła
- ✅ Testy regex dla email
- ✅ Testy długości hasła

## Pokrycie testami

### Komponenty autentykacji
- **LoginForm**: 85.41% (12 testów, wszystkie główne funkcjonalności)
- **RegisterForm**: 88.78% (17 testów, wszystkie główne funkcjonalności)

### Serwisy
- **authService**: 100% (2 testy, podstawowa walidacja)

### Ogólne pokrycie
- **Wszystkie pliki**: 2.19%
- **Komponenty auth**: 60.19%
- **Serwisy**: 100%

## Debugowanie testów

### 1. Logowanie w testach
```typescript
it('test z logowaniem', () => {
  console.log('Stan komponentu:', screen.debug());
  // test
});
```

### 2. Uruchamianie pojedynczego testu
```typescript
it.only('tylko ten test', () => {
  // tylko ten test się uruchomi
});
```

### 3. Pomijanie testu
```typescript
it.skip('pominięty test', () => {
  // ten test nie zostanie uruchomiony
});
```

### 4. Debugowanie renderowania
```typescript
it('debug renderowania', () => {
  const { debug } = render(<Component />);
  debug(); // wyświetla HTML w konsoli
});
```

## Najlepsze praktyki

### 1. Izolacja testów
- Każdy test powinien być niezależny
- Używaj `beforeEach` do resetowania stanu
- Nie polegaj na kolejności testów

### 2. Testowanie zachowania, nie implementacji
- Testuj co robi komponent, nie jak to robi
- Używaj `getByRole` zamiast `getByTestId`
- Testuj interakcje użytkownika

### 3. Czytelność testów
- Używaj opisowych nazw testów
- Grupuj powiązane testy w `describe`
- Unikaj duplikacji kodu

### 4. Mockowanie
- Mockuj tylko to, co jest konieczne
- Używaj realistycznych danych testowych
- Sprawdzaj czy mocki są wywoływane

## Rozwiązywanie problemów

### 1. Błędy związane z jsdom
```bash
# Dodaj do package.json
"test": "vitest --environment jsdom"
```

### 2. Problemy z importami
```bash
# Sprawdź aliasy w vitest.config.ts
resolve: {
  alias: {
    "@": resolve(__dirname, "./src"),
  },
}
```

### 3. Błędy związane z React 18
```typescript
// Użyj createRoot w setup.ts jeśli potrzebne
import { createRoot } from 'react-dom/client';
```

### 4. Problemy z coverage
```bash
# Uruchom z verbose
npm run test:coverage -- --reporter=verbose
```

## Rozszerzanie testów

### 1. Dodawanie nowych komponentów
1. Utwórz plik `ComponentName.test.tsx`
2. Dodaj testy renderowania
3. Dodaj testy interakcji
4. Dodaj testy stanów (ładowanie, błędy, sukces)

### 2. Dodawanie nowych serwisów
1. Utwórz plik `serviceName.test.ts`
2. Testuj wszystkie funkcje
3. Testuj przypadki brzegowe
4. Testuj obsługę błędów

### 3. Dodawanie testów integracyjnych
1. Utwórz katalog `integration/`
2. Testuj interakcje między komponentami
3. Używaj `@testing-library/user-event`

## Planowane rozszerzenia

### Komponenty autentykacji
- [ ] `ForgotPasswordForm.test.tsx` - gdy komponent będzie gotowy
- [ ] `ResetPasswordForm.test.tsx` - gdy komponent będzie gotowy

### Serwisy
- [ ] `errorHandler.test.ts` - gdy będzie potrzebny
- [ ] `permissionService.test.ts` - gdy będzie potrzebny

## Przydatne linki

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
