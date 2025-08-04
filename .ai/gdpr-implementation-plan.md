# API Endpoint Implementation Plan: GDPR Compliance

## 1. Przegląd punktów końcowych

System zgodności z RODO (GDPR) dla aplikacji 10x Dog Show, obejmujący zarządzanie zgodami, eksport danych, usuwanie danych i automatyczne przetwarzanie zgodnie z wymaganiami prawnymi. System zapewnia pełną zgodność z rozporządzeniem GDPR i automatyczne zarządzanie danymi osobowymi.

### Consent Management

- Zarządzanie zgodami na przetwarzanie danych osobowych
- Śledzenie historii zmian zgód z timestampami
- Automatyczne wycofywanie zgód
- Walidacja zgodności z wymaganiami prawnymi

### Data Export & Deletion

- Eksport danych osobowych w formacie JSON
- Usuwanie danych osobowych na żądanie
- Automatyczne planowanie usuwania danych
- Śledzenie statusu żądań RODO

### Data Retention

- Automatyczne usuwanie danych po 3 latach
- Harmonogram retencji danych
- Audyt procesów usuwania
- Zgodność z polityką retencji

## 2. Szczegóły żądań

### 2.1 Consent Management Endpoints

#### POST /gdpr/consent

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/consent`
- **Request Body:** GdprConsentDto
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Udzielenie zgody na przetwarzanie danych osobowych

#### POST /gdpr/withdraw

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/withdraw`
- **Request Body:** GdprWithdrawDto
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Wycofanie zgody na przetwarzanie danych osobowych

#### GET /gdpr/consent/{ownerId}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/gdpr/consent/{ownerId}`
- **Parametry:** `ownerId` (UUID) - Identyfikator właściciela
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Historia zgód właściciela

### 2.2 Data Export Endpoints

#### POST /gdpr/export

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/export`
- **Request Body:** GdprExportRequestDto
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Żądanie eksportu danych osobowych

#### GET /gdpr/export/{requestId}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/gdpr/export/{requestId}`
- **Parametry:** `requestId` (UUID) - Identyfikator żądania
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Status żądania eksportu

#### GET /gdpr/export/{requestId}/download

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/gdpr/export/{requestId}/download`
- **Parametry:** `requestId` (UUID) - Identyfikator żądania
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Pobranie pliku z eksportem danych

### 2.3 Data Deletion Endpoints

#### POST /gdpr/delete

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/delete`
- **Request Body:** GdprDeleteRequestDto
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Żądanie usunięcia danych osobowych

#### GET /gdpr/delete/{requestId}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/gdpr/delete/{requestId}`
- **Parametry:** `requestId` (UUID) - Identyfikator żądania
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Status żądania usunięcia

#### POST /gdpr/delete/{requestId}/confirm

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/delete/{requestId}/confirm`
- **Parametry:** `requestId` (UUID) - Identyfikator żądania
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Potwierdzenie usunięcia danych

### 2.4 Data Retention Endpoints

#### GET /gdpr/retention/schedule

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/gdpr/retention/schedule`
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Harmonogram retencji danych

#### POST /gdpr/retention/process

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/gdpr/retention/process`
- **Autoryzacja:** Przedstawiciele oddziałów
- **Opis:** Ręczne uruchomienie procesu retencji

## 3. Wykorzystywane typy

### 3.1 Consent Management DTOs

```typescript
// Udzielenie zgody
interface GdprConsentDto {
  owner_id: string;
  consent_type: "data_processing" | "marketing" | "third_party";
  consent_given: boolean;
  consent_reason?: string;
}

// Wycofanie zgody
interface GdprWithdrawDto {
  owner_id: string;
  consent_type: "data_processing" | "marketing" | "third_party";
  withdrawal_reason?: string;
}

// Historia zgód
interface GdprConsentHistoryDto {
  owner_id: string;
  consents: {
    id: string;
    consent_type: string;
    consent_given: boolean;
    consent_date: string;
    withdrawal_date?: string;
    reason?: string;
  }[];
}

