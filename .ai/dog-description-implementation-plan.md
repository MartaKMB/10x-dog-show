# API Endpoint Implementation Plan: Descriptions Management + Evaluation Management

## 1. Przegląd punktów końcowych

Kompleksowy system zarządzania opisami psów i ich ocenami podczas wystaw. System obejmuje pełny cykl życia opisu od tworzenia przez edycję, ocenianie, finalizację aż po generowanie PDF i wysyłanie emaili.

### Descriptions Management
- Tworzenie, edycja, przeglądanie i usuwanie opisów psów
- Wersjonowanie opisów z pełną historią zmian
- Finalizacja opisów (blokada edycji)
- Walidacja uprawnień sekretarzy do ras

### Evaluation Management  
- Tworzenie i aktualizacja ocen psów
- System ocen dostosowany do klas psów (baby/puppy vs inne klasy)
- Przydzielanie tytułów (CWC, CACIB) i lokat
- Walidacja reguł biznesowych ocen

## 2. Szczegóły żądań

### 2.1 Descriptions Management Endpoints

#### GET /descriptions
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/descriptions`
- **Parametry query:**
  - `show_id` (optional): Filtr po wystawie
  - `judge_id` (optional): Filtr po sędzi
  - `secretary_id` (optional): Filtr po sekretarzu
  - `is_final` (optional): Filtr po statusie finalizacji
  - `language` (optional): Filtr po języku
  - `page` (optional): Numer strony (default: 1)
  - `limit` (optional): Elementów na stronę (default: 20, max: 100)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### GET /descriptions/{id}
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/descriptions/{id}`
- **Parametry:** `id` (UUID) - Identyfikator opisu
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /descriptions
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/descriptions`
- **Request Body:** CreateDescriptionDto
- **Autoryzacja:** Sekretarze (rola: secretary)

#### PUT /descriptions/{id}
- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/descriptions/{id}`
- **Request Body:** UpdateDescriptionDto
- **Autoryzacja:** Sekretarze (tylko przed finalizacją)

#### PATCH /descriptions/{id}/finalize
- **Metoda HTTP:** PATCH
- **Struktura URL:** `/api/descriptions/{id}/finalize`
- **Autoryzacja:** Sekretarze (tylko przed zakończeniem wystawy)

#### GET /descriptions/{id}/versions
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/descriptions/{id}/versions`
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### DELETE /descriptions/{id}
- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/descriptions/{id}`
- **Autoryzacja:** Sekretarze (tylko przed finalizacją)

### 2.2 Evaluation Management Endpoints

#### POST /descriptions/{descriptionId}/evaluations
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/descriptions/{descriptionId}/evaluations`
- **Request Body:** CreateEvaluationDto
- **Autoryzacja:** Sekretarze

#### PUT /descriptions/{descriptionId}/evaluations
- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/descriptions/{descriptionId}/evaluations`
- **Request Body:** UpdateEvaluationDto
- **Autoryzacja:** Sekretarze (tylko przed finalizacją opisu)

### 2.3 PDF and Email Management Endpoints

#### GET /descriptions/{id}/pdf
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/descriptions/{id}/pdf`
- **Parametry query:** `language` (optional): Język PDF (pl/en)
- **Autoryzacja:** Wszyscy uwierzytelnieni użytkownicy

#### POST /descriptions/{id}/send-email
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/descriptions/{id}/send-email`
- **Request Body:** SendEmailDto
- **Autoryzacja:** Sekretarze

## 3. Wykorzystywane typy

### 3.1 Descriptions Management DTOs

