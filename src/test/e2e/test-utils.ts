/* eslint-disable no-console */
import type { Page } from "@playwright/test";

/**
 * Narzędzia pomocnicze dla testów e2e z chmurą Supabase
 */
export const TestUtils = {
  /**
   * Pobiera informacje o środowisku testowym
   */
  getTestEnvironment(): string {
    return process.env.TEST_ENVIRONMENT || "local";
  },

  /**
   * Sprawdza czy testy są uruchamiane w środowisku chmurowym
   */
  isCloudEnvironment(): boolean {
    return this.getTestEnvironment() === "cloud";
  },

  /**
   * Sprawdza czy testy są uruchamiane w dedykowanym środowisku testowym
   */
  isTestEnvironment(): boolean {
    return this.getTestEnvironment() === "test";
  },

  /**
   * Pobiera dane testowego użytkownika
   */
  getTestUserCredentials() {
    return {
      email: process.env.TEST_USER_EMAIL || "test@example.com",
      password: process.env.TEST_USER_PASSWORD || "testpassword123",
      id: process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000001",
    };
  },

  /**
   * Pobiera ID testowych danych
   */
  getTestDataIds() {
    return {
      showId:
        process.env.TEST_SHOW_ID || "550e8400-e29b-41d4-a716-446655440001",
      dogId: process.env.TEST_DOG_ID || "550e8400-e29b-41d4-a716-446655440002",
      judgeId:
        process.env.TEST_JUDGE_ID || "550e8400-e29b-41d4-a716-446655440003",
      secretaryId:
        process.env.TEST_SECRETARY_ID || "00000000-0000-0000-0000-000000000001",
    };
  },

  /**
   * Czeka na załadowanie strony i sprawdza połączenie z chmurą
   */
  async waitForCloudConnection(page: Page): Promise<void> {
    // Czeka na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Czeka na załadowanie głównych elementów
    await page.waitForSelector("h1", { timeout: 10000 });

    // Sprawdza czy nie ma błędów połączenia
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Krótkie opóźnienie aby zebrać błędy
    await page.waitForTimeout(1000);

    // Sprawdza czy nie ma błędów Supabase
    const supabaseErrors = consoleErrors.filter(
      (error) =>
        error.includes("Supabase") ||
        error.includes("database") ||
        error.includes("connection"),
    );

    if (supabaseErrors.length > 0) {
      throw new Error(
        `Supabase connection errors found: ${supabaseErrors.join(", ")}`,
      );
    }
  },

  /**
   * Sprawdza czy aplikacja jest połączona z chmurą
   */
  async checkCloudConnection(page: Page): Promise<boolean> {
    try {
      await this.waitForCloudConnection(page);
      return true;
    } catch (error) {
      console.error("Cloud connection check failed:", error);
      return false;
    }
  },

  /**
   * Loguje informacje o środowisku testowym
   */
  logTestEnvironment(): void {
    const env = this.getTestEnvironment();
    console.log("🧪 Test Environment Info:");
    console.log(`📍 Environment: ${env}`);
    console.log(`📍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`📍 SUPABASE_URL: ${process.env.SUPABASE_URL}`);
    console.log(`📍 TEST_BASE_URL: ${process.env.TEST_BASE_URL}`);

    if (env === "cloud") {
      console.log("☁️  Using Supabase cloud for testing");
    } else if (env === "test") {
      console.log("🧪 Using dedicated test database");
    } else {
      console.log("🏠 Using local development environment");
    }
  },

  /**
   * Czeka na załadowanie aplikacji i sprawdza podstawowe elementy
   */
  async waitForAppLoad(page: Page): Promise<void> {
    // Czeka na załadowanie strony
    await page.waitForLoadState("networkidle");

    // Czeka na główny nagłówek
    await page.waitForSelector("h1", { timeout: 10000 });

    // Czeka na załadowanie głównych elementów UI
    await page.waitForSelector("main, [role='main']", { timeout: 5000 });
  },

  /**
   * Sprawdza czy strona nie ma błędów krytycznych
   */
  async checkForCriticalErrors(page: Page): Promise<boolean> {
    const errorSelectors = [
      '[data-testid="error"]',
      ".error",
      ".alert",
      '[role="alert"]',
      ".toast-error",
    ];

    for (const selector of errorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.warn(
          `⚠️  Found ${count} error elements with selector: ${selector}`,
        );
        return false;
      }
    }

    return true;
  },

  /**
   * Tworzy screenshot z timestampem
   */
  async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${timestamp}.png`;
    await page.screenshot({ path: `test-results/${filename}` });
    console.log(`📸 Screenshot saved: ${filename}`);
  },

  /**
   * Sprawdza czy aplikacja jest w trybie testowym
   */
  isTestMode(): boolean {
    return (
      process.env.NODE_ENV === "test" || process.env.TEST_ENVIRONMENT === "test"
    );
  },

  /**
   * Czeka na stabilny stan aplikacji (dla testów)
   */
  async waitForStableState(page: Page): Promise<void> {
    // Czeka na załadowanie
    await page.waitForLoadState("networkidle");

    // Dodatkowe opóźnienie dla testów
    if (this.isTestMode()) {
      await page.waitForTimeout(1000);
    }
  },
};