// Odpowiedź zgody
interface GdprConsentResponseDto {
  message: string;
  consent_date: string;
  owner_id: string;
  consent_type: string;
}
```

### 3.2 Data Export DTOs

```typescript
// Żądanie eksportu
interface GdprExportRequestDto {
  owner_id: string;
  export_format?: "json" | "csv" | "xml";
  include_related_data?: boolean;
}

// Status eksportu
interface GdprExportStatusDto {
  request_id: string;
  owner_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  file_url?: string;
  file_size?: number;
  error_message?: string;
}

// Odpowiedź eksportu
interface GdprExportResponseDto {
  request_id: string;
  message: string;
  status: string;
  estimated_completion_time?: string;
}
```

### 3.3 Data Deletion DTOs

```typescript
// Żądanie usunięcia
interface GdprDeleteRequestDto {
  owner_id: string;
  deletion_reason?: string;
  immediate_deletion?: boolean;
}

// Status usunięcia
interface GdprDeleteStatusDto {
  request_id: string;
  owner_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  scheduled_deletion_date?: string;
  completed_at?: string;
  error_message?: string;
}

// Odpowiedź usunięcia
interface GdprDeleteResponseDto {
  request_id: string;
  message: string;
  status: string;
  deletion_date?: string;
}
```

### 3.4 Data Retention DTOs

```typescript
// Harmonogram retencji
interface GdprRetentionScheduleDto {
  entity_type: "show" | "dog" | "owner" | "description";
  retention_period_days: number;
  records_to_delete: number;
  next_cleanup_date: string;
  last_cleanup_date?: string;
}

// Status procesu retencji
interface GdprRetentionProcessDto {
  process_id: string;
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_deleted: number;
  error_message?: string;
}
```

## 4. Logika biznesowa

### 4.1 Consent Management Logic

#### Udzielenie zgody:

1. **Walidacja danych:**

   - Sprawdzenie istnienia właściciela
   - Walidacja typu zgody
   - Sprawdzenie czy zgoda już istnieje

2. **Proces udzielenia zgody:**

   - Aktualizacja gdpr_consent w dog_shows.owners
   - Ustawienie gdpr_consent_date
   - Logowanie w audit.gdpr_requests
   - Wysłanie emaila potwierdzającego

3. **Walidacja zgodności:**
   - Sprawdzenie czy zgoda jest dobrowolna
   - Weryfikacja wieku właściciela (jeśli dotyczy)
   - Walidacja języka zgody

#### Wycofanie zgody:

1. **Walidacja:**

   - Sprawdzenie czy zgoda istnieje
   - Weryfikacja uprawnień do wycofania

2. **Proces wycofania:**
   - Ustawienie gdpr_consent = false
   - Zapisywanie withdrawal_date
   - Logowanie w audit.gdpr_requests
   - Zaplanowanie usunięcia danych (30 dni)

### 4.2 Data Export Logic

#### Żądanie eksportu:

1. **Walidacja:**

   - Sprawdzenie istnienia właściciela
   - Weryfikacja uprawnień
   - Sprawdzenie limitu żądań (1 na 30 dni)

2. **Proces eksportu:**

   - Tworzenie żądania w audit.gdpr_requests
   - Asynchroniczne generowanie pliku
   - Zbieranie wszystkich danych właściciela
   - Formatowanie do JSON/CSV/XML

3. **Dane do eksportu:**
   - Dane właściciela (owners)
   - Psy właściciela (dogs)
   - Rejestracje na wystawy (show_registrations)
   - Opisy psów (descriptions)
   - Historia zgód (gdpr_requests)

#### Generowanie pliku:

1. **Struktura eksportu:**
   ```json
   {
     "export_info": {
       "request_id": "uuid",
       "export_date": "2024-01-15T10:30:00Z",
       "owner_id": "uuid"
     },
     "owner_data": {
       "personal_info": {
         /* dane właściciela */
       },
       "dogs": [
         /* lista psów */
       ],
       "registrations": [
         /* rejestracje */
       ],
       "descriptions": [
         /* opisy */
       ],
       "consent_history": [
         /* historia zgód */
       ]
     }
   }
   ```

### 4.3 Data Deletion Logic

#### Żądanie usunięcia:

1. **Walidacja:**

   - Sprawdzenie istnienia właściciela
   - Weryfikacja uprawnień
   - Sprawdzenie czy nie ma aktywnych wystaw

2. **Proces usunięcia:**

   - Tworzenie żądania w audit.gdpr_requests
   - Jeśli immediate_deletion = true: natychmiastowe usunięcie
   - W przeciwnym razie: zaplanowanie na 30 dni

3. **Usuwanie danych:**
   - Soft delete wszystkich rekordów
   - Ustawienie scheduled_for_deletion = true
   - Logowanie w audit.activity_log
   - Wysłanie emaila potwierdzającego

#### Automatyczne usunięcie:

1. **Proces cron:**
   - Codzienne sprawdzanie scheduled_for_deletion
   - Usuwanie rekordów starszych niż 30 dni
   - Logowanie procesu usuwania

### 4.4 Data Retention Logic

#### Harmonogram retencji:

1. **Polityka retencji:**

   - Wystawy: 3 lata po zakończeniu
   - Opisy: 3 lata po finalizacji
   - Rejestracje: 3 lata po wystawie
   - Dane właścicieli: 3 lata po ostatniej aktywności

2. **Automatyczny proces:**
   - Codzienne sprawdzanie audit.data_retention_schedule
   - Usuwanie rekordów po przekroczeniu retention_date
   - Logowanie procesu retencji

## 5. Implementacja serwisów

### 5.1 GdprService

```typescript
class GdprService {
  // Consent Management
  async grantConsent(data: GdprConsentDto): Promise<GdprConsentResponseDto> {
    // Implementacja udzielenia zgody
  }

