// =============================================================================
// ENUMS - Based on Database Schema
// =============================================================================

export type UserRole = "department_representative" | "secretary";
export type ShowType = "national" | "international";
export type ShowStatus =
  | "draft"
  | "open_for_registration"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type DogGender = "male" | "female";
export type DogClass =
  | "baby"
  | "puppy"
  | "junior"
  | "intermediate"
  | "open"
  | "working"
  | "champion"
  | "veteran";
export type FCIGroup =
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10";
export type Language = "pl" | "en";
export type EvaluationGrade =
  | "excellent"
  | "very_good"
  | "good"
  | "satisfactory"
  | "disqualified"
  | "absent";
export type BabyPuppyGrade = "very_promising" | "promising" | "quite_promising";
export type TitleType = "CWC" | "CACIB" | "res_CWC" | "res_CACIB";
export type Placement = "1st" | "2nd" | "3rd" | "4th";

// =============================================================================
// BASE ENTITY TYPES - Database Table Representations
// =============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SoftDeletableEntity extends BaseEntity {
  deleted_at: string | null;
  scheduled_for_deletion: boolean;
}

export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  language: Language;
  is_active: boolean;
}

export interface Show extends SoftDeletableEntity {
  name: string;
  show_type: ShowType;
  status: ShowStatus;
  show_date: string;
  registration_deadline: string;
  venue_id: string;
  organizer_id: string;
  max_participants: number | null;
  description: string | null;
  entry_fee: number | null;
  language: Language;
}

export interface Dog extends SoftDeletableEntity {
  name: string;
  breed_id: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_club_number: string | null;
  kennel_name: string | null;
  father_name: string | null;
  mother_name: string | null;
}

export interface Owner extends SoftDeletableEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  country: string;
  kennel_name: string | null;
  language: Language;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
}

export interface DogOwner extends BaseEntity {
  dog_id: string;
  owner_id: string;
  is_primary: boolean;
}

export interface ShowRegistration extends BaseEntity {
  show_id: string;
  dog_id: string;
  dog_class: DogClass;
  catalog_number: number | null;
  registration_fee: number | null;
  is_paid: boolean;
  registered_at: string;
}

export interface Description extends BaseEntity {
  show_id: string;
  dog_id: string;
  judge_id: string;
  secretary_id: string;
  content_pl: string | null;
  content_en: string | null;
  version: number;
  is_final: boolean;
  finalized_at: string | null;
}

export interface Evaluation extends BaseEntity {
  description_id: string;
  dog_class: DogClass;
  grade: EvaluationGrade | null;
  baby_puppy_grade: BabyPuppyGrade | null;
  title: TitleType | null;
  placement: Placement | null;
  points: number | null;
  is_best_in_group: boolean;
  is_best_in_show: boolean;
  judge_signature: string | null;
}

export interface Breed extends BaseEntity {
  name_pl: string;
  name_en: string;
  fci_group: FCIGroup;
  fci_number: number | null;
  is_active: boolean;
}

export interface Judge extends SoftDeletableEntity {
  first_name: string;
  last_name: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface JudgeSpecialization extends BaseEntity {
  judge_id: string;
  fci_group: FCIGroup;
  is_active: boolean;
}

export interface Venue extends BaseEntity {
  name: string;
  address: string;
  city: string;
  postal_code: string | null;
  country: string;
  is_active: boolean;
}

// =============================================================================
// COMMON DTO TYPES
// =============================================================================

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationDto;
}

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT DTOs
// =============================================================================

export interface RegisterUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  language: Language;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export type UserResponseDto = User;

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  language?: Language;
}

// =============================================================================
// SHOWS MANAGEMENT DTOs
// =============================================================================

export interface CreateShowDto {
  name: string;
  show_type: ShowType;
  show_date: string;
  registration_deadline: string;
  venue_id: string;
  max_participants?: number;
  entry_fee?: number;
  description?: string;
  language: Language;
}

export interface ShowResponseDto
  extends Omit<Show, "venue_id" | "organizer_id"> {
  venue: Pick<Venue, "id" | "name" | "city">;
  organizer: Pick<User, "id" | "first_name" | "last_name">;
  registered_dogs?: number; // Count of registered dogs
}

export interface ShowDetailResponseDto extends ShowResponseDto {
  venue: Venue;
  organizer: Pick<User, "id" | "first_name" | "last_name" | "email">;
}

export interface UpdateShowDto {
  name?: string;
  show_date?: string;
  registration_deadline?: string;
  max_participants?: number;
  entry_fee?: number;
  description?: string;
}

export interface UpdateShowStatusDto {
  status: ShowStatus;
}

// =============================================================================
// DOGS MANAGEMENT DTOs
// =============================================================================

export interface CreateDogDto {
  name: string;
  breed_id: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_club_number?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owners: {
    id: string;
    is_primary: boolean;
  }[];
}

export interface DogResponseDto extends Omit<Dog, "breed_id"> {
  breed: Pick<Breed, "id" | "name_pl" | "name_en" | "fci_group">;
  owners: (Pick<Owner, "id" | "first_name" | "last_name" | "email"> & {
    is_primary: boolean;
  })[];
}

export interface DogDetailResponseDto extends DogResponseDto {
  breed: Breed;
  owners: (Pick<
    Owner,
    "id" | "first_name" | "last_name" | "email" | "phone"
  > & {
    is_primary: boolean;
  })[];
}