```typescript
// Query Parameters
DescriptionQueryParams {
  show_id?: string;
  judge_id?: string;
  secretary_id?: string;
  is_final?: boolean;
  language?: Language;
  page?: number;
  limit?: number;
}

// Request DTOs
CreateDescriptionDto {
  show_id: string;
  dog_id: string;
  judge_id: string;
  content_pl?: string;
  content_en?: string;
}

UpdateDescriptionDto {
  content_pl?: string;
  content_en?: string;
}

// Response DTOs
DescriptionResponseDto {
  id: string;
  show: ShowSummaryDto;
  dog: DogSummaryDto;
  judge: JudgeSummaryDto;
  secretary: UserSummaryDto;
  content_pl?: string;
  content_en?: string;
  version: number;
  is_final: boolean;
  evaluation?: EvaluationResponseDto;
  created_at: string;
  updated_at: string;
  finalized_at?: string;
}

DescriptionDetailResponseDto extends DescriptionResponseDto {
  show: ShowDetailDto;
  dog: DogDetailDto;
  judge: JudgeDetailDto;
  secretary: UserDetailDto;
}

DescriptionVersionDto {
  id: string;
  version: number;
  content_pl?: string;
  content_en?: string;
  changed_by: UserSummaryDto;
  change_reason?: string;
  created_at: string;
  changed_fields: string[];
}

PaginatedResponseDto<DescriptionResponseDto>;
```

### 3.2 Evaluation Management DTOs

```typescript
// Request DTOs
CreateEvaluationDto {
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  title?: TitleType;
  placement?: Placement;
  points?: number;
  is_best_in_group?: boolean;
  is_best_in_show?: boolean;
}

UpdateEvaluationDto {
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  title?: TitleType;
  placement?: Placement;
  points?: number;
  is_best_in_group?: boolean;
  is_best_in_show?: boolean;
}

// Response DTOs
EvaluationResponseDto {
  id: string;
  description_id: string;
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  title?: TitleType;
  placement?: Placement;
  points?: number;
  is_best_in_group: boolean;
  is_best_in_show: boolean;
  judge_signature?: string;
  created_at: string;
  updated_at: string;
}
```

### 3.3 PDF and Email DTOs

```typescript
// Request DTOs
SendEmailDto {
  language?: Language;
  recipient_email?: string;
}

// Response DTOs
PDFResponseDto {
  pdf_url: string;
  file_name: string;
  generated_at: string;
}

EmailResponseDto {
  message: string;
  sent_to: string;
  sent_at: string;
}
```

### 3.4 Wspólne typy

```typescript
// Enums
DogClass: 'baby' | 'puppy' | 'junior' | 'intermediate' | 'open' | 'working' | 'champion' | 'veteran';
EvaluationGrade: 'excellent' | 'very_good' | 'good' | 'satisfactory' | 'disqualified' | 'absent';
BabyPuppyGrade: 'very_promising' | 'promising' | 'quite_promising';
TitleType: 'CWC' | 'CACIB' | 'res_CWC' | 'res_CACIB';
Placement: '1st' | '2nd' | '3rd' | '4th';
Language: 'pl' | 'en';

// Summary DTOs
ShowSummaryDto {
  id: string;
  name: string;
  show_date: string;
}

DogSummaryDto {
  id: string;
  name: string;
  breed: BreedSummaryDto;
}

JudgeSummaryDto {
  id: string;
  name: string;
}

UserSummaryDto {
  id: string;
  name: string;
}
```

## 4. Szczegóły odpowiedzi

### 4.1 Kody statusu HTTP
- **200 OK:** Pomyślne operacje odczytu i aktualizacji
- **201 Created:** Pomyślne utworzenie nowego zasobu
- **400 Bad Request:** Błędy walidacji danych wejściowych
- **401 Unauthorized:** Brak lub nieprawidłowy token uwierzytelniający
- **403 Forbidden:** Brak uprawnień do wykonania operacji
- **404 Not Found:** Zasób nie został znaleziony
- **409 Conflict:** Opis już istnieje dla tej kombinacji
- **422 Unprocessable Entity:** Wystawa zakończona, opis sfinalizowany
- **500 Internal Server Error:** Błędy serwera

### 4.2 Przykłady odpowiedzi

#### GET /descriptions (200 OK)
```json
{
  "descriptions": [
    {
      "id": "uuid",
      "show": {
        "id": "uuid",
        "name": "National Dog Show Warsaw 2024",
        "show_date": "2024-03-15"
      },
      "dog": {
        "id": "uuid",
        "name": "Bella",
        "breed": {
          "name_pl": "Labrador retriever",
          "fci_group": "G8"
        }
      },
      "judge": {
        "id": "uuid",
        "name": "Dr. Smith"
      },
      "secretary": {
        "id": "uuid",
        "name": "John Doe"
      },
      "content_pl": "Bardzo dobry przedstawiciel rasy...",
      "content_en": "Very good representative of the breed...",
      "version": 2,
      "is_final": false,
      "evaluation": {
        "grade": "very_good",
        "title": "CWC",
        "placement": "2nd",
        "points": 85
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 67,
    "pages": 4
  }
}
```

