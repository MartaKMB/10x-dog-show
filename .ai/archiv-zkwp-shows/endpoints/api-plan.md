# REST API Plan - 10x Dog Show

## 1. Resources

The API is organized around the following main resources, each corresponding to key database entities:

| Resource          | Database Table                 | Description                                                    |
| ----------------- | ------------------------------ | -------------------------------------------------------------- |
| **Users**         | `auth.users`                   | System users with roles (department_representative, secretary) |
| **Shows**         | `dog_shows.shows`              | Dog show events with schedules and configurations              |
| **Dogs**          | `dog_shows.dogs`               | Individual dogs with breed and identification data             |
| **Owners**        | `dog_shows.owners`             | Dog owners with contact information and GDPR consent           |
| **Descriptions**  | `dog_shows.descriptions`       | Judge evaluations and descriptions of dogs                     |
| **Evaluations**   | `dog_shows.evaluations`        | Grades, titles, and placements for dogs                        |
| **Registrations** | `dog_shows.show_registrations` | Dog registrations for specific shows                           |
| **Breeds**        | `dictionary.breeds`            | FCI breed classifications and groups                           |
| **Judges**        | `dictionary.judges`            | Certified judges with specializations (CRUD)                   |
| **Branches**      | `dictionary.branches`          | Show organizing branches (dictionary)                          |

## 2. Endpoints

### 2.1 Authentication & Authorization

#### POST /auth/register

Create a new user account

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "secretary",
    "language": "pl"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "secretary",
      "language": "pl",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "message": "Registration successful. Please check your email for verification."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid email format or weak password
  - `409 Conflict`: Email already exists

#### POST /auth/login

Authenticate user and create session

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "secretary",
      "language": "pl"
    },
    "access_token": "jwt_token_here",
    "expires_at": "2024-01-15T11:30:00Z"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials
  - `403 Forbidden`: Account not activated or suspended

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
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "secretary",
    "language": "pl",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

### 2.2 Users Management

#### GET /users

List users (department_representative only)

- **Query Parameters:**
  - `role` (optional): Filter by role
  - `is_active` (optional): Filter by active status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "secretary",
        "is_active": true,
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

#### GET /users/{id}

Get specific user details

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "secretary",
    "language": "pl",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /users/{id}

Update user information

- **Request Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Smith",
    "is_active": true,
    "language": "en"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "role": "secretary",
    "language": "en",
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

List dog shows

