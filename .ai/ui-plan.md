# Architektura UI dla 10x Dog Show

## 1. Przegląd struktury UI

System 10x Dog Show wykorzystuje **unified interface approach** z jednym wspólnym layoutem dla wszystkich ról użytkowników. Architektura opiera się na hierarchicznej strukturze nawigacji z conditional rendering komponentów w zależności od uprawnień użytkownika i stanu biznesowego obiektów.

### Kluczowe zasady architektury:

- **Role-based UI**: Dynamiczne dostosowanie interfejsu do uprawnień (Department Representative vs Secretary)
- **Progressive Enhancement**: Astro SSR z selektywną hydratacją React komponentów
- **Time-aware Interface**: Ograniczenia edycji na podstawie statusu wystawy i czasu
- **Privacy-first Design**: Globalny system ukrywania danych osobowych
- **Responsive Design**: Głównie laptopy (1024px+) z podstawowym wsparciem tabletów (768px+)
- **Accessibility**: Zgodność z minimalnymi standardami WCAG 2.1 AA

### Stack technologiczny:

- **Framework**: Astro z React komponentami
- **Styling**: Tailwind CSS z shadcn/ui komponentami
- **State Management**: React Context + Supabase built-in state
- **Authentication**: Supabase Auth z JWT tokens
- **Database**: Supabase PostgreSQL z Row Level Security

## 2. Lista widoków

### 2.1 Widoki autentykacji

#### Login Page

- **Ścieżka**: `/login`
- **Cel**: Uwierzytelnianie użytkowników w systemie
- **API**: `POST /auth/login`
- **User Stories**: US-002
- **Kluczowe informacje**:
  - Formularz logowania (email, hasło)
  - Link do rejestracji i resetowania hasła
  - Informacje o systemie i wspieranych przeglądarkach
- **Komponenty**: `LoginForm`, `FormWithConfirmation`, `LoadingSpinner`
- **UX/Dostępność**: Keyboard navigation, screen reader support, error handling
- **Bezpieczeństwo**: Rate limiting, CSRF protection, secure session handling

#### Register Page

- **Ścieżka**: `/register`
- **Cel**: Rejestracja nowych użytkowników
- **API**: `POST /auth/register`
- **User Stories**: US-001
- **Kluczowe informacje**:
  - Formularz rejestracji (email, hasło, imię, nazwisko, rola)
  - Walidacja siły hasła
  - Informacje o weryfikacji email
- **Komponenty**: `RegistrationForm`, `PasswordStrengthIndicator`, `RoleSelector`
- **UX/Dostępność**: Real-time validation, clear error messages
- **Bezpieczeństwo**: Password strength validation, email verification

### 2.2 Widoki główne

#### Dashboard

- **Ścieżka**: `/dashboard`
- **Cel**: Główny przegląd dostępnych wystaw i quick actions
- **API**: `GET /shows`, `GET /auth/me`
- **User Stories**: Wszystkie - punkt wejścia
- **Kluczowe informacje**:
  - Lista ostatnich wystaw (role-filtered)
  - Quick actions (nowa wystawa, nowy opis)
  - Nadchodzące deadlines i notifications
- **Komponenty**: `ShowCard`, `QuickActions`, `NotificationCenter`
- **UX/Dostępność**: Card-based layout, keyboard shortcuts
- **Bezpieczeństwo**: Role-based data filtering, privacy toggle respect

#### User Profile

- **Ścieżka**: `/profile`
- **Cel**: Zarządzanie danymi użytkownika i preferencjami
- **API**: `GET /auth/me`, `PUT /users/{id}`
- **User Stories**: US-003 (pośrednio)
- **Kluczowe informacje**:
  - Dane osobowe użytkownika
  - Ustawienia językowe i theme
  - Historia aktywności
  - Zmiana hasła
- **Komponenty**: `ProfileForm`, `PasswordChangeForm`, `ActivityLog`, `PreferencesPanel`
- **UX/Dostępność**: Form validation, confirmation dialogs
- **Bezpieczeństwo**: Password confirmation, session validation

### 2.3 Widoki zarządzania wystawami

#### Shows List

- **Ścieżka**: `/shows`
- **Cel**: Przegląd wszystkich wystaw z zaawansowanym filtrowaniem
- **API**: `GET /shows` z query parameters
- **User Stories**: US-004, US-015
- **Kluczowe informacje**:
  - Lista wystaw z podstawowymi danymi (nazwa, data, status, lokalizacja)
  - Filtry: status, typ wystawy, okres dat, organizator
  - Wyszukiwanie tekstowe
  - Paginacja i sortowanie
