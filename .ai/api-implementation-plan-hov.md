# API Implementation Plan - Klub Hovawarta Show

## 1. Przegląd implementacji

Plan implementacji API dla systemu Klub Hovawarta Show oparty na zaktualizowanych wymaganiach PRD, schemacie bazy danych i analizie archiwizowanych endpointów. System będzie uproszczony w porównaniu do oryginalnego systemu ZKwP, skupiając się na potrzebach klubu hovawartów.

### Kluczowe zmiany w porównaniu do archiwizowanych endpointów:

1. **Uproszczenie ról użytkowników** - tylko jedna rola: `club_board`
2. **Usunięcie systemu FCI** - tylko hovawarty, bez grup ras
3. **Uproszczenie ocen** - standardowe oceny FCI w języku polskim
4. **Tytuły klubowe** - specyficzne dla hovawartów
5. **Usunięcie opisów psów** - będą dodane w fazie 2
6. **Uproszczenie systemu wystaw** - tylko wystawy klubowe

## 2. Analiza archiwizowanych endpointów do wykorzystania

### 2.1 Endpointy do adaptacji:

#### Authentication & Users Management

- **Źródło**: `users-auth-implementation-plan.md`
- **Adaptacja**: Uproszczenie do jednej roli `club_board`
- **Wykorzystanie**: Podstawowa struktura autentykacji i zarządzania użytkownikami

#### Shows Management

- **Źródło**: `show-implementation-plan.md`
- **Adaptacja**: Usunięcie systemu oddziałów i uproszczenie statusów
- **Wykorzystanie**: Struktura zarządzania wystawami i rejestracjami

#### Dogs & Owners Management

- **Źródło**: `dogs-owners-menagment-implementation-plan.md`
- **Adaptacja**: Uproszczenie relacji i usunięcie systemu ras
- **Wykorzystanie**: Podstawowa struktura CRUD dla psów i właścicieli

#### GDPR Compliance

- **Źródło**: `gdpr-implementation-plan.md`
- **Adaptacja**: Uproszczenie do podstawowych wymagań RODO
- **Wykorzystanie**: System zgodności z RODO dla właścicieli

#### Evaluation Management

- **Źródło**: `dog-description-implementation-plan.md` (sekcja evaluations)
- **Adaptacja**: Przeniesienie z opisów do bezpośrednich ocen wystaw
- **Wykorzystanie**: Logika ocen i tytułów klubowych

### 2.2 Endpointy do usunięcia:

- **Branches Management** - niepotrzebne dla klubu
- **Breeds Management** - tylko hovawarty
- **Descriptions Management** - będą w fazie 2
- **Dictionary Management** - niepotrzebne dla MVP

## 3. Plan implementacji endpointów

### 3.1 Authentication & Users Management

#### Adaptacja z archiwizowanych endpointów:

**Wykorzystane elementy:**

- Struktura autentykacji Supabase Auth
- Zarządzanie sesjami JWT
- Podstawowe CRUD dla użytkowników

**Zmiany:**

- Usunięcie systemu ról (tylko `club_board`)
- Uproszczenie uprawnień
- Usunięcie systemu oddziałów

**Endpointy do implementacji:**

```
POST /auth/login
POST /auth/logout
GET /auth/me
GET /users
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}
```

### 3.2 Shows Management

#### Adaptacja z archiwizowanych endpointów:

**Wykorzystane elementy:**

- Struktura zarządzania wystawami
- System statusów wystaw
- Zarządzanie rejestracjami

**Zmiany:**

- Usunięcie systemu oddziałów
- Uproszczenie statusów (draft, open_for_registration, registration_closed, in_progress, completed, cancelled)
- Usunięcie systemu opłat
- Uproszczenie konfiguracji wystaw

**Endpointy do implementacji:**

```
GET /shows
GET /shows/{id}
POST /shows
PUT /shows/{id}
PATCH /shows/{id}/status
DELETE /shows/{id}
GET /shows/{showId}/registrations
POST /shows/{showId}/registrations
PUT /shows/{showId}/registrations/{registrationId}
DELETE /shows/{showId}/registrations/{registrationId}
POST /shows/{showId}/registrations/generate-catalog
```