  async withdrawConsent(
    data: GdprWithdrawDto,
  ): Promise<GdprConsentResponseDto> {
    // Implementacja wycofania zgody
  }

  async getConsentHistory(ownerId: string): Promise<GdprConsentHistoryDto> {
    // Implementacja historii zgód
  }

  // Data Export
  async requestExport(
    data: GdprExportRequestDto,
  ): Promise<GdprExportResponseDto> {
    // Implementacja żądania eksportu
  }

  async getExportStatus(requestId: string): Promise<GdprExportStatusDto> {
    // Implementacja statusu eksportu
  }

  async generateExportFile(requestId: string): Promise<string> {
    // Implementacja generowania pliku
  }

  // Data Deletion
  async requestDeletion(
    data: GdprDeleteRequestDto,
  ): Promise<GdprDeleteResponseDto> {
    // Implementacja żądania usunięcia
  }

  async getDeletionStatus(requestId: string): Promise<GdprDeleteStatusDto> {
    // Implementacja statusu usunięcia
  }

  async confirmDeletion(requestId: string): Promise<GdprDeleteResponseDto> {
    // Implementacja potwierdzenia usunięcia
  }

  // Data Retention
  async getRetentionSchedule(): Promise<GdprRetentionScheduleDto[]> {
    // Implementacja harmonogramu retencji
  }

  async processRetention(): Promise<GdprRetentionProcessDto> {
    // Implementacja procesu retencji
  }
}
```

## 6. Zapytania SQL

### 6.1 Consent Management Queries

```sql
-- Udzielenie zgody
UPDATE dog_shows.owners
SET gdpr_consent = true,
    gdpr_consent_date = NOW(),
    updated_at = NOW()
WHERE id = $1;

-- Logowanie zgody
INSERT INTO audit.gdpr_requests (
  owner_id, request_type, status, requested_at, processed_by
) VALUES (
  $1, 'consent_granted', 'completed', NOW(), $2
);

