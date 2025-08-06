# REST API Plan - 10x Hovawart Show

## 1. Resources

The API is organized around the following main resources, each corresponding to key database entities:

| Resource          | Database Table                 | Description                                                    |
| ----------------- | ------------------------------ | -------------------------------------------------------------- |
| **Users**         | `public.users`                 | System users with club_board role                             |
| **Shows**         | `public.shows`                 | Hovawart club shows with schedules and configurations         |
| **Dogs**          | `public.dogs`                  | Individual hovawart dogs with identification data             |
| **Owners**        | `public.owners`                | Dog owners with contact information and GDPR consent          |
| **Registrations** | `public.show_registrations`    | Dog registrations for specific shows                          |
| **Evaluations**   | `public.evaluations`           | Grades, club titles, and placements for dogs                  |

## 2. Endpoints

### 2.1 Authentication & Authorization

#### POST /auth/login

Authenticate user and create session

- **Request Body:**
  ```json
  {
    "email": "admin@klub-hovawarta.pl",
    "password": "secure_password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "admin@klub-hovawarta.pl",
      "first_name": "Admin",
      "last_name": "Klubu Hovawarta",
      "role": "club_board"
    },
    "access_token": "jwt_token_here",
    "expires_at": "2024-01-15T11:30:00Z"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials
  - `403 Forbidden`: Account not activated

#### POST /auth/logout

End user session

- **Response (200 OK):**
  ```json
  {
    "message": "Logout successful"
  }
  ```

#### GET /auth/me

Get current user information

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "admin@klub-hovawarta.pl",
    "first_name": "Admin",
    "last_name": "Klubu Hovawarta",
    "role": "club_board",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

### 2.2 Users Management

#### GET /users

List users (club_board only)

- **Query Parameters:**
  - `is_active` (optional): Filter by active status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "admin@klub-hovawarta.pl",
        "first_name": "Admin",
        "last_name": "Klubu Hovawarta",
        "role": "club_board",
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
  ```

#### GET /users/{id}

Get specific user details

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "admin@klub-hovawarta.pl",
    "first_name": "Admin",
    "last_name": "Klubu Hovawarta",
    "role": "club_board",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### POST /users

Create new user (club_board only)