### 3.3 Dogs Management

#### Adaptacja z archiwizowanych endpointów:

**Wykorzystane elementy:**

- Podstawowa struktura CRUD dla psów
- Walidacja numerów mikrochipów
- Relacje z właścicielami

**Zmiany:**

- Usunięcie systemu ras (tylko hovawarty)
- Uproszczenie danych psów
- Usunięcie systemu rodowodów (będzie w fazie 2)

**Endpointy do implementacji:**

```
GET /dogs
GET /dogs/{id}
POST /dogs
PUT /dogs/{id}
DELETE /dogs/{id}
GET /dogs/{id}/history
```

### 3.4 Owners Management

#### Adaptacja z archiwizowanych endpointów:

**Wykorzystane elementy:**

- Podstawowa struktura CRUD dla właścicieli
- System zgodności z RODO
- Walidacja danych kontaktowych

**Zmiany:**

- Uproszczenie danych właścicieli
- Podstawowy system RODO

**Endpointy do implementacji:**

```
GET /owners
GET /owners/{id}
POST /owners
PUT /owners/{id}
DELETE /owners/{id}
POST /owners/{id}/gdpr-consent
POST /owners/{id}/gdpr-withdraw
```

### 3.5 Evaluations Management

#### Adaptacja z archiwizowanych endpointów:

**Wykorzystane elementy:**

- Logika ocen FCI
- System tytułów
- Walidacja ocen

**Zmiany:**

- Przeniesienie z opisów do bezpośrednich ocen wystaw
- Uproszczenie do ocen w języku polskim
- Dodanie tytułów klubowych hovawartów
- Usunięcie systemu opisów

**Endpointy do implementacji:**

```
GET /shows/{showId}/evaluations
POST /shows/{showId}/evaluations
PUT /shows/{showId}/evaluations/{evaluationId}
DELETE /shows/{showId}/evaluations/{evaluationId}
```

### 3.6 Statistics & Reports

#### Nowe endpointy specyficzne dla klubu:

**Endpointy do implementacji:**

```
GET /shows/{id}/stats
GET /dogs/{id}/history
GET /owners/{id}/dogs
```

## 4. Szczegółowy plan implementacji

### 4.1 Faza 1: Podstawowa infrastruktura

#### 4.1.1 Authentication & Users (Priorytet: WYSOKI)

- **Zależności**: Brak
- **Pliki do utworzenia**:
  - `src/pages/api/auth/login.ts`
  - `src/pages/api/auth/logout.ts`
  - `src/pages/api/auth/me.ts`
  - `src/pages/api/users/index.ts`
  - `src/pages/api/users/[id].ts`
  - `src/lib/services/authService.ts`
  - `src/lib/services/userService.ts`
  - `src/lib/validation/userSchemas.ts`

#### 4.1.2 Shows Management (Priorytet: WYSOKI)

- **Zależności**: Authentication
- **Pliki do utworzenia**:
  - `src/pages/api/shows/index.ts`
  - `src/pages/api/shows/[id].ts`
  - `src/pages/api/shows/[id]/status.ts`
  - `src/pages/api/shows/[showId]/registrations/index.ts`
  - `src/pages/api/shows/[showId]/registrations/[registrationId].ts`
  - `src/lib/services/showService.ts`
  - `src/lib/services/registrationService.ts`
  - `src/lib/validation/showSchemas.ts`

### 4.2 Faza 2: Zarządzanie danymi

#### 4.2.1 Dogs Management (Priorytet: WYSOKI)

- **Zależności**: Shows Management
- **Pliki do utworzenia**:
  - `src/pages/api/dogs/index.ts`
  - `src/pages/api/dogs/[id].ts`
  - `src/pages/api/dogs/[id]/history.ts`
  - `src/lib/services/dogService.ts`
  - `src/lib/validation/dogSchemas.ts`

#### 4.2.2 Owners Management (Priorytet: WYSOKI)