- **Komponenty**: `DataTable`, `AutocompleteFilter`, `DateRangePicker`, `ShowStatusIndicator`
- **UX/Dostępność**: Responsive table, keyboard navigation, screen reader support
- **Bezpieczeństwo**: Role-based filtering, data privacy respect

#### Show Details

- **Ścieżka**: `/shows/{id}`
- **Cel**: Szczegółowy widok wystawy z zarządzaniem psami i statusem
- **API**: `GET /shows/{id}`, `GET /shows/{showId}/registrations`
- **User Stories**: US-015, US-007, US-008, US-009
- **Kluczowe informacje**:
  - Pełne dane wystawy (szczegóły, lokalizacja, harmonogram)
  - Lista zarejestrowanych psów (hierarchiczne grupowanie)
  - Statystyki rejestracji
  - Panel zarządzania (edit/delete dla department representative)
- **Komponenty**: `ShowHeader`, `HierarchicalList`, `DogCard`, `RegistrationStats`, `ShowTimeline`
- **UX/Dostępność**: Expandable sections, contextual navigation
- **Bezpieczeństwo**: Time-based edit restrictions, role-based actions

#### Show Creator

- **Ścieżka**: `/shows/new`
- **Cel**: Multi-step wizard tworzenia nowej wystawy
- **API**: `POST /shows`, `GET /venues`, `GET /judges`
- **User Stories**: US-004
- **Kluczowe informacje**:
  - Step 1: Podstawowe dane (nazwa, typ, data)
  - Step 2: Lokalizacja i venue
  - Step 3: Sędziowie i kategorie
  - Step 4: Ustawienia rejestracji
  - Step 5: Podsumowanie i publikacja
- **Komponenty**: `FormWizard`, `StepIndicator`, `VenueSelector`, `JudgeAssignment`
- **UX/Dostępność**: Progress indication, save draft functionality
- **Bezpieczeństwo**: Draft auto-save, confirmation before publication

### 2.4 Widoki zarządzania psami

#### Dogs List (w kontekście wystawy)

- **Ścieżka**: `/shows/{showId}/dogs`
- **Cel**: Hierarchiczna lista psów pogrupowana według grup FCI, ras i klas
- **API**: `GET /shows/{showId}/registrations`, `GET /breeds`
- **User Stories**: US-007, US-010, US-012
- **Kluczowe informacje**:
  - Hierarchiczne grupowanie (Grupa FCI → Rasa → Klasa → Pies)
  - Status opisu dla każdego psa (draft, completed, finalized)
  - Quick actions (create description, view details)
  - Filtry dla sekretarzy (tylko przypisane rasy)
- **Komponenty**: `HierarchicalList`, `DogCard`, `StatusBadge`, `QuickActionMenu`
- **UX/Dostępność**: Collapsible hierarchy, keyboard navigation, search
- **Bezpieczeństwo**: Secretary role filtering, time-based restrictions

#### Dog Details

- **Ścieżka**: `/dogs/{id}`
- **Cel**: Szczegółowe informacje o psie z historią opisów
- **API**: `GET /dogs/{id}`, `GET /descriptions?dog_id={id}`
- **User Stories**: US-008, US-012
- **Kluczowe informacje**:
  - Pełne dane psa (rasa, pochodzenie, właściciel)
  - Historia opisów z różnych wystaw
  - Aktualny status rejestracji
  - Panel edycji (jeśli dozwolone)
- **Komponenty**: `DogProfile`, `ChangeHistory`, `DescriptionSummary`, `OwnerInfo`
- **UX/Dostępność**: Privacy toggle integration, expandable sections
- **Bezpieczeństwo**: Data privacy masking, edit time restrictions

#### Dog Registration

- **Ścieżka**: `/shows/{showId}/register-dog`
- **Cel**: Rejestracja psa na wystawę z walidacją klas
- **API**: `POST /shows/{showId}/registrations`, `GET /dogs`, `GET /owners`
- **User Stories**: US-007
- **Kluczowe informacje**:
  - Wybór psa lub tworzenie nowego
  - Automatyczne określenie klasy na podstawie wieku
  - Dane właściciela z zgodą RODO
  - Podsumowanie kosztów
- **Komponenty**: `DogSelector`, `ClassValidator`, `OwnerForm`, `GDPRConsent`
- **UX/Dostępność**: Smart defaults, inline validation
- **Bezpieczeństwo**: GDPR consent validation, capacity limits check