- **Query Parameters:**
  - `status` (optional): Filter by show status
  - `show_type` (optional): Filter by show type (national/international)
  - `from_date` (optional): Filter shows from date (ISO 8601)
  - `to_date` (optional): Filter shows to date (ISO 8601)
  - `organizer_id` (optional): Filter by organizer
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "shows": [
      {
        "id": "uuid",
        "name": "National Dog Show Warsaw 2024",
        "show_type": "national",
        "status": "open_for_registration",
        "show_date": "2024-03-15",
        "registration_deadline": "2024-03-01",
        "branch": {
          "id": "uuid",
          "name": "Warsaw Expo Center",
          "city": "Warsaw"
        },
        "organizer": {
          "id": "uuid",
          "name": "John Doe"
        },
        "max_participants": 200,
        "registered_dogs": 45,
        "entry_fee": 50.0,
        "language": "pl",
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
    "name": "National Dog Show Warsaw 2024",
    "show_type": "national",
    "status": "open_for_registration",
    "show_date": "2024-03-15",
    "registration_deadline": "2024-03-01",
    "venue": {
      "id": "uuid",
      "name": "Warsaw Expo Center",
      "address": "ul. Marywilska 44",
      "city": "Warsaw",
      "postal_code": "03-042",
      "country": "Poland"
    },
    "organizer": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "max_participants": 200,
    "registered_dogs": 45,
    "entry_fee": 50.0,
    "description": "Annual national dog show featuring all FCI groups",
    "language": "pl",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### POST /shows

Create new show (department_representative only)

- **Request Body:**
  ```json
  {
    "name": "National Dog Show Warsaw 2024",
    "show_type": "national",
    "show_date": "2024-03-15",
    "registration_deadline": "2024-03-01",
    "branch_id": "uuid",
    "max_participants": 200,
    "entry_fee": 50.0,
    "description": "Annual national dog show featuring all FCI groups",
    "language": "pl"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "name": "National Dog Show Warsaw 2024",
    "show_type": "national",
    "status": "draft",
    "show_date": "2024-03-15",
    "registration_deadline": "2024-03-01",
    "branch_id": "uuid",
    "organizer_id": "uuid",
    "max_participants": 200,
    "entry_fee": 50.0,
    "description": "Annual national dog show featuring all FCI groups",
    "language": "pl",
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /shows/{id}

Update show (only before show starts)

- **Request Body:**
  ```json
  {
    "name": "National Dog Show Warsaw 2024 - Updated",
    "show_date": "2024-03-16",
    "registration_deadline": "2024-03-02",
    "max_participants": 250,
    "entry_fee": 55.0,
    "description": "Updated description"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "National Dog Show Warsaw 2024 - Updated",
    "show_type": "national",
    "status": "draft",
    "show_date": "2024-03-16",
    "registration_deadline": "2024-03-02",
    "max_participants": 250,
    "entry_fee": 55.0,
    "description": "Updated description",
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

List dogs

- **Query Parameters:**
  - `breed_id` (optional): Filter by breed
  - `gender` (optional): Filter by gender
  - `owner_id` (optional): Filter by owner
  - `microchip_number` (optional): Search by microchip
  - `kennel_club_number` (optional): Search by kennel club number
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "dogs": [
      {
        "id": "uuid",
        "name": "Bella",
        "breed": {
          "id": "uuid",
          "name_pl": "Labrador retriever",
          "name_en": "Labrador Retriever",
          "fci_group": "G8"
        },
        "gender": "female",
        "birth_date": "2022-05-15",
        "microchip_number": "123456789012345",
        "kennel_club_number": "LOI-2022-12345",
        "kennel_name": "vom Guten Haus",
        "owners": [
          {
            "id": "uuid",
            "name": "John Doe",
            "email": "john@example.com",
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
    "name": "Bella",
    "breed": {
      "id": "uuid",
      "name_pl": "Labrador retriever",
      "name_en": "Labrador Retriever",
      "fci_group": "G8",
      "fci_number": 122
    },
    "gender": "female",
    "birth_date": "2022-05-15",
    "microchip_number": "123456789012345",
    "kennel_club_number": "LOI-2022-12345",
    "kennel_name": "vom Guten Haus",
    "father_name": "Champion Max",
    "mother_name": "Lady Luna",
    "owners": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
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
    "name": "Bella",
    "breed_id": "uuid",
    "gender": "female",
    "birth_date": "2022-05-15",
    "microchip_number": "123456789012345",
    "kennel_club_number": "LOI-2022-12345",
    "kennel_name": "vom Guten Haus",
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
    "name": "Bella",
    "breed_id": "uuid",
    "gender": "female",
    "birth_date": "2022-05-15",
    "microchip_number": "123456789012345",
    "kennel_club_number": "LOI-2022-12345",
    "kennel_name": "vom Guten Haus",
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
    "name": "Bella Updated",
    "kennel_name": "vom Neuen Haus",
    "father_name": "Champion Max Updated"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Bella Updated",
    "breed_id": "uuid",
    "gender": "female",
    "birth_date": "2022-05-15",
    "microchip_number": "123456789012345",
    "kennel_club_number": "LOI-2022-12345",
    "kennel_name": "vom Neuen Haus",
    "father_name": "Champion Max Updated",
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

List owners

- **Query Parameters:**
  - `email` (optional): Search by email
  - `city` (optional): Filter by city
  - `country` (optional): Filter by country
  - `gdpr_consent` (optional): Filter by GDPR consent status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "owners": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+48123456789",
        "city": "Warsaw",
        "country": "Poland",
        "kennel_name": "vom Guten Haus",
        "language": "pl",
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
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warsaw",
    "postal_code": "00-001",
    "country": "Poland",
    "kennel_name": "vom Guten Haus",
    "language": "pl",
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
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warsaw",
    "postal_code": "00-001",
    "country": "Poland",
    "kennel_name": "vom Guten Haus",
    "language": "pl",
    "gdpr_consent": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+48123456789",
    "address": "ul. Przykładowa 123",
    "city": "Warsaw",
    "postal_code": "00-001",
    "country": "Poland",
    "kennel_name": "vom Guten Haus",
    "language": "pl",
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
    "city": "Krakow",
    "postal_code": "30-001"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+48987654321",
    "address": "ul. Nowa 456",
    "city": "Krakow",
    "postal_code": "30-001",
    "country": "Poland",
    "kennel_name": "vom Guten Haus",
    "language": "pl",
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
  - `is_paid` (optional): Filter by payment status
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
          "name": "Bella",
          "breed": {
            "name_pl": "Labrador retriever",
            "fci_group": "G8"
          },
          "gender": "female",
          "birth_date": "2022-05-15"
        },
        "dog_class": "open",
        "catalog_number": 45,
        "registration_fee": 50.0,
        "is_paid": true,
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
    "dog_class": "open",
    "registration_fee": 50.0
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
    "registration_fee": 50.0,
    "is_paid": false,
    "registered_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /shows/{showId}/registrations/{registrationId}

Update registration

- **Request Body:**
  ```json
  {
    "dog_class": "champion",
    "is_paid": true
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
    "registration_fee": 50.0,
    "is_paid": true,
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

### 2.7 Descriptions Management

#### GET /descriptions

List descriptions

- **Query Parameters:**
  - `show_id` (optional): Filter by show
  - `judge_id` (optional): Filter by judge
  - `secretary_id` (optional): Filter by secretary
  - `is_final` (optional): Filter by final status
  - `language` (optional): Filter by language
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
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

#### GET /descriptions/{id}

Get specific description

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "show": {
      "id": "uuid",
      "name": "National Dog Show Warsaw 2024",
      "show_date": "2024-03-15",
      "show_type": "national"
    },
    "dog": {
      "id": "uuid",
      "name": "Bella",
      "breed": {
        "id": "uuid",
        "name_pl": "Labrador retriever",
        "name_en": "Labrador Retriever",
        "fci_group": "G8"
      },
      "gender": "female",
      "birth_date": "2022-05-15",
      "microchip_number": "123456789012345"
    },
    "judge": {
      "id": "uuid",
      "first_name": "Dr. John",
      "last_name": "Smith",
      "license_number": "FCI-12345"
    },
    "secretary": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch...",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement...",
    "version": 2,
    "is_final": false,
    "evaluation": {
      "id": "uuid",
      "dog_class": "open",
      "grade": "very_good",
      "title": "CWC",
      "placement": "2nd",
      "points": 85,
      "is_best_in_group": false,
      "is_best_in_show": false
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:30:00Z",
    "finalized_at": null
  }
  ```

#### POST /descriptions

Create new description

- **Request Body:**
  ```json
  {
    "show_id": "uuid",
    "dog_id": "uuid",
    "judge_id": "uuid",
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch...",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement..."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "judge_id": "uuid",
    "secretary_id": "uuid",
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch...",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement...",
    "version": 1,
    "is_final": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### PUT /descriptions/{id}

Update description (only before show completion)

- **Request Body:**
  ```json
  {
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch. Dodatkowe uwagi...",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement. Additional notes..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "show_id": "uuid",
    "dog_id": "uuid",
    "judge_id": "uuid",
    "secretary_id": "uuid",
    "content_pl": "Bardzo dobry przedstawiciel rasy. Doskonała budowa, poprawny ruch. Dodatkowe uwagi...",
    "content_en": "Very good representative of the breed. Excellent structure, correct movement. Additional notes...",
    "version": 2,
    "is_final": false,
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### PATCH /descriptions/{id}/finalize

Finalize description (no further edits allowed)

- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "is_final": true,
    "finalized_at": "2024-01-15T11:30:00Z"
  }
  ```

#### GET /descriptions/{id}/versions

Get description version history

- **Response (200 OK):**
  ```json
  {
    "versions": [
      {
        "id": "uuid",
        "version": 1,
        "content_pl": "Bardzo dobry przedstawiciel rasy...",
        "content_en": "Very good representative of the breed...",
        "changed_by": {
          "id": "uuid",
          "name": "John Doe"
        },
        "change_reason": "Initial creation",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "uuid",
        "version": 2,
        "content_pl": "Bardzo dobry przedstawiciel rasy. Dodatkowe uwagi...",
        "content_en": "Very good representative of the breed. Additional notes...",
        "changed_by": {
          "id": "uuid",
          "name": "John Doe"
        },
        "change_reason": "Added additional notes",
        "created_at": "2024-01-15T11:30:00Z"
      }
    ]
  }
  ```

#### DELETE /descriptions/{id}

Delete description

- **Response (200 OK):**
  ```json
  {
    "message": "Description deleted successfully"
  }
  ```

### 2.8 Evaluations Management

#### POST /descriptions/{descriptionId}/evaluations

Create or update evaluation for description

- **Request Body:**
  ```json
  {
    "dog_class": "open",
    "grade": "very_good",
    "title": "CWC",
    "placement": "2nd",
    "points": 85,
    "is_best_in_group": false,
    "is_best_in_show": false
  }
  ```
- **Response (201 Created):**
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

#### PUT /descriptions/{descriptionId}/evaluations

Update evaluation

- **Request Body:**
  ```json
  {
    "grade": "excellent",
    "title": "CWC",
    "placement": "1st",
    "points": 95,
    "is_best_in_group": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "description_id": "uuid",
    "dog_class": "open",
    "grade": "excellent",
    "title": "CWC",
    "placement": "1st",
    "points": 95,
    "is_best_in_group": true,
    "is_best_in_show": false,
    "updated_at": "2024-01-15T11:30:00Z"
  }
  ```

### 2.9 PDF and Email Management

#### GET /descriptions/{id}/pdf

Generate PDF for description

- **Query Parameters:**
  - `language` (optional): Language for PDF (pl/en), defaults to description language
- **Response (200 OK):**
  ```json
  {
    "pdf_url": "https://storage.supabase.co/bucket/pdfs/description-uuid.pdf",
    "file_name": "description-bella-warsaw-2024.pdf",
    "generated_at": "2024-01-15T11:30:00Z"
  }
  ```

#### POST /descriptions/{id}/send-email

Send description PDF via email

- **Request Body:**
  ```json
  {
    "language": "pl",
    "recipient_email": "owner@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Email sent successfully",
    "sent_to": "owner@example.com",
    "sent_at": "2024-01-15T11:30:00Z"
  }
  ```

### 2.10 Dictionary Resources

#### GET /breeds

List dog breeds

- **Query Parameters:**
  - `fci_group` (optional): Filter by FCI group
  - `is_active` (optional): Filter by active status
  - `search` (optional): Search in breed names
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50, max: 200)
- **Response (200 OK):**
  ```json
  {
    "breeds": [
      {
        "id": "uuid",
        "name_pl": "Labrador retriever",
        "name_en": "Labrador Retriever",
        "fci_group": "G8",
        "fci_number": 122,
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 340,
      "pages": 7
    }
  }
  ```

#### GET /judges

List judges

- **Query Parameters:**
  - `fci_group` (optional): Filter by specialization
  - `is_active` (optional): Filter by active status
  - `search` (optional): Search in judge names
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "judges": [
      {
        "id": "uuid",
        "first_name": "Dr. John",
        "last_name": "Smith",
        "license_number": "FCI-12345",
        "specializations": ["G1", "G2", "G8"],
        "is_active": true
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

#### GET /branches

List show organizing branches

- **Query Parameters:**
  - `region` (optional): Filter by region
  - `is_active` (optional): Filter by active status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "branches": [
      {
        "id": "uuid",
        "name": "Oddział Warszawa",
        "region": "Mazowieckie",
        "address": "ul. Marszałkowska 1",
        "city": "Warszawa",
        "postal_code": "00-001",
        "is_active": true
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

### 2.11 GDPR Compliance

#### POST /gdpr/consent

Grant GDPR consent for owner

- **Request Body:**
  ```json
  {
    "owner_id": "uuid",
    "consent_type": "data_processing",
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

#### POST /gdpr/withdraw

Withdraw GDPR consent

- **Request Body:**
  ```json
  {
    "owner_id": "uuid",
    "consent_type": "data_processing"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Consent withdrawn successfully. Data will be deleted within 30 days.",
    "withdrawal_date": "2024-01-15T11:30:00Z"
  }
  ```

#### POST /gdpr/export

Request data export

- **Request Body:**
  ```json
  {
    "owner_id": "uuid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "request_id": "uuid",
    "message": "Data export requested. You will receive an email with the export file.",
    "status": "pending"
  }
  ```

#### POST /gdpr/delete

Request data deletion

- **Request Body:**
  ```json
  {
    "owner_id": "uuid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "request_id": "uuid",
    "message": "Data deletion requested. Data will be deleted within 30 days.",
    "status": "pending"
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

#### Department Representative

- **Full access** to all endpoints
- Can manage users, shows, dogs, owners, and descriptions
- Can view all data across all shows they organize
- Can export data and manage GDPR requests

#### Secretary

- **Limited access** based on assignments
- Can only access shows and breeds they are assigned to
- Can create and edit descriptions for assigned breeds
- Cannot manage users or shows
- Can view dog and owner data only for assigned shows

### 3.3 Row Level Security (RLS)

The API implements **Row Level Security** policies at the database level:

- **Users**: Can only view/edit their own profile
- **Shows**: Department representatives can access shows they organize
- **Descriptions**: Secretaries can only access descriptions for breeds they are assigned to
- **Dogs/Owners**: Access restricted based on show assignments
- **Audit Data**: Read-only access based on user role

### 3.4 Rate Limiting

- **Authenticated requests**: 1000 requests per hour per user
- **Unauthenticated requests**: 100 requests per hour per IP
- **PDF generation**: 50 requests per hour per user
- **Email sending**: 100 emails per hour per user

## 4. Validation and Business Logic

### 4.1 Input Validation

#### Email Validation

- **Format**: RFC 5322 compliant email addresses
- **Uniqueness**: Emails must be unique across users and owners
- **Required**: Email is required for all owners (for PDF delivery)

#### Date Validation

- **Show dates**: Must be in the future when creating shows
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

#### Description Management

- **Edit restrictions**: Descriptions cannot be edited after show completion
- **Versioning**: Every description change creates a new version
- **Finalization**: Once finalized, descriptions cannot be edited
- **Language requirements**: At least one language (Polish or English) is required

#### Evaluation Rules

- **Grade validation**: Baby/Puppy classes use different grading system
- **Title eligibility**: CWC only for national shows, CACIB only for international shows
- **Placement limits**: Only 4 placements per class
- **Best in Group/Show**: Only one dog can be best in group/show per group/show

#### GDPR Compliance

- **Consent tracking**: All consent changes are logged with timestamps
- **Data retention**: Data is automatically scheduled for deletion after 3 years
- **Export format**: Data exports are provided in JSON format
- **Deletion timeline**: Data deletion requests are processed within 30 days

#### Secretary Assignments

- **Breed restrictions**: Secretaries can only work on breeds they are assigned to
- **Show limitations**: Secretaries can only access shows they are assigned to
- **Description access**: Secretaries can only create/edit descriptions for their assigned breeds

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
- Description creation/modification/finalization
- Evaluation creation/modification
- PDF generation and email sending
- GDPR consent changes and data requests

Each audit entry includes:

- User ID and action type
- Entity type and ID
- Old and new values (for updates)
- IP address and user agent
- Timestamp and metadata