- **Zależności**: Dogs Management
- **Pliki do utworzenia**:
  - `src/pages/api/owners/index.ts`
  - `src/pages/api/owners/[id].ts`
  - `src/pages/api/owners/[id]/gdpr-consent.ts`
  - `src/pages/api/owners/[id]/gdpr-withdraw.ts`
  - `src/lib/services/ownerService.ts`
  - `src/lib/validation/ownerSchemas.ts`

### 4.3 Faza 3: System ocen

#### 4.3.1 Evaluations Management (Priorytet: WYSOKI)

- **Zależności**: Shows, Dogs, Owners
- **Pliki do utworzenia**:
  - `src/pages/api/shows/[showId]/evaluations/index.ts`
  - `src/pages/api/shows/[showId]/evaluations/[evaluationId].ts`
  - `src/lib/services/evaluationService.ts`
  - `src/lib/validation/evaluationSchemas.ts`

#### 4.3.2 Statistics & Reports (Priorytet: ŚREDNI)

- **Zależności**: Evaluations
- **Pliki do utworzenia**:
  - `src/pages/api/shows/[id]/stats.ts`
  - `src/lib/services/statisticsService.ts`

### 4.4 Faza 4: GDPR & Compliance

#### 4.4.1 GDPR Management (Priorytet: ŚREDNI)

- **Zależności**: Owners
- **Pliki do utworzenia**:
  - `src/lib/services/gdprService.ts`
  - `src/lib/validation/gdprSchemas.ts`

## 5. Adaptacje z archiwizowanych endpointów

### 5.1 Authentication Service

**Źródło**: `users-auth-implementation-plan.md`

**Adaptacje**:

```typescript
// Uproszczenie ról - tylko club_board
export type UserRole = "club_board";

// Uproszczenie uprawnień
export const PERMISSIONS = {
  CLUB_BOARD: ["*"], // Pełny dostęp
} as const;

// System uprawnień oparty na autoryzacji i statusie
export const SHOW_PERMISSIONS = {
  EDIT: (isAuthenticated: boolean, showStatus: ShowStatus) =>
    isAuthenticated && showStatus === "draft",
  DELETE: (
    isAuthenticated: boolean,
    showStatus: ShowStatus,
    hasDogs: boolean,
  ) => isAuthenticated && showStatus === "draft" && !hasDogs,
  CHANGE_STATUS: (isAuthenticated: boolean) => isAuthenticated,
  MANAGE_DOGS: (isAuthenticated: boolean, showStatus: ShowStatus) =>
    isAuthenticated && showStatus === "draft",
} as const;
```

### 5.2 Show Service

**Źródło**: `show-implementation-plan.md`

**Adaptacje**:

```typescript
// Uproszczenie statusów wystaw
export type ShowStatus =
  | "draft"
  | "open_for_registration"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

// Usunięcie systemu oddziałów
export interface CreateShowDto {
  name: string;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description?: string;
  max_participants?: number;
}

// System uprawnień dla wystaw
export interface ShowPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canManageDogs: boolean;
}

export const getShowPermissions = (
  isAuthenticated: boolean,
  showStatus: ShowStatus,
  hasRegisteredDogs: boolean,
): ShowPermissions => ({
  canEdit: isAuthenticated && showStatus === "draft",
  canDelete: isAuthenticated && showStatus === "draft" && !hasRegisteredDogs,
  canChangeStatus: isAuthenticated,
  canManageDogs: isAuthenticated && showStatus === "draft",
});
```

### 5.3 Dog Service

**Źródło**: `dogs-owners-menagment-implementation-plan.md`

**Adaptacje**:

```typescript
// Uproszczenie danych psów - tylko hovawarty
export interface CreateDogDto {
  name: string;
  gender: "male" | "female";
  birth_date: string;
  microchip_number: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owners: Array<{
    id: string;
    is_primary: boolean;
  }>;
}
```

### 5.4 Evaluation Service

**Źródło**: `dog-description-implementation-plan.md`

**Adaptacje**:

```typescript
// Przeniesienie ocen z opisów do wystaw
export interface CreateEvaluationDto {
  dog_id: string;
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
}

// Walidacja uprawnień do ocen
export const canManageEvaluation = (
  isAuthenticated: boolean,
  showStatus: ShowStatus,
): boolean => {
  return isAuthenticated && showStatus === "draft";
};
```