### 2.5 Widoki opisów i ocen

#### Description Editor

- **Ścieżka**: `/descriptions/{id}/edit` lub `/dogs/{dogId}/description/new`
- **Cel**: Tworzenie i edycja opisów psów z systemem ocen
- **API**: `POST /descriptions`, `PUT /descriptions/{id}`, `POST /descriptions/{id}/evaluations`
- **User Stories**: US-010, US-011, US-017, US-018, US-019
- **Kluczowe informacje**:
  - Rich text editor dla opisu (PL/EN)
  - Formularz oceny (ocena, tytuł, lokata, punkty)
  - Historia zmian (expandable)
  - Status finalizacji
  - Auto-save i manual save opcje
- **Komponenty**: `DescriptionEditor`, `EvaluationForm`, `ChangeHistory`, `AutoSave`, `FormWithConfirmation`
- **UX/Dostępność**: Rich text accessibility, keyboard shortcuts, auto-save indicators
- **Bezpieczeństwo**: Version control, time-based edit locks, secretary breed restrictions

#### Description History

- **Ścieżka**: `/descriptions/{id}/history`
- **Cel**: Szczegółowa historia wszystkich zmian w opisie
- **API**: `GET /descriptions/{id}/versions`
- **User Stories**: US-012
- **Kluczowe informacje**:
  - Chronologiczna lista wszystkich wersji
  - Diff view między wersjami
  - Informacje o autorach zmian
  - Timestamps wszystkich modyfikacji
- **Komponenty**: `VersionTimeline`, `DiffViewer`, `VersionComparison`
- **UX/Dostępność**: Clear version indication, easy comparison
- **Bezpieczeństwo**: Read-only view, audit trail preservation

### 2.6 Widoki administratorskie (Department Representative)

#### User Management

- **Ścieżka**: `/admin/users`
- **Cel**: Zarządzanie sekretarzami i przypisaniami do ras
- **API**: `GET /users`, `POST /users`, `PUT /users/{id}`
- **User Stories**: US-013
- **Kluczowe informacje**:
  - Lista użytkowników z rolami i statusem
  - Formularz dodawania nowego sekretarza
  - Przypisania do ras/grup FCI
  - Historia aktywności użytkowników
- **Komponenty**: `UserTable`, `UserForm`, `BreedAssignment`, `ActivityLog`
- **UX/Dostępność**: Bulk operations, confirmation dialogs
- **Bezpieczeństwo**: Department representative only, audit logging

#### GDPR Management

- **Ścieżka**: `/admin/gdpr`
- **Cel**: Zarządzanie polityką prywatności i żądaniami RODO
- **API**: `GET /gdpr/*`, `POST /gdpr/export`, `POST /gdpr/delete`
- **User Stories**: US-016, US-021, US-022, US-023
- **Kluczowe informacje**:
  - Polityka przechowywania danych
  - Żądania eksportu i usunięcia danych
  - Harmonogram automatycznego usuwania
  - Statystyki zgodności RODO
- **Komponenty**: `GDPRDashboard`, `DataRetentionSettings`, `ExportRequests`, `ComplianceStats`
- **UX/Dostępność**: Clear policy explanation, progress indicators
- **Bezpieczeństwo**: Restricted access, audit trail, secure data handling

#### Owner Management

- **Ścieżka**: `/owners`
- **Cel**: Zarządzanie bazą właścicieli psów
- **API**: `GET /owners`, `POST /owners`, `PUT /owners/{id}`
- **User Stories**: US-007 (pośrednio)
- **Kluczowe informacje**:
  - Lista właścicieli z danymi kontaktowymi
  - Status zgód RODO
  - Historia komunikacji (wysłane PDF)
  - Zarządzanie zgodami
- **Komponenty**: `OwnerTable`, `ContactInfo`, `GDPRStatus`, `CommunicationLog`
- **UX/Dostępność**: Privacy toggle integration, search functionality
- **Bezpieczeństwo**: Data masking, GDPR compliance, consent tracking

### 2.7 Widoki słownikowe

#### Breeds Dictionary

- **Ścieżka**: `/dictionaries/breeds`
- **Cel**: Zarządzanie słownikiem ras psów FCI
- **API**: `GET /breeds`
- **User Stories**: Supportive dla innych funkcji
- **Kluczowe informacje**:
  - Lista ras z numerami FCI
  - Grupowanie według grup FCI
  - Status aktywności ras
  - Przypisania sędziów