-- Historia zgód
SELECT
  gr.id, gr.request_type, gr.status, gr.requested_at,
  gr.processed_at, gr.notes
FROM audit.gdpr_requests gr
WHERE gr.owner_id = $1
ORDER BY gr.requested_at DESC;
```

### 6.2 Data Export Queries

```sql
-- Zbieranie danych do eksportu
WITH owner_data AS (
  SELECT
    o.id, o.first_name, o.last_name, o.email, o.phone,
    o.address, o.city, o.postal_code, o.country,
    o.kennel_name, o.language, o.gdpr_consent,
    o.gdpr_consent_date, o.created_at, o.updated_at
  FROM dog_shows.owners o
  WHERE o.id = $1
),
dogs_data AS (
  SELECT
    d.id, d.name, d.gender, d.birth_date, d.microchip_number,
    d.kennel_club_number, d.kennel_name, d.father_name,
    d.mother_name, d.created_at, d.updated_at,
    b.name_pl as breed_name_pl, b.name_en as breed_name_en
  FROM dog_shows.dogs d
  JOIN dictionary.breeds b ON d.breed_id = b.id
  JOIN dog_shows.dog_owners do ON d.id = do.dog_id
  WHERE do.owner_id = $1
),
registrations_data AS (
  SELECT
    sr.id, sr.dog_class, sr.catalog_number, sr.registration_fee,
    sr.is_paid, sr.registered_at,
    s.name as show_name, s.show_date, s.show_type
  FROM dog_shows.show_registrations sr
  JOIN dog_shows.dogs d ON sr.dog_id = d.id
  JOIN dog_shows.dog_owners do ON d.id = do.dog_id
  JOIN dog_shows.shows s ON sr.show_id = s.id
  WHERE do.owner_id = $1
)
SELECT
  json_build_object(
    'owner', (SELECT row_to_json(owner_data.*) FROM owner_data),
    'dogs', (SELECT json_agg(row_to_json(dogs_data.*)) FROM dogs_data),
    'registrations', (SELECT json_agg(row_to_json(registrations_data.*)) FROM registrations_data)
  ) as export_data;
```

### 6.3 Data Deletion Queries

```sql
-- Zaplanowanie usunięcia danych
UPDATE dog_shows.owners
SET scheduled_for_deletion = true,
    updated_at = NOW()
WHERE id = $1;

-- Logowanie żądania usunięcia
INSERT INTO audit.gdpr_requests (
  owner_id, request_type, status, requested_at, processed_by, notes
) VALUES (
  $1, 'data_deletion', 'pending', NOW(), $2, $3
);

-- Automatyczne usunięcie zaplanowanych rekordów
UPDATE dog_shows.owners
SET deleted_at = NOW()
WHERE scheduled_for_deletion = true
  AND gdpr_consent_date < NOW() - INTERVAL '30 days';
```

### 6.4 Data Retention Queries

```sql
-- Harmonogram retencji
SELECT
  'show' as entity_type,
  COUNT(*) as records_to_delete,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM dog_shows.shows
WHERE created_at < NOW() - INTERVAL '3 years'
  AND deleted_at IS NULL;

-- Proces retencji
UPDATE dog_shows.shows
SET scheduled_for_deletion = true,
    updated_at = NOW()
WHERE created_at < NOW() - INTERVAL '3 years'
  AND deleted_at IS NULL;

-- Logowanie procesu retencji
INSERT INTO audit.data_retention_schedule (
  entity_type, entity_id, retention_date, deletion_scheduled_at
)
SELECT
  'show', id, (created_at + INTERVAL '3 years')::DATE, NOW()
FROM dog_shows.shows
WHERE created_at < NOW() - INTERVAL '3 years'
  AND deleted_at IS NULL
  AND scheduled_for_deletion = false;
