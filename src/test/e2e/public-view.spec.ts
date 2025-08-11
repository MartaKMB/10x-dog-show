import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";
import { TestUtils } from "./test-utils";

test.describe("Widok publiczny - niezalogowany użytkownik", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    // Logowanie informacji o środowisku
    TestUtils.logTestEnvironment();
  });

  test("niezalogowany użytkownik może przejść do strony głównej", async () => {
    await homePage.gotoHome();

    expect(await homePage.isHomePageLoaded()).toBeTruthy();

    // Sprawdź czy tytuł strony zawiera sensowne informacje
    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(0);

    // Sprawdź czy nie ma błędów
    expect(await homePage.checkForErrors()).toBeTruthy();
  });

  test("niezalogowany użytkownik może przejść do strony logowania", async ({
    page,
  }) => {
    await homePage.gotoHome();
    await homePage.gotoLogin();

    // Sprawdź czy jesteśmy na stronie logowania
    expect(await page.getByText("Zaloguj się").isVisible()).toBeTruthy();
    expect(await page.url()).toContain("/auth/login");
  });

  test("niezalogowany użytkownik może przejść do strony rejestracji", async ({
    page,
  }) => {
    await homePage.gotoHome();
    await homePage.gotoRegister();

    // Sprawdź czy jesteśmy na stronie rejestracji - użyj elastycznego sprawdzenia
    expect(await page.url()).toContain("/auth/signup");

    // Sprawdź czy strona rejestracji się załadowała - różne możliwe teksty
    const possibleRegisterTexts = [
      "Zarejestruj się",
      "Rejestracja",
      "Utwórz konto",
      "Zarejestruj",
      "Rejestracja użytkownika",
    ];

    let foundText = false;
    for (const text of possibleRegisterTexts) {
      try {
        const element = page.getByText(text).first();
        if (await element.isVisible()) {
          foundText = true;
          break;
        }
      } catch {
        // Ignoruj błędy
      }
    }

    expect(foundText).toBeTruthy();
  });

  test("niezalogowany użytkownik może przeglądać listę wystaw", async ({
    page,
  }) => {
    await homePage.gotoHome();
    await homePage.gotoShows();

    // Sprawdź czy lista wystaw jest widoczna - użyj precyzyjnego selektora
    const showsHeading = page.locator("h1").filter({ hasText: "Wystawy" });
    expect(await showsHeading.isVisible()).toBeTruthy();
    expect(await page.url()).toContain("/shows");

    // Sprawdź czy są widoczne wystawy (dane testowe)
    await TestUtils.waitForStableState(page);
    expect(
      await page.getByText("Wystawa Klubowa Hovawartów 2024").isVisible(),
    ).toBeTruthy();
  });

  test("niezalogowany użytkownik może przeglądać listę psów", async ({
    page,
  }) => {
    await homePage.gotoHome();
    await homePage.gotoDogs();

    // Sprawdź czy lista psów jest widoczna - użyj precyzyjnego selektora
    const dogsHeading = page.locator("h1").filter({ hasText: "Lista psów" });
    expect(await dogsHeading.isVisible()).toBeTruthy();
    expect(await page.url()).toContain("/dogs");

    // Sprawdź czy strona psów się załadowała i ma dane testowe
    await TestUtils.waitForStableState(page);

    // Sprawdź czy są widoczne psy z danych testowych
    expect(
      await page.getByText("Hovawart z Przykładu").isVisible(),
    ).toBeTruthy();

    // Sprawdź czy nie ma błędów na stronie
    expect(await homePage.checkForErrors()).toBeTruthy();
  });

  test("niezalogowany użytkownik nie może dodawać nowych elementów", async ({
    page,
  }) => {
    // Sprawdź na stronie głównej - przyciski dodawania powinny być ukryte
    await homePage.gotoHome();

    // Sprawdź czy nie ma przycisków dodawania (ukryte dla niezalogowanych)
    const addButtons = page.locator(
      'button:has-text("Dodaj"), a:has-text("Dodaj")',
    );
    expect(await addButtons.count()).toBe(0);

    // Sprawdź na liście wystaw
    await homePage.gotoShows();
    const addShowButtons = page.locator(
      'button:has-text("Dodaj wystawę"), a:has-text("Dodaj wystawę")',
    );
    expect(await addShowButtons.count()).toBe(0);

    // Sprawdź na liście psów
    await homePage.gotoDogs();
    const addDogButtons = page.locator(
      'button:has-text("Dodaj psa"), a:has-text("Dodaj psa")',
    );
    expect(await addDogButtons.count()).toBe(0);
  });

  test("strona główna jest w pełni dostępna publicznie", async () => {
    await homePage.gotoHome();

    // Sprawdź wszystkie aspekty dostępności publicznej
    expect(await homePage.isPubliclyAccessible()).toBeTruthy();

    // Sprawdź czy linki nawigacyjne są widoczne
    expect(await homePage.areNavigationLinksVisible()).toBeTruthy();

    // Sprawdź czy informacja o dostępie publicznym jest widoczna
    expect(await homePage.isPublicAccessInfoVisible()).toBeTruthy();
  });
});