export interface UpdateDogDto {
  name?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

// =============================================================================
// OWNERS MANAGEMENT DTOs
// =============================================================================

export interface CreateOwnerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  kennel_name?: string;
  language: Language;
  gdpr_consent: boolean;
}

export type OwnerResponseDto = Owner;

export interface UpdateOwnerDto {
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

// =============================================================================
// SHOW REGISTRATIONS DTOs
// =============================================================================

export interface CreateRegistrationDto {
  dog_id: string;
  dog_class: DogClass;
  registration_fee?: number;
}

export interface RegistrationResponseDto
  extends Omit<ShowRegistration, "dog_id"> {
  dog: {
    id: string;
    name: string;
    breed: Pick<Breed, "name_pl" | "name_en" | "fci_group">;
    gender: DogGender;
    birth_date: string;
  };
}

export interface UpdateRegistrationDto {
  dog_class?: DogClass;
  is_paid?: boolean;
}

// =============================================================================
// DESCRIPTIONS MANAGEMENT DTOs
// =============================================================================

export interface CreateDescriptionDto {
  show_id: string;
  dog_id: string;
  judge_id: string;
  content_pl?: string;
  content_en?: string;
}

export interface DescriptionResponseDto
  extends Omit<
    Description,
    "show_id" | "dog_id" | "judge_id" | "secretary_id"
  > {
  show: Pick<Show, "id" | "name" | "show_date" | "show_type">;
  dog: {
    id: string;
    name: string;
    breed: Pick<Breed, "id" | "name_pl" | "name_en" | "fci_group">;
    gender: DogGender;
    birth_date: string;
    microchip_number: string;
  };
  judge: Pick<Judge, "id" | "first_name" | "last_name" | "license_number">;
  secretary: Pick<User, "id" | "first_name" | "last_name">;
  evaluation?: EvaluationResponseDto;
}

export interface UpdateDescriptionDto {
  content_pl?: string;
  content_en?: string;
}

// =============================================================================
// EVALUATIONS MANAGEMENT DTOs
// =============================================================================

export interface CreateEvaluationDto {
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  title?: TitleType;
  placement?: Placement;
  points?: number;
  is_best_in_group?: boolean;
  is_best_in_show?: boolean;
}

export type EvaluationResponseDto = Evaluation;

// =============================================================================
// DICTIONARY DTOs
// =============================================================================

export type BreedResponseDto = Breed;

export interface JudgeResponseDto extends Judge {
  specializations: FCIGroup[];
}

export type VenueResponseDto = Venue;

// =============================================================================
// PDF & EMAIL DTOs
// =============================================================================

export interface GeneratePdfResponseDto {
  pdf_url: string;
  file_name: string;
  generated_at: string;
}

export interface SendEmailDto {
  language: Language;
  recipient_email?: string; // Optional - defaults to dog owner's email
}

export interface SendEmailResponseDto {
  message: string;
  sent_to: string;
  sent_at: string;
}

// =============================================================================
// GDPR COMPLIANCE DTOs
// =============================================================================

export interface GdprConsentDto {
  owner_id: string;
  consent_type: string;
  consent_given: boolean;
}

export interface GdprExportRequestDto {
  owner_id: string;
}

export interface GdprDeleteRequestDto {
  owner_id: string;
}

export interface GdprResponseDto {
  request_id?: string;
  message: string;
  status?: string;
  consent_date?: string;
  withdrawal_date?: string;
}

// =============================================================================
// API QUERY PARAMETERS DTOs
// =============================================================================

export interface UserQueryParams {
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ShowQueryParams {
  status?: ShowStatus;
  show_type?: ShowType;
  from_date?: string;
  to_date?: string;
  organizer_id?: string;
  page?: number;
  limit?: number;
}

export interface DogQueryParams {
  breed_id?: string;
  gender?: DogGender;
  owner_id?: string;
  microchip_number?: string;
  kennel_club_number?: string;
  page?: number;
  limit?: number;
}

export interface OwnerQueryParams {
  email?: string;
  city?: string;
  country?: string;
  gdpr_consent?: boolean;
  page?: number;
  limit?: number;
}

export interface RegistrationQueryParams {
  dog_class?: DogClass;
  is_paid?: boolean;
  page?: number;
  limit?: number;
}

export interface DescriptionQueryParams {
  show_id?: string;
  judge_id?: string;
  secretary_id?: string;
  is_final?: boolean;
  language?: Language;
  page?: number;
  limit?: number;
}

export interface BreedQueryParams {
  fci_group?: FCIGroup;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JudgeQueryParams {
  fci_group?: FCIGroup;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VenueQueryParams {
  city?: string;
  country?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// =============================================================================
// ERROR RESPONSE DTOs
// =============================================================================

export interface ErrorDetailDto {
  field: string;
  message: string;
}

export interface ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: ErrorDetailDto[];
  };
  timestamp: string;
  request_id: string;
}

// =============================================================================
// AUDIT & HISTORY DTOs
// =============================================================================

export interface DescriptionVersionDto {
  id: string;
  version: number;
  content_pl: string | null;
  content_en: string | null;
  changed_by: Pick<User, "id" | "first_name" | "last_name">;
  change_reason: string | null;
  created_at: string;
}

export interface DescriptionVersionsResponseDto {
  versions: DescriptionVersionDto[];
}