```

## 7. Email Notifications

### 7.1 Email Templates

```typescript
// Template dla udzielenia zgody
const consentGrantedTemplate = {
  subject: "Potwierdzenie udzielenia zgody na przetwarzanie danych",
  body: `
    Szanowny/a ${ownerName},
    
    Potwierdzamy udzielenie zgody na przetwarzanie danych osobowych w systemie 10x Dog Show.
    
    Szczegóły zgody:
    - Data udzielenia: ${consentDate}
    - Typ zgody: ${consentType}
    - Możliwość wycofania: W każdej chwili
    
    W razie pytań prosimy o kontakt.
    
    Pozdrawiamy,
    Zespół 10x Dog Show
  `,
};

// Template dla wycofania zgody
const consentWithdrawnTemplate = {
  subject: "Potwierdzenie wycofania zgody na przetwarzanie danych",
  body: `
    Szanowny/a ${ownerName},
    
    Potwierdzamy wycofanie zgody na przetwarzanie danych osobowych.
    
    Szczegóły:
    - Data wycofania: ${withdrawalDate}
    - Typ zgody: ${consentType}
    - Usunięcie danych: W ciągu 30 dni
    
    Pozdrawiamy,
    Zespół 10x Dog Show
  `,
};

// Template dla eksportu danych
const dataExportTemplate = {
  subject: "Eksport danych osobowych - gotowy do pobrania",
  body: `
    Szanowny/a ${ownerName},
    
    Twój eksport danych osobowych jest gotowy do pobrania.
    
    Szczegóły:
    - ID żądania: ${requestId}
    - Link do pobrania: ${downloadUrl}
    - Ważność linku: 7 dni
    
    Pozdrawiamy,
    Zespół 10x Dog Show
  `,
};
```

## 8. Walidacja danych

### 8.1 GDPR Schemas

```typescript
// Schemat udzielenia zgody
const gdprConsentSchema = z.object({
  owner_id: z.string().uuid("Nieprawidłowy ID właściciela"),
  consent_type: z.enum(["data_processing", "marketing", "third_party"], {
    errorMap: () => ({ message: "Nieprawidłowy typ zgody" }),
  }),
  consent_given: z.boolean(),
  consent_reason: z.string().max(500).optional(),
});

// Schemat żądania eksportu
const gdprExportSchema = z.object({
  owner_id: z.string().uuid("Nieprawidłowy ID właściciela"),
  export_format: z.enum(["json", "csv", "xml"]).default("json"),
  include_related_data: z.boolean().default(true),
});