- **Request Body:**
  ```json
  {
    "email": "newuser@klub-hovawarta.pl",
    "password": "secure_password123",
    "first_name": "Jan",
    "last_name": "Kowalski"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "email": "newuser@klub-hovawarta.pl",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "role": "club_board",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /users/{id}

Update user information

- **Request Body:**
  ```json
  {
    "first_name": "Jan",
    "last_name": "Nowak",
    "is_active": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "newuser@klub-hovawarta.pl",
    "first_name": "Jan",
    "last_name": "Nowak",
    "role": "club_board",
    "is_active": true,
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### DELETE /users/{id}

Deactivate user (soft delete)

- **Response (200 OK):**
  ```json
  {
    "message": "User deactivated successfully"
  }
  ```

### 2.3 Shows Management

#### GET /shows

List hovawart club shows

- **Query Parameters:**
  - `status` (optional): Filter by show status
  - `from_date` (optional): Filter shows from date (ISO 8601)
  - `to_date` (optional): Filter shows to date (ISO 8601)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "shows": [
      {
        "id": "uuid",
        "name": "Wystawa Klubowa Hovawartów 2024",
        "status": "open_for_registration",
        "show_date": "2024-06-15",
        "registration_deadline": "2024-06-01",
        "location": "Warszawa, ul. Wystawowa 1",
        "judge_name": "dr Jan Sędzia",
        "description": "Doroczna wystawa klubowa hovawartów",
        "max_participants": 200,
        "registered_dogs": 45,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  }
  ```

#### GET /shows/{id}

Get specific show details

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Wystawa Klubowa Hovawartów 2024",
    "status": "open_for_registration",
    "show_date": "2024-06-15",
    "registration_deadline": "2024-06-01",
    "location": "Warszawa, ul. Wystawowa 1",
    "judge_name": "dr Jan Sędzia",
    "description": "Doroczna wystawa klubowa hovawartów",
    "max_participants": 200,
    "registered_dogs": 45,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### POST /shows

Create new show

- **Request Body:**
  ```json
  {
    "name": "Wystawa Klubowa Hovawartów 2024",
    "show_date": "2024-06-15",
    "registration_deadline": "2024-06-01",
    "location": "Warszawa, ul. Wystawowa 1",
    "judge_name": "dr Jan Sędzia",
    "description": "Doroczna wystawa klubowa hovawartów",
    "max_participants": 200
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "name": "Wystawa Klubowa Hovawartów 2024",
    "status": "draft",
    "show_date": "2024-06-15",
    "registration_deadline": "2024-06-01",
    "location": "Warszawa, ul. Wystawowa 1",
    "judge_name": "dr Jan Sędzia",
    "description": "Doroczna wystawa klubowa hovawartów",
    "max_participants": 200,
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /shows/{id}

Update show (only before show starts)

- **Request Body:**
  ```json
  {
    "name": "Wystawa Klubowa Hovawartów 2024 - Zaktualizowana",
    "show_date": "2024-06-16",
    "registration_deadline": "2024-06-02",
    "max_participants": 250,
    "description": "Zaktualizowany opis"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Wystawa Klubowa Hovawartów 2024 - Zaktualizowana",
    "status": "draft",
    "show_date": "2024-06-16",
    "registration_deadline": "2024-06-02",
    "location": "Warszawa, ul. Wystawowa 1",
    "judge_name": "dr Jan Sędzia",
    "description": "Zaktualizowany opis",
    "max_participants": 250,
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### PATCH /shows/{id}/status

Update show status

- **Request Body:**
  ```json
  {
    "status": "open_for_registration"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "status": "open_for_registration",
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### DELETE /shows/{id}

Delete show (only before show starts)

- **Response (200 OK):**
  ```json
  {
    "message": "Show deleted successfully"
  }
  ```

### 2.4 Dogs Management

#### GET /dogs

List hovawart dogs

- **Query Parameters:**
  - `gender` (optional): Filter by gender (male/female)
  - `owner_id` (optional): Filter by owner
  - `microchip_number` (optional): Search by microchip
  - `kennel_name` (optional): Search by kennel name
  - `search` (optional): Search in dog name
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "dogs": [
      {
        "id": "uuid",
        "name": "Hovawart z Przykładu",
        "gender": "male",
        "birth_date": "2020-03-15",
        "microchip_number": "123456789012345",
        "kennel_name": "Hodowla Przykładowa",
        "father_name": "Champion Max",
        "mother_name": "Lady Luna",
        "owners": [
          {
            "id": "uuid",
            "name": "Jan Kowalski",
            "email": "jan.kowalski@example.com",
            "is_primary": true
          }
        ],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
  ```

#### GET /dogs/{id}

Get specific dog details

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Hovawart z Przykładu",
    "gender": "male",
    "birth_date": "2020-03-15",
    "microchip_number": "123456789012345",
    "kennel_name": "Hodowla Przykładowa",
    "father_name": "Champion Max",
    "mother_name": "Lady Luna",
    "owners": [
      {
        "id": "uuid",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "email": "jan.kowalski@example.com",
        "phone": "+48123456789",
        "is_primary": true
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### POST /dogs

Create new dog

- **Request Body:**
  ```json
  {
    "name": "Hovawart z Przykładu",
    "gender": "male",
    "birth_date": "2020-03-15",
    "microchip_number": "123456789012345",
    "kennel_name": "Hodowla Przykładowa",
    "father_name": "Champion Max",
    "mother_name": "Lady Luna",
    "owners": [
      {
        "id": "uuid",
        "is_primary": true
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "name": "Hovawart z Przykładu",
    "gender": "male",
    "birth_date": "2020-03-15",
    "microchip_number": "123456789012345",
    "kennel_name": "Hodowla Przykładowa",
    "father_name": "Champion Max",
    "mother_name": "Lady Luna",
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /dogs/{id}

Update dog information

- **Request Body:**
  ```json
  {
    "name": "Hovawart z Przykładu - Zaktualizowany",
    "kennel_name": "Hodowla Nowa",
    "father_name": "Champion Max Nowy"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Hovawart z Przykładu - Zaktualizowany",
    "gender": "male",
    "birth_date": "2020-03-15",
    "microchip_number": "123456789012345",
    "kennel_name": "Hodowla Nowa",
    "father_name": "Champion Max Nowy",
    "mother_name": "Lady Luna",
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### DELETE /dogs/{id}

Delete dog (soft delete)

- **Response (200 OK):**
  ```json
  {
    "message": "Dog deleted successfully"
  }
  ```

### 2.5 Owners Management

#### GET /owners

List dog owners

- **Query Parameters:**
  - `email` (optional): Search by email
  - `city` (optional): Filter by city
  - `kennel_name` (optional): Search by kennel name
  - `gdpr_consent` (optional): Filter by GDPR consent status
  - `search` (optional): Search in first_name, last_name, or kennel_name
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "owners": [
      {
        "id": "uuid",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "email": "jan.kowalski@example.com",
        "phone": "+48123456789",
        "city": "Warszawa",
        "kennel_name": "Hodowla Przykładowa",
        "gdpr_consent": true,
        "gdpr_consent_date": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 89,
      "pages": 5
    }
  }
  ```

#### GET /owners/{id}

Get specific owner details

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warszawa",
    "postal_code": "00-001",
    "kennel_name": "Hodowla Przykładowa",
    "gdpr_consent": true,
    "gdpr_consent_date": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### POST /owners

Create new owner

- **Request Body:**
  ```json
  {
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warszawa",
    "postal_code": "00-001",
    "kennel_name": "Hodowla Przykładowa",
    "gdpr_consent": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warszawa",
    "postal_code": "00-001",
    "kennel_name": "Hodowla Przykładowa",
    "gdpr_consent": true,
    "gdpr_consent_date": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /owners/{id}

Update owner information

- **Request Body:**
  ```json
  {
    "phone": "+48987654321",
    "address": "ul. Nowa 456",
    "city": "Kraków",
    "postal_code": "30-001"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48987654321",
    "address": "ul. Nowa 456",
    "city": "Kraków",
    "postal_code": "30-001",
    "kennel_name": "Hodowla Przykładowa",
    "gdpr_consent": true,
    "gdpr_consent_date": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### DELETE /owners/{id}

Delete owner (soft delete)

- **Response (200 OK):**
  ```json
  {
    "message": "Owner deleted successfully"
  }
  ```

### 2.6 Show Registrations

#### GET /shows/{showId}/registrations

List registrations for a show

- **Query Parameters:**
  - `dog_class` (optional): Filter by dog class
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "registrations": [
      {
        "id": "uuid",
        "dog": {
          "id": "uuid",
          "name": "Hovawart z Przykładu",
          "gender": "male",
          "birth_date": "2020-03-15"
        },
        "dog_class": "open",
        "catalog_number": 45,
        "registered_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
  ```

#### POST /shows/{showId}/registrations

Register dog for show

- **Request Body:**
  ```json
  {
    "dog_id": "uuid",
    "dog_class": "open"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "dog_class": "open",
    "catalog_number": null,
    "registered_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /shows/{showId}/registrations/{registrationId}

Update registration

- **Request Body:**
  ```json
  {
    "dog_class": "champion"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "dog_class": "champion",
    "catalog_number": 45,
    "registered_at": "2024-01-15T10:30:00Z"
  }
  ```

#### DELETE /shows/{showId}/registrations/{registrationId}

Cancel registration

- **Response (200 OK):**
  ```json
  {
    "message": "Registration cancelled successfully"
  }
  ```

#### POST /shows/{showId}/registrations/generate-catalog

Generate catalog numbers for all registrations

- **Response (200 OK):**
  ```json
  {
    "message": "Catalog numbers generated successfully",
    "generated_count": 45
  }
  ```

### 2.7 Evaluations Management

#### GET /shows/{showId}/evaluations

List evaluations for a show

- **Query Parameters:**
  - `dog_class` (optional): Filter by dog class
  - `grade` (optional): Filter by grade
  - `club_title` (optional): Filter by club title
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "evaluations": [
      {
        "id": "uuid",
        "dog": {
          "id": "uuid",
          "name": "Hovawart z Przykładu",
          "gender": "male",
          "birth_date": "2020-03-15"
        },
        "dog_class": "open",
        "grade": "bardzo_dobra",
        "baby_puppy_grade": null,
        "club_title": "zwycięzca_klubu",
        "placement": "1st",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
  ```

#### POST /shows/{showId}/evaluations

Create evaluation for dog

- **Request Body:**
  ```json
  {
    "dog_id": "uuid",
    "dog_class": "open",
    "grade": "bardzo_dobra",
    "club_title": "zwycięzca_klubu",
    "placement": "1st"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "dog_class": "open",
    "grade": "bardzo_dobra",
    "baby_puppy_grade": null,
    "club_title": "zwycięzca_klubu",
    "placement": "1st",
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /shows/{showId}/evaluations/{evaluationId}

Update evaluation

- **Request Body:**
  ```json
  {
    "grade": "doskonała",
    "club_title": "zwycięzca_klubu",
    "placement": "1st"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "dog_class": "open",
    "grade": "doskonała",
    "baby_puppy_grade": null,
    "club_title": "zwycięzca_klubu",
    "placement": "1st",
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### DELETE /shows/{showId}/evaluations/{evaluationId}

Delete evaluation

- **Response (200 OK):**
  ```json
  {
    "message": "Evaluation deleted successfully"
  }
  ```

### 2.8 Dog History

#### GET /dogs/{id}/history

Get dog's show history

- **Query Parameters:**
  - `from_date` (optional): Filter from date
  - `to_date` (optional): Filter to date
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "dog": {
      "id": "uuid",
      "name": "Hovawart z Przykładu",
      "gender": "male",
      "birth_date": "2020-03-15"
    },
    "history": [
      {
        "show": {
          "id": "uuid",
          "name": "Wystawa Klubowa Hovawartów 2024",
          "show_date": "2024-06-15",
          "location": "Warszawa"
        },
        "dog_class": "open",
        "grade": "bardzo_dobra",
        "club_title": "zwycięzca_klubu",
        "placement": "1st",
        "evaluated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
  ```

### 2.9 Show Statistics

#### GET /shows/{id}/stats

Get show statistics

- **Response (200 OK):**
  ```json
  {
    "show": {
      "id": "uuid",
      "name": "Wystawa Klubowa Hovawartów 2024",
      "show_date": "2024-06-15"
    },
    "registration_stats": {
      "total_registrations": 45,
      "by_class": {
        "baby": 5,
        "puppy": 8,
        "junior": 12,
        "intermediate": 6,
        "open": 10,
        "working": 2,
        "champion": 1,
        "veteran": 1
      },
      "by_gender": {
        "male": 25,
        "female": 20
      }
    },
    "evaluation_stats": {
      "total_evaluations": 45,
      "by_grade": {
        "doskonała": 10,
        "bardzo_dobra": 20,
        "dobra": 10,
        "zadowalająca": 3,
        "zdyskwalifikowana": 1,
        "nieobecna": 1
      },
      "by_club_title": {
        "młodzieżowy_zwycięzca_klubu": 1,
        "zwycięzca_klubu": 1,
        "zwycięzca_klubu_weteranów": 1,
        "najlepszy_reproduktor": 1,
        "najlepsza_suka_hodowlana": 1,
        "najlepsza_para": 1,
        "najlepsza_hodowla": 1,
        "zwycięzca_rasy": 1,
        "zwycięzca_płci_przeciwnej": 1,
        "najlepszy_junior": 1,
        "najlepszy_weteran": 1
      }
    }
  }
  ```

### 2.10 GDPR Compliance

#### POST /owners/{id}/gdpr-consent

Grant GDPR consent for owner

- **Request Body:**
  ```json
  {
    "consent_given": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Consent recorded successfully",
    "consent_date": "2024-01-15T11:30:00Z"
  }
  ```

#### POST /owners/{id}/gdpr-withdraw

Withdraw GDPR consent

- **Response (200 OK):**
  ```json
  {
    "message": "Consent withdrawn successfully. Data will be deleted within 30 days.",
    "withdrawal_date": "2024-01-15T11:30:00Z"
  }
  ```

## 3. Authentication and Authorization

### 3.1 Authentication Method

The API uses **JWT (JSON Web Token)** based authentication provided by Supabase Auth:

- **Token Type**: Bearer tokens
- **Token Location**: Authorization header
- **Token Format**: `Authorization: Bearer <jwt_token>`
- **Token Expiry**: 1 hour (configurable)
- **Refresh Mechanism**: Automatic refresh token rotation

### 3.2 Authorization Roles

#### Club Board

- **Full access** to all endpoints
- Can manage users, shows, dogs, owners, registrations, and evaluations
- Can view all data across all shows
- Can generate statistics and manage GDPR requests

### 3.3 Row Level Security (RLS)

The API implements **Row Level Security** policies at the database level:

- **Users**: Can only view/edit their own profile
- **Shows**: Club board can access all shows
- **Dogs/Owners**: Club board can access all dogs and owners
- **Registrations/Evaluations**: Club board can access all data
- **Soft Delete**: All tables filter out deleted records automatically

### 3.4 Rate Limiting

- **Authenticated requests**: 1000 requests per hour per user
- **Unauthenticated requests**: 100 requests per hour per IP

## 4. Validation and Business Logic

### 4.1 Input Validation

#### Email Validation

- **Format**: RFC 5322 compliant email addresses
- **Uniqueness**: Emails must be unique across users and owners
- **Required**: Email is required for all owners

#### Date Validation

- **Show dates**: Can be in the past (for archiving historical shows)
- **Registration deadlines**: Must be before show date
- **Dog birth dates**: Must be in the past and realistic (not more than 20 years ago)

#### Dog Class Validation

- **Age-based validation**: Dog class must match age on show date
  - Baby: 4-6 months
  - Puppy: 6-9 months
  - Junior: 9-18 months
  - Intermediate: 15-24 months
  - Open: 15+ months
  - Working: 15+ months
  - Champion: 15+ months
  - Veteran: 8+ years

#### Microchip Validation

- **Format**: Exactly 15 digits
- **Uniqueness**: Must be unique across all dogs
- **Required**: Microchip number is required for all dogs

### 4.2 Business Logic Rules

#### Show Management

- **Edit restrictions**: Shows can only be edited before they start
- **Status transitions**: Shows must follow valid status progression
- **Capacity limits**: Registration cannot exceed max_participants

#### Evaluation Rules

- **Grade validation**: Baby/Puppy classes use different grading system (baby_puppy_grade)
- **Club titles**: Only one dog can receive each club title per show
- **Placement limits**: Only 4 placements per class
- **Grade consistency**: Baby/Puppy classes cannot have regular grades, other classes cannot have baby_puppy_grade

#### GDPR Compliance

- **Consent tracking**: All consent changes are logged with timestamps
- **Data retention**: Data is automatically scheduled for deletion after 3 years
- **Deletion timeline**: Data deletion requests are processed within 30 days

### 4.3 Error Handling

#### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      },
      {
        "field": "birth_date",
        "message": "Birth date must be in the past"
      }
    ]
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "request_id": "uuid"
}
```

#### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists or constraint violation
- `BUSINESS_RULE_ERROR`: Business logic validation failed
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

### 4.4 Audit Logging

Critical actions are automatically logged:

- User authentication (login/logout)
- Show creation/modification/deletion
- Dog and owner creation/modification/deletion
- Registration creation/modification/cancellation
- Evaluation creation/modification/deletion
- GDPR consent changes

Each audit entry includes:

- User ID and action type
- Entity type and ID
- Old and new values (for updates)
- IP address and user agent
- Timestamp and metadata 