// Oceny w języku polskim
export type EvaluationGrade =
| "doskonała"
| "bardzo_dobra"
| "dobra"
| "zadowalająca"
| "zdyskwalifikowana"
| "nieobecna";

// Tytuły klubowe hovawartów
export type ClubTitle =
| "młodzieżowy_zwycięzca_klubu"
| "zwycięzca_klubu"
| "zwycięzca_klubu_weteranów"
| "najlepszy_reproduktor"
| "najlepsza_suka_hodowlana"
| "najlepsza_para"
| "najlepsza_hodowla"
| "zwycięzca_rasy"
| "zwycięzca_płci_przeciwnej"
| "najlepszy_junior"
| "najlepszy_weteran";

````

## 6. Usunięte endpointy

### 6.1 Branches Management

- **Powód**: Niepotrzebne dla klubu hovawartów
- **Usunięte endpointy**:
  - `GET /branches`
  - `POST /branches`
  - `PUT /branches/{id}`
  - `DELETE /branches/{id}`

### 6.5 Payment System

- **Powód**: Usunięty z MVP zgodnie z wymaganiami
- **Usunięte endpointy**:
  - `GET /payments`
  - `POST /payments`
  - `PUT /payments/{id}`
  - `DELETE /payments/{id}`
  - `GET /shows/{showId}/payments`

### 6.2 Breeds Management

- **Powód**: Tylko hovawarty
- **Usunięte endpointy**:
  - `GET /breeds`
  - `POST /breeds`
  - `PUT /breeds/{id}`
  - `DELETE /breeds/{id}`

### 6.3 Descriptions Management

- **Powód**: Będą w fazie 2
- **Usunięte endpointy**:
  - `GET /descriptions`
  - `POST /descriptions`
  - `PUT /descriptions/{id}`
  - `DELETE /descriptions/{id}`
  - `POST /descriptions/{id}/evaluations`

### 6.4 Dictionary Management

- **Powód**: Niepotrzebne dla MVP
- **Usunięte endpointy**:
  - `GET /dictionaries`
  - `POST /dictionaries`
  - `PUT /dictionaries/{id}`
  - `DELETE /dictionaries/{id}`

## 7. Walidacja i logika biznesowa

### 7.1 Adaptacje walidacji

**Źródło**: Archiwizowane schematy walidacji

**Zmiany**:

```typescript
// Uproszczenie walidacji psów
export const createDogSchema = z.object({
  name: z.string().min(1).max(100),
  gender: z.enum(["male", "female"]),
  birth_date: z.string().refine(isValidDate),
  microchip_number: z.string().regex(/^[0-9]{15}$/),
  kennel_name: z.string().max(200).optional(),
  father_name: z.string().max(100).optional(),
  mother_name: z.string().max(100).optional(),
  owners: z
    .array(
      z.object({
        id: z.string().uuid(),
        is_primary: z.boolean(),
      }),
    )
    .min(1),
});

// Walidacja ocen
export const createEvaluationSchema = z
  .object({
    dog_id: z.string().uuid(),
    dog_class: z.enum([
      "baby",
      "puppy",
      "junior",
      "intermediate",
      "open",
      "working",
      "champion",
      "veteran",
    ]),
    grade: z
      .enum([
        "doskonała",
        "bardzo_dobra",
        "dobra",
        "zadowalająca",
        "zdyskwalifikowana",
        "nieobecna",
      ])
      .optional(),
    baby_puppy_grade: z
      .enum(["bardzo_obiecujący", "obiecujący", "dość_obiecujący"])
      .optional(),
    club_title: z
      .enum([
        "młodzieżowy_zwycięzca_klubu",
        "zwycięzca_klubu",
        "zwycięzca_klubu_weteranów",
        "najlepszy_reproduktor",
        "najlepsza_suka_hodowlana",
        "najlepsza_para",
        "najlepsza_hodowla",
        "zwycięzca_rasy",
        "zwycięzca_płci_przeciwnej",
        "najlepszy_junior",
        "najlepszy_weteran",
      ])
      .optional(),
    placement: z.enum(["1st", "2nd", "3rd", "4th"]).optional(),
  })
  .refine(
    (data) => {
      // Walidacja zgodności klasy z oceną
      if (["baby", "puppy"].includes(data.dog_class)) {
        return data.baby_puppy_grade && !data.grade;
      } else {
        return data.grade && !data.baby_puppy_grade;
      }
    },
    {
      message:
        "Baby/Puppy classes must use baby_puppy_grade, other classes must use grade",
    },
  );
````

### 7.2 Logika biznesowa

**Adaptacje z archiwizowanych serwisów**:

```typescript
// ShowService - uproszczenie
export class ShowService {
  async createShow(data: CreateShowDto): Promise<Show> {
    // Walidacja dat
    if (new Date(data.registration_deadline) > new Date(data.show_date)) {
      throw new Error("Registration deadline must be before show date");
    }

    // Automatyczne ustawienie statusu draft
    const show = await this.supabase
      .from("shows")
      .insert({
        ...data,
        status: "draft",
      })
      .select()
      .single();

    return show;
  }

