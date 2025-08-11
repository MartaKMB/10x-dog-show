/**
 * Centralny plik z selektorami testowymi
 * Używamy data-testid dla lepszej stabilności testów
 */

export const TestSelectors = {
  // Layout i nawigacja główna
  layout: {
    mainHeader: '[data-testid="main-header"]',
    logoLink: '[data-testid="logo-link"]',
    mainContent: '[data-testid="main-content"]',
  },

  navigation: {
    desktopNavigation: '[data-testid="desktop-navigation"]',
    navDashboardLink: '[data-testid="nav-dashboard-link"]',
    navShowsLink: '[data-testid="nav-shows-link"]',
    navDogsLink: '[data-testid="nav-dogs-link"]',

    // Nawigacja mobilna
    mobileMenu: '[data-testid="mobile-menu"]',
    mobileMenuButton: '[data-testid="mobile-menu-button"]',
    mobileNavDashboardLink: '[data-testid="mobile-nav-dashboard-link"]',
    mobileNavShowsLink: '[data-testid="mobile-nav-shows-link"]',
    mobileNavDogsLink: '[data-testid="mobile-nav-dogs-link"]',
  },

  auth: {
    // Przyciski autoryzacji (desktop)
    authButtons: '[data-testid="auth-buttons"]',
    loginLink: '[data-testid="login-link"]',
    registerLink: '[data-testid="register-link"]',

    // Przyciski autoryzacji (mobile)
    mobileAuthButtons: '[data-testid="mobile-auth-buttons"]',
    mobileLoginLink: '[data-testid="mobile-login-link"]',
    mobileRegisterLink: '[data-testid="mobile-register-link"]',

    // Menu użytkownika (zalogowany)
    userMenu: '[data-testid="user-menu"]',
    userEmail: '[data-testid="user-email"]',
    logoutForm: '[data-testid="logout-form"]',
    logoutButton: '[data-testid="logout-button"]',

    // Menu użytkownika (mobile, zalogowany)
    mobileLogoutForm: '[data-testid="mobile-logout-form"]',
    mobileLogoutButton: '[data-testid="mobile-logout-button"]',

    // Formularze autoryzacji
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    submitButton: '[data-testid="submit-button"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    resetPasswordLink: '[data-testid="reset-password-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
  },

  // Strona główna
  home: {
    welcomeMessage: '[data-testid="welcome-message"]',
    publicAccessInfo: '[data-testid="public-access-info"]',
    mainHeading: "h1",
  },

  // Listy i tabele
  lists: {
    addShowButton: '[data-testid="add-show-button"]',
    addDogButton: '[data-testid="add-dog-button"]',
    addOwnerButton: '[data-testid="add-owner-button"]',
    showCard: '[data-testid="show-card"]',
    dogCard: '[data-testid="dog-card"]',
    ownerCard: '[data-testid="owner-card"]',
    editButton: '[data-testid="edit-button"]',
    deleteButton: '[data-testid="delete-button"]',
    searchInput: '[data-testid="search-input"]',
    filterSelect: '[data-testid="filter-select"]',
  },

  // Formularze CRUD
  forms: {
    showForm: '[data-testid="show-form"]',
    dogForm: '[data-testid="dog-form"]',
    ownerForm: '[data-testid="owner-form"]',
    nameInput: '[data-testid="name-input"]',
    breedSelect: '[data-testid="breed-select"]',
    genderSelect: '[data-testid="gender-select"]',
    birthDateInput: '[data-testid="birth-date-input"]',
    microchipInput: '[data-testid="microchip-input"]',
    saveButton: '[data-testid="save-button"]',
    cancelButton: '[data-testid="cancel-button"]',
  },

  // Komunikaty i błędy
  messages: {
    error: '[data-testid="error"]',
    success: '[data-testid="success"]',
    warning: '[data-testid="warning"]',
    info: '[data-testid="info"]',
    loading: '[data-testid="loading"]',
    emptyState: '[data-testid="empty-state"]',
  },

  // Modalne okna
  modals: {
    confirmDialog: '[data-testid="confirm-dialog"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    closeButton: '[data-testid="close-button"]',
  },

  // Dashboard
  dashboard: {
    container: '[data-testid="dashboard-container"]',
    error: '[data-testid="dashboard-error"]',
    retryButton: '[data-testid="dashboard-retry-button"]',
    statsSection: '[data-testid="dashboard-stats-section"]',
    recentShowsSection: '[data-testid="dashboard-recent-shows-section"]',
    quickActionsSection: '[data-testid="dashboard-quick-actions-section"]',
    systemInfo: '[data-testid="dashboard-system-info"]',
    versionInfo: '[data-testid="dashboard-version-info"]',
    statusInfo: '[data-testid="dashboard-status-info"]',
    roleInfo: '[data-testid="dashboard-role-info"]',

    // Recent Shows
    recentShowsContainer: '[data-testid="recent-shows-container"]',
    recentShowsLoading: '[data-testid="recent-shows-loading"]',
    recentShowsEmpty: '[data-testid="recent-shows-empty"]',
    recentShowsViewAllLink: '[data-testid="recent-shows-view-all-link"]',
    recentShowCard: '[data-testid^="recent-show-card-"]',
    recentShowName: '[data-testid^="recent-show-name-"]',
    recentShowDetails: '[data-testid^="recent-show-details-"]',
    recentShowJudge: '[data-testid^="recent-show-judge-"]',
    recentShowDogs: '[data-testid^="recent-show-dogs-"]',
    recentShowStatus: '[data-testid^="recent-show-status-"]',

    // Quick Actions
    quickActionsContainer: '[data-testid="quick-actions-container"]',
    quickAction: '[data-testid^="quick-action-"]',
    quickActionTitle: '[data-testid^="quick-action-title-"]',
    quickActionDescription: '[data-testid^="quick-action-description-"]',
  },

  // UI Components
  ui: {
    button: "[data-testid]", // Generic button selector
    actionButtonsContainer: '[data-testid="action-buttons-container"]',
    actionButtonCancel: '[data-testid="action-button-cancel"]',
    actionButtonSave: '[data-testid="action-button-save"]',
    actionButtonFinalize: '[data-testid="action-button-finalize"]',
    keyboardShortcuts: '[data-testid="keyboard-shortcuts"]',
  },

  // Statystyki
  statistics: {
    chartContainer: '[data-testid="chart-container"]',
    statsTable: '[data-testid="stats-table"]',
    exportButton: '[data-testid="export-button"]',
  },

  // Wystawy
  shows: {
    showDetails: '[data-testid="show-details"]',
    registrationForm: '[data-testid="registration-form"]',
    evaluationForm: '[data-testid="evaluation-form"]',
    classGroup: '[data-testid="class-group"]',
    breedGroup: '[data-testid="breed-group"]',
  },

  // Psy
  dogs: {
    dogDetails: '[data-testid="dog-details"]',
    pedigreeInfo: '[data-testid="pedigree-info"]',
    showHistory: '[data-testid="show-history"]',
    evaluationHistory: '[data-testid="evaluation-history"]',
  },

  // Właściciele
  owners: {
    ownerDetails: '[data-testid="owner-details"]',
    dogsList: '[data-testid="owner-dogs-list"]',
    contactInfo: '[data-testid="contact-info"]',
    gdprStatus: '[data-testid="gdpr-status"]',
  },
};

/**
 * Funkcje pomocnicze do tworzenia selektorów z parametrami
 */
export const createSelector = {
  /**
   * Selektory z tekstem
   */
  withText: (text: string) => `text="${text}"`,

  /**
   * Selektory z częściowym tekstem
   */
  containsText: (text: string) => `text*="${text}"`,

  /**
   * Selektory z atrybutem href
   */
  withHref: (href: string) => `a[href="${href}"]`,

  /**
   * Selektory z atrybutem role
   */
  withRole: (role: string, name?: string) =>
    name ? `[role="${role}"][name="${name}"]` : `[role="${role}"]`,

  /**
   * Selektory z atrybutem aria-label
   */
  withAriaLabel: (label: string) => `[aria-label="${label}"]`,

  /**
   * Selektory z atrybutem placeholder
   */
  withPlaceholder: (placeholder: string) => `[placeholder="${placeholder}"]`,
};

/**
 * Selektory fallback (gdy data-testid nie są dostępne)
 */
export const FallbackSelectors = {
  // Nagłówki
  headings: {
    h1: "h1",
    h2: "h2",
    h3: "h3",
  },

  // Przyciski
  buttons: {
    submit: 'button[type="submit"]',
    button: "button",
    link: "a",
  },

  // Formularze
  forms: {
    form: "form",
    input: "input",
    select: "select",
    textarea: "textarea",
  },

  // Tabele
  tables: {
    table: "table",
    row: "tr",
    cell: "td",
    header: "th",
  },
};