#### POST /descriptions/{descriptionId}/evaluations (201 Created)
```json
{
  "id": "uuid",
  "description_id": "uuid",
  "dog_class": "open",
  "grade": "very_good",
  "title": "CWC",
  "placement": "2nd",
  "points": 85,
  "is_best_in_group": false,
  "is_best_in_show": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET /descriptions/{id}/pdf (200 OK)
```json
{
  "pdf_url": "https://storage.supabase.co/bucket/pdfs/description-uuid.pdf",
  "file_name": "description-bella-warsaw-2024.pdf",
  "generated_at": "2024-01-15T11:30:00Z"
}
```

## 5. Przepływ danych

### 5.1 Descriptions Management Flow

#### POST /descriptions:
1. **Walidacja danych wejściowych** - sprawdzenie wymaganych pól
2. **Walidacja biznesowa** - status wystawy, uprawnienia sekretarza
3. **Sprawdzenie duplikatu** - czy opis już istnieje
4. **Transakcja** - utworzenie opisu + pierwszej wersji
5. **Audyt** - logowanie operacji
6. **Odpowiedź** - zwrócenie utworzonego opisu

#### PUT /descriptions/{id}:
1. **Sprawdzenie istnienia** - czy opis istnieje
2. **Walidacja stanu** - czy można edytować (nie sfinalizowany)
3. **Walidacja uprawnień** - czy sekretarz ma dostęp
4. **Wersjonowanie** - utworzenie nowej wersji
5. **Aktualizacja** - zapisanie zmian
6. **Odpowiedź** - zwrócenie zaktualizowanego opisu

#### PATCH /descriptions/{id}/finalize:
1. **Sprawdzenie istnienia** - czy opis istnieje
2. **Walidacja stanu** - czy można sfinalizować
3. **Walidacja kompletności** - czy opis jest kompletny
4. **Finalizacja** - ustawienie is_final = true
5. **Audyt** - logowanie finalizacji
6. **Odpowiedź** - potwierdzenie finalizacji

### 5.2 Evaluation Management Flow

#### POST /descriptions/{descriptionId}/evaluations:
1. **Sprawdzenie opisu** - czy opis istnieje i nie jest sfinalizowany
2. **Walidacja oceny** - zgodność z klasą psa
3. **Walidacja reguł biznesowych** - tytuły, lokaty, punkty
4. **Utworzenie/aktualizacja** - zapisanie oceny
5. **Odpowiedź** - zwrócenie oceny

#### PUT /descriptions/{descriptionId}/evaluations:
1. **Sprawdzenie oceny** - czy ocena istnieje
2. **Walidacja stanu** - czy można edytować
3. **Walidacja danych** - nowe wartości oceny
4. **Aktualizacja** - zapisanie zmian
5. **Odpowiedź** - zwrócenie zaktualizowanej oceny

### 5.3 PDF and Email Flow

#### GET /descriptions/{id}/pdf:
1. **Sprawdzenie opisu** - czy opis istnieje
2. **Generowanie PDF** - utworzenie dokumentu
3. **Upload do storage** - zapisanie pliku
4. **Odpowiedź** - zwrócenie URL do PDF

#### POST /descriptions/{id}/send-email:
1. **Sprawdzenie opisu** - czy opis istnieje
2. **Generowanie PDF** - jeśli nie istnieje
3. **Wysyłanie email** - przez Resend API
4. **Logowanie** - zapisanie informacji o wysłaniu
5. **Odpowiedź** - potwierdzenie wysłania

## 6. Względy bezpieczeństwa

### 6.1 Autoryzacja i uwierzytelnianie
- **JWT Token Validation:** Sprawdzanie tokenu w headerze
- **Role-based Access Control:** Sekretarze dla edycji, wszyscy dla odczytu
- **Row Level Security (RLS):** Polityki na poziomie bazy danych

### 6.2 Walidacja danych wejściowych
- **Zod Schemas:** Walidacja wszystkich DTOs
- **Content Validation:** Sanityzacja treści opisów
- **Business Rule Validation:** Reguły ocen i tytułów
- **SQL Injection Prevention:** Parametryzowane zapytania

### 6.3 Walidacja biznesowa
- **Show Status:** Edycja tylko przed zakończeniem wystawy
- **Finalization:** Brak edycji po finalizacji
- **Secretary Permissions:** Dostęp tylko do przypisanych ras
- **Evaluation Rules:** Zgodność ocen z klasami psów

### 6.4 Rate Limiting
- **Authenticated requests:** 1000 requests/hour per user
- **PDF generation:** 50 requests/hour per user
- **Email sending:** 100 emails/hour per user

## 7. Obsługa błędów

### 7.1 Typy błędów i kody
- **VALIDATION_ERROR (400):** Błędy walidacji danych wejściowych
- **AUTHENTICATION_ERROR (401):** Nieprawidłowy lub wygasły token
- **AUTHORIZATION_ERROR (403):** Brak uprawnień do operacji
- **NOT_FOUND (404):** Opis nie istnieje
- **CONFLICT (409):** Opis już istnieje dla tej kombinacji
- **BUSINESS_RULE_ERROR (422):** Wystawa zakończona, opis sfinalizowany
- **INTERNAL_ERROR (500):** Błędy serwera

### 7.2 Przykłady błędów
```json
// Opis już istnieje
{
  "error": {
    "code": "CONFLICT",
    "message": "Description already exists for this dog and judge in this show"
  }
}