  async updateShowStatus(id: string, status: ShowStatus): Promise<Show> {
    // Walidacja przejść statusów
    const currentShow = await this.getShow(id);

    if (currentShow.status === "completed" && status !== "completed") {
      throw new Error("Cannot change status of completed show");
    }

    return await this.supabase
      .from("shows")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
  }
}

// EvaluationService - przeniesienie z opisów
export class EvaluationService {
  async createEvaluation(
    showId: string,
    data: CreateEvaluationDto,
  ): Promise<Evaluation> {
    // Sprawdzenie czy pies jest zarejestrowany na wystawę
    const registration = await this.supabase
      .from("show_registrations")
      .select()
      .eq("show_id", showId)
      .eq("dog_id", data.dog_id)
      .single();

    if (!registration) {
      throw new Error("Dog must be registered for show before evaluation");
    }

    // Walidacja wieku względem klasy
    const dog = await this.dogService.getDog(data.dog_id);
    const show = await this.showService.getShow(showId);

    if (
      !this.validateDogClass(dog.birth_date, show.show_date, data.dog_class)
    ) {
      throw new Error("Dog class does not match age");
    }

    return await this.supabase
      .from("evaluations")
      .insert({
        show_id: showId,
        ...data,
      })
      .select()
      .single();
  }
}
```

## 8. Harmonogram implementacji

### 8.1 Faza 1: Podstawowa infrastruktura

- Authentication & Users Management
- Shows Management
- Dogs Management
- Owners Management

### 8.2 Faza 2: System ocen

- Evaluations Management
- Statistics & Reports
- GDPR Compliance
- Testowanie i debugowanie

### 8.3 Faza 3: Finalizacja

- Integracja i testy end-to-end
- Dokumentacja i optymalizacja

## 9. Podsumowanie

Plan implementacji API dla Klub Hovawarta Show został oparty na analizie archiwizowanych endpointów z uproszczeniami dostosowanymi do potrzeb klubu hovawartów. Kluczowe zmiany obejmują:

1. **Uproszczenie ról** - tylko jedna rola `club_board`
2. **Usunięcie systemu FCI** - skupienie na hovawartach
3. **Przeniesienie ocen** - z opisów do bezpośrednich ocen wystaw
4. **Tytuły klubowe** - specyficzne dla hovawartów
5. **Podstawowy system RODO** - zgodność z wymaganiami prawnymi
6. **System uprawnień oparty na autoryzacji i statusie wystawy** - kontrola dostępu do edycji
7. **Tryb podglądu dla użytkowników niezalogowanych** - dostęp tylko do odczytu
8. **Usunięcie systemu płatności** - uproszczenie zgodnie z wymaganiami MVP

Implementacja będzie przebiegać w 3 fazy funkcjonalne, wykorzystując sprawdzone wzorce z archiwizowanych endpointów przy jednoczesnym dostosowaniu do uproszczonych wymagań klubu hovawartów.