- **Komponenty**: `BreedTable`, `FCIGroupFilter`, `JudgeAssignments`
- **UX/Dostępność**: Hierarchical grouping, search functionality
- **Bezpieczeństwo**: Read-only dla secretaries, edit dla representatives

## 3. Mapa podróży użytkownika

### 3.1 Department Representative Journey

**Główny przepływ zarządzania wystawą:**

```
Login → Dashboard → Show Creator (wizard) → Show Details →
Dog Registration → User Assignment → Progress Monitoring →
Description Review → PDF Generation → Data Export
```

**Szczegółowe kroki:**

1. **Planowanie wystawy**: Dashboard → Shows List → Show Creator
2. **Konfiguracja**: Venue selection → Judge assignment → Registration settings
3. **Zarządzanie rejestracjami**: Dog Registration → Owner management → GDPR consent
4. **Przypisanie sekretarzy**: User Management → Breed assignments → Permission setup
5. **Monitoring postępów**: Show Details → Dogs List → Description status overview
6. **Finalizacja**: Description review → PDF generation → Email distribution
7. **Post-show**: Data export → GDPR compliance → Archive management

### 3.2 Secretary Journey

**Główny przepływ tworzenia opisów:**

```
Login → Dashboard → Show Selection → Dogs List (filtered) →
Dog Details → Description Editor → Evaluation Form → Finalization
```

**Szczegółowe kroki:**

1. **Dostęp do przypisanych wystaw**: Dashboard → Show filtering by assignments
2. **Nawigacja po rasach**: Show Details → Dogs List → Breed filtering
3. **Tworzenie opisów**: Dog Details → Description Editor → Rich text editing
4. **Wprowadzanie ocen**: Evaluation Form → Grade selection → Title assignment
5. **Zarządzanie wersjami**: Auto-save → Manual save → Version history
6. **Finalizacja**: Review changes → Confirm finalization → Lock description

### 3.3 Shared Interaction Patterns

**Common workflows:**

- **Privacy management**: Global privacy toggle → Data masking across all views
- **Profile management**: User menu → Profile settings → Password change
- **Offline handling**: Connection loss → Offline indicator → Draft preservation
- **Theme switching**: Theme toggle → Preference persistence → System sync

## 4. Układ i struktura nawigacji

### 4.1 Główna struktura nawigacji

**Header Navigation (persistent):**

```
┌─ Logo/Home ─┬─ Main Navigation ─┬─ Global Controls ─┬─ User Menu ─┐
│             │                   │                   │             │
│ 10x Dog     │ • Dashboard       │ • Privacy Toggle  │ • Profile   │
│ Show        │ • Shows           │ • Theme Toggle    │ • Settings  │
│             │ • Users*          │ • Offline Status  │ • GDPR*     │
│             │ • Dictionaries*   │                   │ • Logout    │
└─────────────┴───────────────────┴───────────────────┴─────────────┘
* Department Representative only
```

**Sidebar Navigation (contextual):**

- **Show context**: Show details, Dogs, Registrations, Settings
- **Dog context**: Dog details, Descriptions, History
- **Admin context**: Users, GDPR, Owners, Dictionaries

### 4.2 Breadcrumb Navigation

**Hierarchical navigation pattern:**

```
Dashboard > Shows > Warsaw Show 2024 > Dogs > German Shepherd > Bella > Description
```

**Context-aware breadcrumbs:**

- **Role-based**: Different paths for different roles
- **State-aware**: Show editing restrictions based on show status
- **Permission-aware**: Hidden paths for unauthorized actions

### 4.3 Mobile/Tablet Adaptations

**Tablet Navigation (768px - 1024px):**

- Collapsible sidebar navigation
- Bottom action bar for key functions
- Swipe gestures between related items
- Touch-optimized form controls

**Responsive breakpoints:**

- **Mobile**: < 768px (basic support)
- **Tablet**: 768px - 1024px (optimized)
- **Desktop**: > 1024px (primary target)

## 5. Kluczowe komponenty

### 5.1 Layout Components

#### Layout.astro

**Cel**: Unified layout dla wszystkich stron z conditional rendering
**Funkcjonalność**:

- Role-based navigation rendering
- Theme persistence i initialization
- Global state providers (user, privacy, theme)
- Responsive layout adaptation

#### PermissionGate

**Cel**: Conditional rendering na podstawie uprawnień użytkownika
**Props**: `role`, `permission`, `fallback`
**Funkcjonalność**:

