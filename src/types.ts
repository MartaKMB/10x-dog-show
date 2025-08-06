// =============================================================================
// DATABASE TYPES - Import from generated Supabase types
// =============================================================================

import type { Database } from "./db/database.types";

// Extract base types from database schema
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Extract enum types from database schema
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// =============================================================================
// BASE ENTITY TYPES - From Database Schema
// =============================================================================

export type User = Tables<"users">;
export type Show = Tables<"shows">;
export type Dog = Tables<"dogs">;
export type Owner = Tables<"owners">;
export type DogOwner = Tables<"dog_owners">;
export type ShowRegistration = Tables<"show_registrations">;
export type Evaluation = Tables<"evaluations">;
export type Breed = Tables<"breeds">;
export type Branch = Tables<"branches">;

// =============================================================================
// ENUM TYPES - From Database Schema
// =============================================================================

export type UserRole = Enums<"user_role">;
export type ShowStatus = Enums<"show_status">;
export type DogGender = Enums<"dog_gender">;
export type DogClass = Enums<"dog_class">;
export type EvaluationGrade = Enums<"evaluation_grade">;
export type BabyPuppyGrade = Enums<"baby_puppy_grade">;
export type ClubTitle = Enums<"club_title">;
export type Placement = Enums<"placement">;

// Legacy enum types for backward compatibility
export type ShowType = "national" | "international";
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
export type TitleType = "CWC" | "CACIB" | "res_CWC" | "res_CACIB";

// =============================================================================
// COMMON DTO TYPES
// =============================================================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Legacy pagination types for backward compatibility
export type PaginationDto = PaginationInfo;
export type PaginatedResponseDto<T> = PaginatedResponse<T>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
  timestamp: string;
  request_id: string;
}

// Legacy error types for backward compatibility
export type ErrorResponseDto = ErrorResponse;
export type ErrorDetailDto = ErrorDetail;

export interface SuccessResponse {
  message: string;
  timestamp: string;
}

// =============================================================================
// AUTHENTICATION DTOs
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
  };
  access_token: string;
  expires_at: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// =============================================================================
// USERS MANAGEMENT DTOs
// =============================================================================

export interface UserListResponse {
  users: UserProfile[];
  pagination: PaginationInfo;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UserResponse extends UserProfile {
  updated_at: string;
}

// Legacy user types for backward compatibility
export type RegisterUserDto = UserCreateRequest;
export type LoginUserDto = LoginRequest;
export type UpdateUserDto = UserUpdateRequest;
export type UserResponseDto = UserResponse;

// =============================================================================
// SHOWS MANAGEMENT DTOs
// =============================================================================

export interface ShowListResponse {
  shows: ShowResponse[];
  pagination: PaginationInfo;
}

export interface ShowCreateRequest {
  name: string;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description?: string;
  max_participants?: number;
}

export interface ShowUpdateRequest {
  name?: string;
  show_date?: string;
  registration_deadline?: string;
  location?: string;
  judge_name?: string;
  description?: string;
  max_participants?: number;
}

export interface ShowStatusUpdateRequest {
  status: ShowStatus;
}

export interface ShowResponse {
  id: string;
  name: string;
  status: ShowStatus;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description: string | null;
  max_participants: number | null;
  registered_dogs: number;
  created_at: string;
}

// Legacy show types for backward compatibility
export type CreateShowDto = ShowCreateRequest;
export type UpdateShowDto = ShowUpdateRequest;
export type UpdateShowStatusDto = ShowStatusUpdateRequest;
export type ShowResponseDto = ShowResponse;
export type ShowDetailResponseDto = ShowResponse;

// =============================================================================
// DOGS MANAGEMENT DTOs
// =============================================================================

export interface DogListResponse {
  dogs: DogResponse[];
  pagination: PaginationInfo;
}

export interface DogCreateRequest {
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owners: {
    id: string;
    is_primary: boolean;
  }[];
}

export interface DogUpdateRequest {
  name?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

export interface DogOwnerInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  kennel_name: string | null;
  is_primary: boolean;
}

export interface DogResponse {
  id: string;
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string | null;
  kennel_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  owners: DogOwnerInfo[];
  created_at: string;
}

// Legacy dog types for backward compatibility
export type CreateDogDto = DogCreateRequest;
export type UpdateDogDto = DogUpdateRequest;
export type DogResponseDto = DogResponse;
export type DogDetailResponseDto = DogResponse;

// =============================================================================
// OWNERS MANAGEMENT DTOs
// =============================================================================

export interface OwnerListResponse {
  owners: OwnerResponse[];
  pagination: PaginationInfo;
}

export interface OwnerCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  kennel_name?: string;
  gdpr_consent: boolean;
}

