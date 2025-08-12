/* eslint-disable no-console */
import { test, expect } from "@playwright/test";
import { TestUtils } from "./test-utils";

test.describe("Cloud Connection Tests", () => {
  test.beforeEach(async () => {
    TestUtils.logTestEnvironment();
  });

  test("should connect to Supabase cloud successfully", async ({ page }) => {
    console.log("🧪 Testing cloud connection...");

    // Przejście do strony głównej
    await page.goto("/");

    // Czekamy na załadowanie aplikacji
    await TestUtils.waitForAppLoad(page);

    // Sprawdzenie czy strona się załadowała
    await expect(page).toHaveTitle(/Dashboard|Witaj w Klubie Hovawarta Show/);

    // Sprawdzenie połączenia z chmurą
    const isConnected = await TestUtils.checkCloudConnection(page);
    expect(isConnected).toBe(true);

    // Sprawdzenie czy nie ma błędów krytycznych
    const hasNoErrors = await TestUtils.checkForCriticalErrors(page);
    expect(hasNoErrors).toBe(true);

    console.log("✅ Cloud connection successful");
  });

  test("should display dashboard content from cloud database", async ({
    page,
  }) => {
    console.log("🧪 Testing dashboard content from cloud...");

    await page.goto("/");

    // Czekamy na załadowanie aplikacji
    await TestUtils.waitForAppLoad(page);

    // Sprawdzenie czy dashboard się załadował
    const h1Element = page.locator("h1").first();
    await expect(h1Element).toBeVisible();

    const titleText = await h1Element.textContent();
    console.log(`📄 Dashboard title: ${titleText}`);

    // Sprawdzenie czy nie ma komunikatów o błędach połączenia
    const errorMessages = page.locator('[data-testid="error"], .error, .alert');
    await expect(errorMessages).toHaveCount(0);

    // Sprawdzenie czy nie ma błędów krytycznych
    const hasNoErrors = await TestUtils.checkForCriticalErrors(page);
    expect(hasNoErrors).toBe(true);

    console.log("✅ Dashboard loaded successfully from cloud");
  });

  test("should handle cloud environment configuration correctly", async ({
    page,
  }) => {
    console.log("🧪 Testing cloud environment configuration...");

    // Sprawdzenie konfiguracji środowiska
    const isCloud = TestUtils.isCloudEnvironment();
    console.log(`🌍 Is cloud environment: ${isCloud}`);

    if (isCloud) {
      // W środowisku chmurowym sprawdzamy czy mamy odpowiednie zmienne
      expect(process.env.VITE_SUPABASE_URL_CLOUD).toBeDefined();
      expect(process.env.VITE_SUPABASE_ANON_KEY_CLOUD).toBeDefined();
    }

    await page.goto("/");
    await TestUtils.waitForAppLoad(page);

    // Sprawdzenie czy aplikacja działa poprawnie
    const h1Element = page.locator("h1").first();
    await expect(h1Element).toBeVisible();

    console.log("✅ Environment configuration is correct");
  });
});
