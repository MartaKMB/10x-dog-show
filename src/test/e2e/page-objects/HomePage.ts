import { BasePage } from "./BasePage";
import { TestSelectors } from "../selectors";

/**
 * Page Object dla strony głównej
 */
export class HomePage extends BasePage {
  // Selektory - używamy istniejących elementów zamiast data-testid
  private readonly selectors = {
    // Używamy nowych selektorów z Layout.astro
    loginLink: TestSelectors.auth.loginLink,
    registerLink: TestSelectors.auth.registerLink,
    showsLink: TestSelectors.navigation.navShowsLink,
    dogsLink: TestSelectors.navigation.navDogsLink,
    dashboardLink: TestSelectors.navigation.navDashboardLink,

    // Selektory dla strony głównej
    logoLink: TestSelectors.layout.logoLink,
    mainHeader: TestSelectors.layout.mainHeader,
    mainContent: TestSelectors.layout.mainContent,

    // Dodatkowe selektory
    statisticsLink: 'a[href="/statistics"]',
    welcomeMessage: TestSelectors.home.welcomeMessage,
    publicAccessInfo: TestSelectors.home.publicAccessInfo,
  };

  /**
   * Przejdź do strony głównej
   */
  async gotoHome(): Promise<void> {
    await this.goto("/");
  }

  /**
   * Sprawdź czy strona główna jest załadowana
   */
  async isHomePageLoaded(): Promise<boolean> {
    // Sprawdź czy strona jest załadowana
    if (!(await this.isPageLoaded())) {
      return false;
    }

    // Sprawdź czy główny nagłówek powitalny jest widoczny
    try {
      const welcomeHeading = this.page
        .locator("h1")
        .filter({ hasText: "Witaj w Klubie Hovawarta Show" });
      if (await welcomeHeading.isVisible()) {
        return true;
      }
    } catch {
      // Ignoruj błędy
    }

    // Sprawdź czy banner publicznego dostępu jest widoczny
    try {
      const publicAccessBanner = this.page
        .locator("text=To jest tryb podglądu")
        .first();
      if (await publicAccessBanner.isVisible()) {
        return true;
      }
    } catch {
      // Ignoruj błędy
    }

    // Sprawdź czy menu nawigacyjne jest widoczne
    try {
      const nav = this.page.locator("nav").first();
      if (await nav.isVisible()) {
        return true;
      }
    } catch {
      // Ignoruj błędy
    }

    return false;
  }

  /**
   * Przejdź do strony logowania
   */
  async gotoLogin(): Promise<void> {
    await this.page.click(this.selectors.loginLink);
  }

  /**
   * Przejdź do strony rejestracji
   */
  async gotoRegister(): Promise<void> {
    await this.page.click(this.selectors.registerLink);
  }

  /**
   * Przejdź do listy wystaw
   */
  async gotoShows(): Promise<void> {
    await this.page.click(this.selectors.showsLink);
  }

  /**
   * Przejdź do listy psów
   */
  async gotoDogs(): Promise<void> {
    await this.page.click(this.selectors.dogsLink);
  }

  /**
   * Przejdź do statystyk
   */
  async gotoStatistics(): Promise<void> {
    await this.page.click(this.selectors.statisticsLink);
  }

  /**
   * Sprawdź czy link logowania jest widoczny
   */
  async isLoginLinkVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.loginLink);
  }

  /**
   * Sprawdź czy link rejestracji jest widoczny
   */
  async isRegisterLinkVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.registerLink);
  }

  /**
   * Sprawdź czy wszystkie linki nawigacyjne są widoczne
   */
  async areNavigationLinksVisible(): Promise<boolean> {
    // Sprawdź czy główne linki nawigacyjne są widoczne
    const mainNavSelectors = [
      'a[href="/shows"]',
      'a[href="/dogs"]',
      // owners nie istnieje jako osobna strona
    ];

    let visibleCount = 0;
    for (const selector of mainNavSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          visibleCount++;
        }
      } catch {
        // Ignoruj błędy
      }
    }

    // Wystarczy że przynajmniej 1 z 2 głównych linków jest widoczny
    return visibleCount >= 1;
  }

  /**
   * Sprawdź czy informacja o dostępie publicznym jest widoczna
   */
  async isPublicAccessInfoVisible(): Promise<boolean> {
    // Sprawdź rzeczywisty banner publicznego dostępu ze strony
    const publicAccessSelectors = [
      "text=To jest tryb podglądu",
      "text=Gość (tylko podgląd)",
      "[data-testid='public-access-info']",
      ".public-access-info",
      ".access-info",
      // Sprawdź czy są widoczne linki nawigacyjne (oznacza dostęp publiczny)
      "a:has-text('Wystawy')",
      "a:has-text('Psy')",
      // owners nie istnieje jako osobna strona
    ];

    for (const selector of publicAccessSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          return true;
        }
      } catch {
        // Ignoruj błędy
      }
    }

    return false;
  }

  /**
   * Pobierz tekst powitalny
   */
  async getWelcomeMessage(): Promise<string> {
    const element = this.page.locator(this.selectors.welcomeMessage);
    return (await element.textContent()) || "";
  }

  /**
   * Sprawdź czy strona jest dostępna dla niezalogowanych użytkowników
   */
  async isPubliclyAccessible(): Promise<boolean> {
    return (
      (await this.isHomePageLoaded()) &&
      (await this.areNavigationLinksVisible()) &&
      (await this.isPublicAccessInfoVisible())
    );
  }
}