export interface OwnerUpdateRequest {
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface OwnerResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  kennel_name: string | null;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface GdprConsentRequest {
  consent_given: boolean;
}

export interface GdprWithdrawResponse {
  message: string;
  withdrawal_date: string;
}

// Legacy owner types for backward compatibility
export type CreateOwnerDto = OwnerCreateRequest;
export type UpdateOwnerDto = OwnerUpdateRequest;
export type OwnerResponseDto = OwnerResponse;

// =============================================================================
// SHOW REGISTRATIONS DTOs
// =============================================================================

export interface RegistrationListResponse {
  registrations: RegistrationResponse[];
  pagination: PaginationInfo;
}

export interface RegistrationCreateRequest {
  dog_id: string;
  dog_class: DogClass;
  registration_fee?: number;
}

export interface RegistrationUpdateRequest {
  dog_class?: DogClass;
  is_paid?: boolean;
}

export interface RegistrationResponse {
  id: string;
  dog: {
    id: string;
    name: string;
    gender: DogGender;
    birth_date: string;
    breed?: {
      id: string;
      name_pl: string;
      name_en: string;
      fci_group: FCIGroup;
    };
  };
  dog_class: DogClass;
  catalog_number: number | null;
  registered_at: string;
  is_paid?: boolean;
  registration_fee?: number;
}

export interface CatalogGenerationResponse {
  message: string;
  generated_count: number;
}

// Legacy registration types for backward compatibility
export type CreateRegistrationDto = RegistrationCreateRequest;
export type UpdateRegistrationDto = RegistrationUpdateRequest;
export type RegistrationResponseDto = RegistrationResponse;
export type UpdatePaymentStatusDto = {
  is_paid: boolean;
  payment_date?: string;
  payment_method?: string;
};
export type RegistrationStatsDto = RegistrationStats;

// =============================================================================
// EVALUATIONS MANAGEMENT DTOs
// =============================================================================

export interface EvaluationListResponse {
  evaluations: EvaluationResponse[];
  pagination: PaginationInfo;
}

export interface EvaluationCreateRequest {
  dog_id: string;
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
  title?: TitleType;
  points?: number;
  is_best_in_group?: boolean;
  is_best_in_show?: boolean;
}

export interface EvaluationUpdateRequest {
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
  title?: TitleType;
  points?: number;
  is_best_in_group?: boolean;
  is_best_in_show?: boolean;
}

export interface EvaluationResponse {
  id: string;
  dog: {
    id: string;
    name: string;
    gender: DogGender;
    birth_date: string;
  };
  dog_class: DogClass;
  grade: EvaluationGrade | null;
  baby_puppy_grade: BabyPuppyGrade | null;
  club_title: ClubTitle | null;
  placement: Placement | null;
  title: TitleType | null;
  points: number | null;
  is_best_in_group: boolean;
  is_best_in_show: boolean;
  created_at: string;
}

// Legacy evaluation types for backward compatibility
export type CreateEvaluationDto = EvaluationCreateRequest;
export type EvaluationResponseDto = EvaluationResponse;

// =============================================================================
// DESCRIPTIONS MANAGEMENT DTOs (Legacy support)
// =============================================================================

export interface Description {
  id: string;
  show_id: string;
  dog_id: string;
  judge_id: string;
  secretary_id: string;
  content_pl: string | null;
  content_en: string | null;
  version: number;
  is_final: boolean;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDescriptionDto {
  show_id: string;
  dog_id: string;
  judge_id: string;
  content_pl?: string;
  content_en?: string;
}

export interface DescriptionResponseDto {
  id: string;
  show: {
    id: string;
    name: string;
    show_date: string;
    show_type: ShowType;
    status: ShowStatus;
  };
  dog: {
    id: string;
    name: string;
    breed: {
      id: string;
      name_pl: string;
      name_en: string;
      fci_group: FCIGroup;
    };
    gender: DogGender;
    birth_date: string;
    microchip_number: string;
  };
  judge: {
    id: string;
    first_name: string;
    last_name: string;
    license_number: string | null;
  };
  secretary: {
    id: string;
    first_name: string;
    last_name: string;
  };
  content_pl: string | null;
  content_en: string | null;
  version: number;
  is_final: boolean;
  finalized_at: string | null;
  evaluation?: EvaluationResponseDto;
  created_at: string;
  updated_at: string;
}

export interface UpdateDescriptionDto {
  content_pl?: string;
  content_en?: string;
}

export interface DescriptionVersionDto {
  id: string;
  version: number;
  content_pl: string | null;
  content_en: string | null;
  changed_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  change_reason: string | null;
  created_at: string;
}

export interface DescriptionVersionsResponseDto {
  versions: DescriptionVersionDto[];
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

// =============================================================================
// DOG HISTORY DTOs
// =============================================================================

export interface DogHistoryEntry {
  show: {
    id: string;
    name: string;
    show_date: string;
    location: string;
  };
  dog_class: DogClass;
  grade: EvaluationGrade | null;
  baby_puppy_grade: BabyPuppyGrade | null;
  club_title: ClubTitle | null;
  placement: Placement | null;
  evaluated_at: string;
}

export interface DogHistoryResponse {
  dog: {
    id: string;
    name: string;
    gender: DogGender;
    birth_date: string;
  };
  history: DogHistoryEntry[];
  pagination: PaginationInfo;
}

// =============================================================================
// SHOW STATISTICS DTOs
// =============================================================================

export interface RegistrationStats {
  total_registrations: number;
  paid: number;
  unpaid: number;
  by_class: Record<DogClass, number>;
  by_gender: Record<DogGender, number>;
  by_breed_group: Record<FCIGroup, number>;
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
}

export interface EvaluationStats {
  total_evaluations: number;
  by_grade: Record<EvaluationGrade, number>;
  by_club_title: Record<ClubTitle, number>;
}

export interface ShowStatsResponse {
  show: {
    id: string;
    name: string;
    show_date: string;
  };
  registration_stats: RegistrationStats;
  evaluation_stats: EvaluationStats;
}

// =============================================================================
// DICTIONARY DTOs (Legacy support)
// =============================================================================

export type BreedResponseDto = Breed;

export interface Judge {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface JudgeResponseDto extends Judge {
  specializations: FCIGroup[];
}

// =============================================================================
// BRANCHES DTOs (Legacy support)
// =============================================================================

export interface BranchResponseDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchesListResponseDto {
  branches: BranchResponseDto[];
  pagination: PaginationInfo;
}

export interface BranchQueryParams {
  region?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// =============================================================================
// API QUERY PARAMETERS DTOs
// =============================================================================

export interface UserQueryParams {
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ShowQueryParams {
  status?: ShowStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface DogQueryParams {
  gender?: DogGender;
  owner_id?: string;
  microchip_number?: string;
  kennel_name?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OwnerQueryParams {
  email?: string;
  city?: string;
  kennel_name?: string;
  gdpr_consent?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationQueryParams {
  dog_class?: DogClass;
  is_paid?: boolean;
  gender?: DogGender;
  breed_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EvaluationQueryParams {
  dog_class?: DogClass;
  grade?: EvaluationGrade;
  club_title?: ClubTitle;
  page?: number;
  limit?: number;
}

export interface DogHistoryQueryParams {
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

// Legacy query params for backward compatibility
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

// =============================================================================
// COMMAND MODELS - Business Logic Commands
// =============================================================================

export interface CreateShowCommand {
  name: string;
  show_date: string;
  registration_deadline: string;
  location: string;
  judge_name: string;
  description?: string;
  max_participants?: number;
}

export interface UpdateShowCommand {
  id: string;
  name?: string;
  show_date?: string;
  registration_deadline?: string;
  location?: string;
  judge_name?: string;
  description?: string;
  max_participants?: number;
}

export interface UpdateShowStatusCommand {
  id: string;
  status: ShowStatus;
}

export interface CreateDogCommand {
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
  owner_ids: string[];
  primary_owner_id: string;
}

export interface UpdateDogCommand {
  id: string;
  name?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

export interface CreateOwnerCommand {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  kennel_name?: string;
  gdpr_consent: boolean;
}

export interface UpdateOwnerCommand {
  id: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface RegisterDogCommand {
  show_id: string;
  dog_id: string;
  dog_class: DogClass;
}

export interface UpdateRegistrationCommand {
  show_id: string;
  registration_id: string;
  dog_class?: DogClass;
}

export interface CreateEvaluationCommand {
  show_id: string;
  dog_id: string;
  dog_class: DogClass;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
}

export interface UpdateEvaluationCommand {
  show_id: string;
  evaluation_id: string;
  grade?: EvaluationGrade;
  baby_puppy_grade?: BabyPuppyGrade;
  club_title?: ClubTitle;
  placement?: Placement;
}

export interface GdprConsentCommand {
  owner_id: string;
  consent_given: boolean;
}

export interface GdprWithdrawCommand {
  owner_id: string;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Legacy validation types for backward compatibility
export type ValidationErrors = Record<string, string[]>;

// =============================================================================
// VIEW MODEL TYPES (Legacy support)
// =============================================================================

export interface ShowDetailsViewModel {
  show: ShowDetailResponseDto | null;
  registrations: RegistrationResponseDto[];
  stats: ShowStats;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
}

export interface ShowStats {
  totalDogs: number;
  paidRegistrations: number;
  unpaidRegistrations: number;
  byClass: Record<DogClass, number>;
  byGender: Record<DogGender, number>;
  byBreedGroup: Record<FCIGroup, number>;
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
}

export interface FilterState {
  dogClass?: DogClass;
  isPaid?: boolean;
  search?: string;
  gender?: DogGender;
  breedId?: string;
  fciGroup?: FCIGroup;
}

export interface DogCardViewModel {
  registration: RegistrationResponseDto;
  canEdit: boolean;
  canDelete: boolean;
  isExpanded: boolean;
  isProcessing: boolean;
}

export interface ShowActionsState {
  isDeleting: boolean;
  isUpdating: boolean;
  isStatusUpdating: boolean;
}

export interface DogManagementState {
  isAdding: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  selectedRegistration: RegistrationResponseDto | null;
}

export interface ModalState {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedRegistration: RegistrationResponseDto | null;
}

export interface DogsListViewModel {
  showId: string;
  dogs: HierarchyNode[];
  filters: DogsFilterState;
  search: string;
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
}

export interface HierarchyNode {
  type: "fci_group" | "breed" | "class" | "dog";
  id: string;
  name: string;
  children: HierarchyNode[];
  isExpanded: boolean;
  count: number;
  data?: DogResponseDto | Breed | FCIGroup | DogClass;
}

export interface DogsFilterState {
  breedId?: string;
  gender?: DogGender;
  dogClass?: DogClass;
  descriptionStatus?: DescriptionStatus;
  search?: string;
}

export interface DescriptionStatus {
  status: "draft" | "completed" | "finalized" | "none";
  lastModified?: string;
  secretaryName?: string;
  version?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
  requiresPermission?: UserRole[];
}

export interface DogsListState {
  showId: string;
  dogs: HierarchyNode[];
  filters: DogsFilterState;
  search: string;
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
}

export interface DogActionsState {
  selectedDog: string | null;
  isProcessing: boolean;
  modalState: {
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Type for creating new entities (omitting system fields)
export type CreateEntity<T> = Omit<
  T,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

// Type for updating entities (making all fields optional except id)
export type UpdateEntity<T> = Partial<
  Omit<T, "id" | "created_at" | "updated_at" | "deleted_at">
> & { id: string };

// Type for API responses with data
export type ApiResponse<T> =
  | {
      data: T;
      success: true;
    }
  | {
      error: ErrorResponse;
      success: false;
    };

// Type for paginated API responses
export type PaginatedApiResponse<T> =
  | {
      data: T[];
      pagination: PaginationInfo;
      success: true;
    }
  | {
      error: ErrorResponse;
      success: false;
    };