- Role-based access control
- Business rule validation (time restrictions)
- Graceful fallback rendering

#### Navbar

**Cel**: Global navigation z kontrolami systemowymi
**Funkcjonalność**:

- Role-based menu items
- GlobalPrivacyToggle integration
- Theme switching
- User session management
- Offline status indicator

### 5.2 Form Components

#### FormWithConfirmation

**Cel**: Wrapper dla formularzy z protection przed utratą danych
**Funkcjonalność**:

- Unsaved changes detection
- Browser beforeunload event handling
- Confirmation dialogs
- Auto-save integration

#### FormWizard

**Cel**: Multi-step form handling z progress tracking
**Props**: `steps`, `onStepChange`, `onComplete`
**Funkcjonalność**:

- Step validation i navigation
- Progress indication
- Draft saving between steps
- Step-specific validation rules

#### DescriptionEditor

**Cel**: Rich text editor dla opisów psów z version control
**Funkcjonalność**:

- Multi-language support (PL/EN)
- Auto-save z visual indicators
- Version history integration
- Accessibility compliance (WCAG)
- Keyboard shortcuts

### 5.3 Data Display Components

#### DataTable

**Cel**: Consistent table component z advanced functionality
**Props**: `data`, `columns`, `filters`, `pagination`
**Funkcjonalność**:

- Built-in sorting i filtering
- Responsive design
- Keyboard navigation
- Export functionality
- Role-based column visibility

#### HierarchicalList

**Cel**: Nested data display dla grup/ras/klas
**Funkcjonalność**:

- Collapsible sections
- Search within hierarchy
- Keyboard navigation
- Custom rendering per level

#### ChangeHistory

**Cel**: Expandable version history display
**Props**: `versions`, `showDiff`, `maxItems`
**Funkcjonalność**:

- Chronological timeline
- Diff visualization
- User attribution
- Timestamp formatting

### 5.4 Specialized Components

#### GlobalPrivacyToggle

**Cel**: Navbar component dla hiding personal data
**Funkcjonalność**:

- Global state management (Context + localStorage)
- Real-time data masking across all components
- Visual indicator when privacy mode active
- Accessibility announcements

#### ShowStatusIndicator

**Cel**: Visual show status z business rule awareness
**Props**: `show`, `detailed`
**Funkcjonalność**:

- Status badge rendering
- Edit restriction messaging
- Countdown timers dla deadlines
- Contextual actions availability

#### EvaluationForm

**Cel**: Structured form dla dog evaluations
**Funkcjonalność**:

- Grade validation per dog class
- Title eligibility checking
- Placement conflict detection
- Point calculation
- Business rule enforcement

### 5.5 Security & Privacy Components

#### PrivacyMask

**Cel**: Data masking component responsive to privacy toggle
**Props**: `data`, `maskType`, `fallback`
**Funkcjonalność**:

- Context-aware masking (GlobalPrivacyToggle)
- Different masking strategies (full, partial, placeholder)
- Screen reader appropriate alternatives

#### TimeRestriction

**Cel**: Component enforcement time-based business rules
**Props**: `show`, `restrictionType`, `children`
**Funkcjonalność**:

- Show status validation
- Time-based edit locks
- User feedback dla restrictions
- Alternative action suggestions

#### RoleGuard

**Cel**: Higher-order component dla role-based access control
**Props**: `allowedRoles`, `fallback`
**Funkcjonalność**:

- JWT token validation
- Role hierarchy checking
- Graceful access denial
- Alternative content rendering

### 5.6 UX Enhancement Components

#### OfflineDetector

**Cel**: Network status monitoring i user feedback
**Funkcjonalność**:

- Connection status detection
- Toast notifications dla status changes
- Draft preservation during offline periods
- Sync indicators when reconnected

#### AutoSave

**Cel**: Automatic form data preservation
**Props**: `interval`, `onSave`, `indicator`
**Funkcjonalność**:

- Configurable save intervals
- Visual save status indicators
- Conflict resolution dla concurrent edits
- Local storage fallback

#### LoadingSpinner

**Cel**: Skeleton UI dla loading states
**Props**: `type`, `size`, `message`
**Funkcjonalność**:

- Multiple skeleton patterns (table, card, form)
- Accessibility announcements
- Progressive loading indicators
- Error state handling

Każdy component jest zaprojektowany z myślą o:

- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lazy loading i code splitting
- **Maintainability**: Clear props interface i documentation
- **Testing**: Unit test coverage i visual regression tests
- **Internationalization**: Polish/English support preparation
