import type { Page } from "@playwright/test";

/**
 * Bazowa klasa dla wszystkich Page Objects
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Przejdź do strony
   */
  async goto(path: string = "/"): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Czekaj na załadowanie strony
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  /**
   * Sprawdź czy strona jest załadowana
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForSelector("h1", { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pobierz tytuł strony
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Pobierz nagłówek H1
   */
  async getMainHeading(): Promise<string> {
    const heading = this.page.locator("h1").first();
    return (await heading.textContent()) || "";
  }

  /**
   * Sprawdź czy element jest widoczny
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }

  /**
   * Sprawdź czy tekst jest widoczny na stronie
   */
  async isTextVisible(text: string): Promise<boolean> {
    try {
      // Użyj bardziej precyzyjnego selektora - pierwszy widoczny element
      const element = this.page.getByText(text).first();
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Zrób screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({ path: `test-results/${filename}` });
  }

  /**
   * Sprawdź czy nie ma błędów
   */
  async checkForErrors(): Promise<boolean> {
    const errorSelectors = [
      '[data-testid="error"]',
      ".error",
      ".alert",
      '[role="alert"]',
    ];

    for (const selector of errorSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.warn(
          `Found ${count} error elements with selector: ${selector}`,
        );
        return false;
      }
    }

    return true;
  }
}