// Schemat żądania usunięcia
const gdprDeleteSchema = z.object({
  owner_id: z.string().uuid("Nieprawidłowy ID właściciela"),
  deletion_reason: z.string().max(500).optional(),
  immediate_deletion: z.boolean().default(false),
});
```

## 9. Obsługa błędów

### 9.1 GDPR Errors

```typescript
// Błędy GDPR
const GDPR_ERRORS = {
  OWNER_NOT_FOUND: {
    code: "OWNER_NOT_FOUND",
    message: "Właściciel nie został znaleziony",
    status: 404,
  },
  CONSENT_ALREADY_EXISTS: {
    code: "CONSENT_ALREADY_EXISTS",
    message: "Zgoda już została udzielona",
    status: 409,
  },
  CONSENT_NOT_FOUND: {
    code: "CONSENT_NOT_FOUND",
    message: "Zgoda nie została znaleziona",
    status: 404,
  },
  EXPORT_LIMIT_EXCEEDED: {
    code: "EXPORT_LIMIT_EXCEEDED",
    message: "Przekroczono limit żądań eksportu (1 na 30 dni)",
    status: 429,
  },
  ACTIVE_SHOWS_EXIST: {
    code: "ACTIVE_SHOWS_EXIST",
    message: "Nie można usunąć danych - właściciel ma aktywne wystawy",
    status: 400,
  },
  DELETION_IN_PROGRESS: {
    code: "DELETION_IN_PROGRESS",
    message: "Usunięcie danych jest już w toku",
    status: 409,
  },
  INSUFFICIENT_PERMISSIONS: {
    code: "INSUFFICIENT_PERMISSIONS",
    message: "Brak uprawnień do wykonania tej operacji",
    status: 403,
  },
};
```

## 10. Testy

### 10.1 Unit Tests

```typescript
describe("GdprService", () => {
  describe("grantConsent", () => {
    it("should grant consent successfully", async () => {
      // Test udzielenia zgody
    });

    it("should throw error for non-existent owner", async () => {
      // Test nieistniejącego właściciela
    });

    it("should throw error for duplicate consent", async () => {
      // Test duplikatu zgody
    });
  });

  describe("requestExport", () => {
    it("should create export request successfully", async () => {
      // Test żądania eksportu
    });

    it("should throw error for export limit exceeded", async () => {
      // Test limitu eksportu
    });
  });

  describe("requestDeletion", () => {
    it("should create deletion request successfully", async () => {
      // Test żądania usunięcia
    });

    it("should throw error for owner with active shows", async () => {
      // Test właściciela z aktywnymi wystawami
    });
  });
});
```

### 10.2 Integration Tests

```typescript
describe("GDPR API", () => {
  describe("POST /api/gdpr/consent", () => {
    it("should grant consent", async () => {
      // Test endpointu zgody
    });
  });

  describe("POST /api/gdpr/export", () => {
    it("should create export request", async () => {
      // Test endpointu eksportu
    });
  });

  describe("POST /api/gdpr/delete", () => {
    it("should create deletion request", async () => {
      // Test endpointu usunięcia
    });
  });
});
```

## 11. Monitoring i audyt

### 11.1 Audit Logging

```typescript
// Logowanie akcji GDPR
const logGdprAction = async (
  action: string,
  ownerId: string,
  metadata: any,
) => {
  await supabase.from("audit.activity_log").insert({
    action: action,
    entity_type: "owner",
    entity_id: ownerId,
    metadata: metadata,
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
  });
};

// Przykłady logowania
await logGdprAction("consent_granted", ownerId, {
  consent_type: "data_processing",
});
await logGdprAction("data_export_requested", ownerId, { format: "json" });
await logGdprAction("data_deletion_requested", ownerId, { immediate: false });
```

### 11.2 GDPR Metrics

```typescript
// Metryki GDPR
const gdprMetrics = {
  // Liczba zgód
  consentsGranted: new Counter(
    "gdpr_consents_granted_total",
    "Total consents granted",
  ),
  consentsWithdrawn: new Counter(
    "gdpr_consents_withdrawn_total",
    "Total consents withdrawn",
  ),

  // Eksporty danych
  exportRequests: new Counter(
    "gdpr_export_requests_total",
    "Total export requests",
  ),
  exportCompletions: new Counter(
    "gdpr_export_completions_total",
    "Total export completions",
  ),

  // Usunięcia danych
  deletionRequests: new Counter(
    "gdpr_deletion_requests_total",
    "Total deletion requests",
  ),
  deletionCompletions: new Counter(
    "gdpr_deletion_completions_total",
    "Total deletion completions",
  ),

  // Czas przetwarzania
  exportProcessingTime: new Histogram(
    "gdpr_export_processing_time",
    "Export processing time",
  ),
  deletionProcessingTime: new Histogram(
    "gdpr_deletion_processing_time",
    "Deletion processing time",
  ),
};
```

## 12. Dokumentacja API

### 12.1 OpenAPI/Swagger

```yaml
paths:
  /api/gdpr/consent:
    post:
      summary: Udzielenie zgody na przetwarzanie danych
      tags: [GDPR]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/GdprConsentDto"
      responses:
        "200":
          description: Zgoda została udzielona
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GdprConsentResponseDto"
        "400":
          description: Błąd walidacji danych
        "404":
          description: Właściciel nie został znaleziony

  /api/gdpr/export:
    post:
      summary: Żądanie eksportu danych osobowych
      tags: [GDPR]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/GdprExportRequestDto"
      responses:
        "200":
          description: Żądanie eksportu zostało utworzone
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GdprExportResponseDto"
        "429":
          description: Przekroczono limit żądań eksportu

  /api/gdpr/delete:
    post:
      summary: Żądanie usunięcia danych osobowych
      tags: [GDPR]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/GdprDeleteRequestDto"
      responses:
        "200":
          description: Żądanie usunięcia zostało utworzone
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GdprDeleteResponseDto"
        "400":
          description: Właściciel ma aktywne wystawy
