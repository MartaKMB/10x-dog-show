import { describe, it, expect, beforeEach, vi } from "vitest";
import { DogService } from "../../../../lib/services/dogService";
import type {
  CreateDogInput,
  UpdateDogInput,
} from "../../../../lib/validation/dogSchemas";

// Mock data
const mockDogData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Rex",
  gender: "male" as const,
  birth_date: "2020-01-01T00:00:00.000Z",
  microchip_number: "123456789012345",
  kennel_name: "Test Kennel",
  father_name: "Father Dog",
  mother_name: "Mother Dog",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockOwnerData = {
  id: "123e4567-e89b-12d3-a456-426614174001",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "+48123456789",
  kennel_name: "Test Kennel",
};

const mockCreateDogInput: CreateDogInput = {
  name: "Rex",
  gender: "male",
  birth_date: "2020-01-01T00:00:00.000Z",
  microchip_number: "123456789012345",
  kennel_name: "Test Kennel",
  father_name: "Father Dog",
  mother_name: "Mother Dog",
  owners: [{ id: "123e4567-e89b-12d3-a456-426614174001", is_primary: true }],
};

describe("DogService", () => {
  let dogService: DogService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a more realistic Supabase mock
    mockSupabase = {
      from: vi.fn(() => {
        const mockQuery = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: vi.fn((options?: any) => {
            if (options?.count === "exact") {
              return {
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                range: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                lte: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                single: vi.fn(),
                data: null,
                error: null,
                count: 0,
              };
            }
            return {
              eq: vi.fn().mockReturnThis(),
              ilike: vi.fn().mockReturnThis(),
              or: vi.fn().mockReturnThis(),
              range: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              single: vi.fn(),
              data: null,
              error: null,
            };
          }),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
        };

        // Store the mock query for later use
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockSupabase as any).lastQuery = mockQuery;
        return mockQuery;
      }),
    };

    dogService = new DogService(mockSupabase);
  });

  describe("create", () => {
    it("should create a dog successfully", async () => {
      // 1. Mock dla validateMicrochipUniqueness (pierwsze wywołanie supabase.from("dogs"))
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null, // Brak istniejącego psa z tym mikroczipem
              error: null,
            }),
          }),
        }),
      });

      // 2. Mock dla insert psa (drugie wywołanie supabase.from("dogs"))
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockDogData,
              error: null,
            }),
          }),
        }),
      });

      // 3. Mock dla createDogOwnerRelationships (supabase.from("dog_owners"))
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      // 4. Mock dla formatResponse - owner relationships (supabase.from("dog_owners"))
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [
              {
                owner_id: "123e4567-e89b-12d3-a456-426614174001",
                is_primary: true,
              },
            ],
            error: null,
          }),
        }),
      });

      // 5. Mock dla formatResponse - owner details (supabase.from("owners"))
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      const result = await dogService.create(mockCreateDogInput);

      expect(result).toEqual({
        id: mockDogData.id,
        name: mockDogData.name,
        gender: mockDogData.gender,
        birth_date: mockDogData.birth_date,
        microchip_number: mockDogData.microchip_number,
        kennel_name: mockDogData.kennel_name,
        father_name: mockDogData.father_name,
        mother_name: mockDogData.mother_name,
        owners: [
          {
            id: mockOwnerData.id,
            name: `${mockOwnerData.first_name} ${mockOwnerData.last_name}`,
            email: mockOwnerData.email,
            phone: mockOwnerData.phone,
            kennel_name: mockOwnerData.kennel_name,
            is_primary: true,
          },
        ],
        created_at: mockDogData.created_at,
      });
    });

    it("should validate microchip uniqueness before creation", async () => {
      // Mock existing dog with same microchip
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "existing-dog-id" },
              error: null,
            }),
          }),
        }),
      });

      await expect(dogService.create(mockCreateDogInput)).rejects.toThrow(
        "BUSINESS_RULE_ERROR: Microchip number already exists",
      );
    });

    it("should handle microchip validation error", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      await expect(dogService.create(mockCreateDogInput)).rejects.toThrow(
        "INTERNAL_ERROR: Failed to validate microchip: Database error",
      );
    });
  });

  describe("getDogs", () => {
    it("should get paginated list of dogs with default parameters", async () => {
      const mockDogs = [mockDogData];
      const mockCount = 1;

      // Mock the main query with count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          data: mockDogs,
          error: null,
          count: mockCount,
        }),
      });

      // Mock owner relationships and details
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [
              {
                owner_id: "123e4567-e89b-12d3-a456-426614174001",
                is_primary: true,
              },
            ],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      const result = await dogService.getDogs({});

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockDogData.id,
            name: mockDogData.name,
          }),
        ]),
        pagination: {
          page: 1,
          limit: 20,
          total: mockCount,
          pages: 1,
        },
      });
    });

    it("should apply filters correctly", async () => {
      const filters = {
        gender: "male" as const,
        microchip_number: "123456789012345",
        kennel_name: "Test",
        search: "Rex",
        page: 2,
        limit: 10,
      };

      // Mock the main query with count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          data: [mockDogData],
          error: null,
          count: 1,
        }),
      });

      // Mock owner relationships and details
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [
              {
                owner_id: "123e4567-e89b-12d3-a456-426614174001",
                is_primary: true,
              },
            ],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      await dogService.getDogs(filters);

      // Verify the query was built correctly
      expect(mockSupabase.from).toHaveBeenCalledWith("dogs");
    });

    it("should filter by owner_id correctly", async () => {
      const ownerId = "123e4567-e89b-12d3-a456-426614174001";

      // Mock the main query with count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          data: [mockDogData],
          error: null,
          count: 1,
        }),
      });

      // Mock dog-owner relationships
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [{ dog_id: mockDogData.id }],
            error: null,
          }),
        }),
      });

      // Mock owner relationships and details
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [{ owner_id: ownerId, is_primary: true }],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      const result = await dogService.getDogs({ owner_id: ownerId });

      expect(result.data).toHaveLength(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("dog_owners");
    });

    it("should throw error when fetching dogs fails", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          data: null,
          error: { message: "Database error" },
        }),
      });

      await expect(dogService.getDogs({})).rejects.toThrow(
        "INTERNAL_ERROR: Failed to fetch dogs: Database error",
      );
    });

    it("should throw error when fetching dog owners fails", async () => {
      // Mock the main query with count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          data: [mockDogData],
          error: null,
          count: 1,
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: null,
            error: { message: "Owner fetch error" },
          }),
        }),
      });

      await expect(
        dogService.getDogs({ owner_id: "owner-id" }),
      ).rejects.toThrow(
        "INTERNAL_ERROR: Failed to fetch dog owners: Owner fetch error",
      );
    });
  });

  describe("getDogById", () => {
    it("should get dog by ID successfully", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockDogData,
              error: null,
            }),
          }),
        }),
      });

      // Mock owner relationships and details
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [
              {
                owner_id: "123e4567-e89b-12d3-a456-426614174001",
                is_primary: true,
              },
            ],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      const result = await dogService.getDogById(dogId);

      expect(result.id).toBe(dogId);
      expect(mockSupabase.from).toHaveBeenCalledWith("dogs");
    });

    it("should throw NOT_FOUND error when dog does not exist", async () => {
      const dogId = "non-existent-id";

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      await expect(dogService.getDogById(dogId)).rejects.toThrow(
        "NOT_FOUND: Dog not found",
      );
    });

    it("should throw INTERNAL_ERROR when database operation fails", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      await expect(dogService.getDogById(dogId)).rejects.toThrow(
        "INTERNAL_ERROR: Failed to fetch dog: Database error",
      );
    });
  });

  describe("update", () => {
    it("should update dog successfully", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData: UpdateDogInput = {
        name: "Updated Rex",
        kennel_name: "Updated Kennel",
      };

      const updatedDogData = { ...mockDogData, ...updateData };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedDogData,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock owner relationships and details
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [
              {
                owner_id: "123e4567-e89b-12d3-a456-426614174001",
                is_primary: true,
              },
            ],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [mockOwnerData],
            error: null,
          }),
        }),
      });

      const result = await dogService.update(dogId, updateData);

      expect(result.name).toBe("Updated Rex");
      expect(result.kennel_name).toBe("Updated Kennel");
    });

    it("should throw error when update fails", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData: UpdateDogInput = { name: "Updated Rex" };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Update failed" },
              }),
            }),
          }),
        }),
      });

      await expect(dogService.update(dogId, updateData)).rejects.toThrow(
        "INTERNAL_ERROR: Failed to update dog: Update failed",
      );
    });
  });

  describe("delete", () => {
    it("should soft delete dog successfully", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      await expect(dogService.delete(dogId)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith("dogs");
    });

    it("should throw error when delete fails", async () => {
      const dogId = "123e4567-e89b-12d3-a456-426614174000";

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: { message: "Delete failed" },
          }),
        }),
      });

      await expect(dogService.delete(dogId)).rejects.toThrow(
        "INTERNAL_ERROR: Failed to delete dog: Delete failed",
      );
    });
  });
});
