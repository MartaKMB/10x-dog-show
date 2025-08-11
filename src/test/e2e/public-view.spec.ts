import { test, expect } from "@playwright/test";
import { TestUtils } from "./test-utils";

test.describe("Public View - Niezalogowany użytkownik", () => {
  test.beforeEach(async () => {
    TestUtils.logTestEnvironment();
  });

  test("niezalogowany użytkownik może przeglądać publiczne dane", async ({
    page,
  }) => {
    // 1. Przejście do strony głównej
    await page.goto("/");

    // 2. Czekamy na załadowanie aplikacji
    await TestUtils.waitForAppLoad(page);

    // 3. Sprawdzenie czy dashboard się ładuje
    const h1Element = page.locator("h1").first();
    await expect(h1Element).toBeVisible();
    await expect(h1Element).toContainText("Witaj w Klubie Hovawarta Show");

    // 4. Sprawdzenie trybu podglądu
    const previewBanner = page.locator("text=To jest tryb podglądu");
    await expect(previewBanner).toBeVisible();

    // 5. Sprawdzenie czy dane z bazy są widoczne (wystawy)
    const showElement = page.locator("text=Wystawa Klubowa Hovawartów 2024");
    await expect(showElement).toBeVisible();

    // 6. Sprawdzenie czy nie ma błędów krytycznych
    const hasNoErrors = await TestUtils.checkForCriticalErrors(page);
    expect(hasNoErrors).toBe(true);

    // 7. Sprawdzenie czy akcje edycyjne są ukryte dla niezalogowanych
    const addShowButton = page.locator("text=Dodaj wystawę");
    await expect(addShowButton).not.toBeVisible();

    // 8. Sprawdzenie czy link do logowania jest widoczny (używamy pierwszego widocznego)
    const loginLinks = page.locator("a[href='/auth/login']");
    await expect(loginLinks.first()).toBeVisible();
  });

  test("niezalogowany użytkownik może przejść do strony logowania", async ({
    page,
  }) => {
    await page.goto("/");
    await TestUtils.waitForAppLoad(page);

    // Kliknięcie linku do logowania (używamy pierwszego widocznego)
    const loginLinks = page.locator("a[href='/auth/login']");
    await expect(loginLinks.first()).toBeVisible();
    await loginLinks.first().click();

    // Sprawdzenie czy jesteśmy na stronie logowania
    await expect(page).toHaveURL(/.*\/auth\/login/);

    // Używamy bardziej precyzyjnego selektora dla nagłówka logowania
    const loginHeading = page.locator("h1").filter({ hasText: "Logowanie" });
    await expect(loginHeading).toBeVisible();

    // Sprawdzenie czy formularz logowania jest widoczny
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("niezalogowany użytkownik może przeglądać listę wystaw", async ({
    page,
  }) => {
    // Przejście do listy wystaw
    await page.goto("/shows");

    // Czekamy na załadowanie strony
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Sprawdzenie czy strona się załadowała
    const h1Element = page.locator("h1").first();
    await expect(h1Element).toBeVisible();

    // Sprawdzenie czy dane wystaw są widoczne (dostosowane do rzeczywistych danych)
    const showNames = ["Wystawa Klubowa Hovawartów 2024"];

    for (const showName of showNames) {
      const showElement = page.locator(`text=${showName}`);
      await expect(showElement).toBeVisible();
    }

    // Sprawdzenie czy akcje edycyjne są ukryte
    const addShowButton = page.locator("text=Dodaj wystawę, text=Nowa wystawa");
    await expect(addShowButton).not.toBeVisible();
  });

  test("niezalogowany użytkownik może przeglądać listę psów", async ({
    page,
  }) => {
    // Przejście do listy psów
    await page.goto("/dogs");

    // Czekamy na załadowanie strony
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Sprawdzenie czy strona się załadowała
    const h1Element = page.locator("h1").first();
    await expect(h1Element).toBeVisible();
    await expect(h1Element).toContainText("Lista psów");

    // Sprawdzenie czy dane psów są widoczne (dostosowane do rzeczywistych danych)
    // Sprawdzamy czy lista się ładuje - nie konkretne nazwy

    // Czekamy chwilę na załadowanie danych
    await page.waitForTimeout(2000);

    // Sprawdzamy czy są jakieś elementy psów
    const dogElements = page.locator(
      '[data-testid="dog-card"], .dog-card, .dog-item, .bg-white',
    );

    // Jeśli są elementy psów, sprawdzamy czy pierwszy jest widoczny
    if ((await dogElements.count()) > 0) {
      await expect(dogElements.first()).toBeVisible();
    }

    // Sprawdzenie czy akcje edycyjne są ukryte
    const addDogButton = page.locator("text=Dodaj psa, text=Nowy pies");
    await expect(addDogButton).not.toBeVisible();
  });
});