```

## 13. Deployment i konfiguracja

### 13.1 Environment Variables

```bash
# GDPR Configuration
GDPR_RETENTION_PERIOD_DAYS=1095  # 3 lata
GDPR_DELETION_GRACE_PERIOD_DAYS=30
GDPR_EXPORT_LIMIT_DAYS=30
GDPR_EXPORT_FILE_RETENTION_DAYS=7

# Email Configuration
GDPR_EMAIL_FROM=noreply@dogshow.pl
GDPR_EMAIL_TEMPLATES_PATH=/templates/gdpr

# Storage Configuration
GDPR_EXPORT_BUCKET=gdpr-exports
GDPR_EXPORT_REGION=eu-central-1

# Processing Configuration
GDPR_BATCH_SIZE=100
GDPR_MAX_PROCESSING_TIME=300  # 5 minut
```

### 13.2 Cron Jobs

```typescript
// Cron job dla retencji danych (codziennie o 2:00)
const retentionCron = "0 2 * * *";

// Cron job dla usuwania zaplanowanych rekordów (codziennie o 3:00)
const deletionCron = "0 3 * * *";

// Cron job dla czyszczenia starych eksportów (codziennie o 4:00)
const cleanupCron = "0 4 * * *";

// Implementacja cron jobs
cron.schedule(retentionCron, async () => {
  await gdprService.processRetention();
});

cron.schedule(deletionCron, async () => {
  await gdprService.processScheduledDeletions();
});

cron.schedule(cleanupCron, async () => {
  await gdprService.cleanupOldExports();
});
```

## 14. Podsumowanie

Ten plan implementacji zapewnia:

### ✅ **Funkcjonalności Consent Management:**

- Udzielanie i wycofywanie zgód na przetwarzanie danych
- Śledzenie historii zgód z timestampami
- Automatyczne powiadomienia email
- Walidacja zgodności z wymaganiami prawnymi

### ✅ **Funkcjonalności Data Export:**

- Eksport danych osobowych w formatach JSON/CSV/XML
- Asynchroniczne generowanie plików eksportu
- Śledzenie statusu żądań eksportu
- Automatyczne czyszczenie starych plików

### ✅ **Funkcjonalności Data Deletion:**

- Żądania usunięcia danych osobowych
- Automatyczne planowanie usunięcia (30 dni)
- Potwierdzenie usunięcia danych
- Śledzenie statusu żądań usunięcia

### ✅ **Funkcjonalności Data Retention:**

- Automatyczne usuwanie danych po 3 latach
- Harmonogram retencji danych
- Procesy cron dla automatycznego czyszczenia
- Audyt procesów retencji

### ✅ **Zgodność z RODO:**

- Pełna zgodność z rozporządzeniem GDPR
- Automatyczne zarządzanie danymi osobowymi
- Transparentność procesów
- Prawa użytkowników (dostęp, usunięcie, przenoszenie)

### ✅ **Bezpieczeństwo i audyt:**

- Szczegółowe logowanie wszystkich akcji GDPR
- Metryki i monitoring procesów
- Walidacja uprawnień
- Szyfrowanie danych eksportu

**Następne kroki:** Implementacja endpointów zgodnie z tym planem, konfiguracja cron jobs, testy zgodności z RODO, dokumentacja procesów prawnych.