// Wystawa zakończona
{
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Cannot create descriptions for completed shows"
  }
}

// Brak uprawnień
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Secretary not assigned to this breed for this show"
  }
}

// Nieprawidłowa ocena dla klasy
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid grade for baby class",
    "details": [{"field": "grade", "message": "Baby class uses different grading system"}]
  }
}
```

## 8. Rozważania dotyczące wydajności

### 8.1 Optymalizacja zapytań
- **Indexing:** Indeksy na (show_id, dog_id, judge_id), (secretary_id, show_id)
- **JOIN Optimization:** Efektywne JOINy z tabelami shows, dogs, judges
- **Pagination:** Cursor-based pagination dla dużych zbiorów
- **Query Caching:** Cache dla często używanych danych

### 8.2 Strategie buforowania
- **Redis Cache:** Cache dla opisów i ocen
- **PDF Caching:** Cache wygenerowanych PDF
- **Response Caching:** Cache odpowiedzi dla operacji odczytu

### 8.3 Monitoring wydajności
- **Query Performance:** Monitorowanie czasu wykonywania zapytań
- **PDF Generation Time:** Śledzenie czasu generowania PDF
- **Email Delivery:** Monitorowanie dostarczania emaili
- **Error Rate Monitoring:** Śledzenie wskaźników błędów

## 9. Etapy wdrożenia

### 9.1 Faza 1: Podstawowa infrastruktura
1. **Setup Validation Schemas**
   - Utworzenie Zod schemas dla wszystkich DTOs
   - Implementacja walidacji biznesowej
   - Testy jednostkowe dla schemas

2. **Error Handling Infrastructure**
   - Implementacja centralnego error handler
   - Utworzenie typów ErrorResponseDto
   - Setup logging system

3. **Database Connection Setup**
   - Konfiguracja Supabase client
   - Implementacja middleware dla context.locals
   - Setup TypeScript types

### 9.2 Faza 2: Descriptions Management
1. **DescriptionService**
   - Implementacja CRUD operacji dla opisów
   - Wersjonowanie opisów
   - Walidacja uprawnień sekretarzy
   - Finalizacja opisów

2. **API Endpoints**
   - GET /descriptions (z paginacją i filtrami)
   - GET /descriptions/{id}
   - POST /descriptions
   - PUT /descriptions/{id}
   - PATCH /descriptions/{id}/finalize
   - GET /descriptions/{id}/versions
   - DELETE /descriptions/{id}

### 9.3 Faza 3: Evaluation Management
1. **EvaluationService**
   - Implementacja CRUD operacji dla ocen
   - Walidacja reguł biznesowych ocen
   - System ocen dla różnych klas psów

2. **API Endpoints**
   - POST /descriptions/{descriptionId}/evaluations
   - PUT /descriptions/{descriptionId}/evaluations

### 9.4 Faza 4: PDF and Email Management
1. **PDFService**
   - Generowanie PDF z opisami
   - Upload do Supabase Storage
   - Cache wygenerowanych PDF

2. **EmailService**
   - Integracja z Resend API
   - Wysyłanie opisów mailem
   - Logowanie wysłanych emaili

3. **API Endpoints**
   - GET /descriptions/{id}/pdf
   - POST /descriptions/{id}/send-email

### 9.5 Faza 5: Security & Testing
1. **Authentication & Authorization**
   - JWT token validation
   - Row Level Security policies
   - Role-based access control

2. **Input Validation & Sanitization**
   - Comprehensive input validation
   - SQL injection prevention
   - XSS protection

3. **Testing**
   - Unit tests dla services
   - Integration tests dla endpoints
   - Security tests
   - Performance tests

### 9.6 Faza 6: Performance & Monitoring
1. **Performance Optimization**
   - Database indexing
   - Query optimization
   - Caching implementation

2. **Monitoring & Logging**
   - Error tracking
   - Performance monitoring
   - Audit logging

3. **Documentation**
   - API documentation
   - Code documentation
   - Deployment guides

### 9.7 Faza 7: Deployment & Maintenance
1. **Production Deployment**
   - Environment configuration
   - Database migrations
   - Monitoring setup

2. **Maintenance & Updates**
   - Regular security updates
   - Performance monitoring
   - Bug fixes and improvements

## 10. Pliki do utworzenia/modyfikacji

### 10.1 Nowe pliki:
- `src/lib/validation/descriptionSchemas.ts` (rozszerzenie)
- `src/lib/validation/evaluationSchemas.ts`
- `src/lib/services/descriptionService.ts` (rozszerzenie)
- `src/lib/services/evaluationService.ts`
- `src/lib/services/pdfService.ts`
- `src/lib/services/emailService.ts`
- `src/pages/api/descriptions.ts` (rozszerzenie)
- `src/pages/api/descriptions/[id].ts`
- `src/pages/api/descriptions/[id]/finalize.ts`
- `src/pages/api/descriptions/[id]/versions.ts`
- `src/pages/api/descriptions/[id]/evaluations.ts`
- `src/pages/api/descriptions/[id]/pdf.ts`
- `src/pages/api/descriptions/[id]/send-email.ts`

### 10.2 Modyfikowane pliki:
- `src/types.ts` (dodanie brakujących typów)
- `src/lib/services/errorHandler.ts` (rozszerzenie o nowe błędy)
- `src/lib/services/permissionService.ts` (dodanie uprawnień dla opisów)

### 10.3 Pliki konfiguracyjne:
- `supabase/migrations/` (nowe migracje dla indeksów)
- `package.json` (dodanie zależności dla PDF i email)

## 11. Kryteria akceptacji

### 11.1 Funkcjonalne:
- ✅ Endpointy akceptują prawidłowe dane i tworzą/aktualizują opisy
- ✅ System wersjonowania działa poprawnie
- ✅ Finalizacja opisów blokuje edycję
- ✅ Oceny są walidowane zgodnie z regułami biznesowymi
- ✅ PDF są generowane poprawnie
- ✅ Emails są wysyłane do właścicieli
- ✅ Obsługa wszystkich scenariuszy błędów
- ✅ Logowanie audytu dla każdej akcji

### 11.2 Niefunkcjonalne:
- ✅ Czas odpowiedzi < 500ms dla 95% żądań
- ✅ Obsługa 1000 żądań na godzinę na użytkownika
- ✅ 99.9% dostępność endpointów
- ✅ Pełne pokrycie testami (>90%)

### 11.3 Bezpieczeństwo:
- ✅ Tylko sekretarze mogą tworzyć/edytować opisy
- ✅ Wszystkie dane wejściowe są walidowane i sanityzowane
- ✅ RLS policies chronią dane użytkowników
- ✅ Brak ekspozycji wrażliwych informacji w błędach

Ten plan zapewnia kompleksową implementację systemu zarządzania opisami i ocenami psów z uwzględnieniem wszystkich aspektów bezpieczeństwa, wydajności i niezawodności wymaganych w aplikacji zarządzania wystawami psów. 
