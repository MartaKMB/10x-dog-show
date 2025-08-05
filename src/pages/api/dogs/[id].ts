import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponseDto, DogResponseDto } from "../../../types";

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate dog ID - akceptuje zarówno UUID jak i mock ID
    const dogId = params.id;
    if (!dogId) {
      throw new Error("Dog ID is required");
    }

    // Mock response for dog data
    const mockDogs: Record<string, DogResponseDto> = {
      "dog-1": {
        id: "dog-1",
        name: "Azor",
        breed: {
          id: "breed-1",
          name_pl: "Owczarek Niemiecki",
          name_en: "German Shepherd",
          fci_group: "G1",
        },
        gender: "male",
        birth_date: "2020-01-15",
        microchip_number: "123456789012345",
        kennel_club_number: null,
        kennel_name: null,
        father_name: null,
        mother_name: null,
        owners: [
          {
            id: "owner-1",
            first_name: "Jan",
            last_name: "Kowalski",
            email: "jan.kowalski@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      "dog-2": {
        id: "dog-2",
        name: "Luna",
        breed: {
          id: "breed-2",
          name_pl: "Labrador Retriever",
          name_en: "Labrador Retriever",
          fci_group: "G8",
        },
        gender: "female",
        birth_date: "2019-03-20",
        microchip_number: "987654321098765",
        kennel_club_number: null,
        kennel_name: null,
        father_name: null,
        mother_name: null,
        owners: [
          {
            id: "owner-2",
            first_name: "Anna",
            last_name: "Nowak",
            email: "anna.nowak@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-16T11:30:00Z",
        updated_at: "2024-01-16T11:30:00Z",
      },
      "dog-3": {
        id: "dog-3",
        name: "Rex",
        breed: {
          id: "breed-3",
          name_pl: "Border Collie",
          name_en: "Border Collie",
          fci_group: "G1",
        },
        gender: "male",
        birth_date: "2021-07-10",
        microchip_number: "555666777888999",
        kennel_club_number: null,
        kennel_name: null,
        father_name: null,
        mother_name: null,
        owners: [
          {
            id: "owner-3",
            first_name: "Piotr",
            last_name: "Wiśniewski",
            email: "piotr.wisniewski@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-17T09:15:00Z",
        updated_at: "2024-01-17T09:15:00Z",
      },
    };

    const dog = mockDogs[dogId];
    if (!dog) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Dog not found",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(dog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dog:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid dog ID format",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("AUTHORIZATION_ERROR")
        ? 403
        : error.message.includes("NOT_FOUND")
          ? 404
          : error.message.includes("CONFLICT")
            ? 409
            : error.message.includes("BUSINESS_RULE_ERROR")
              ? 422
              : 500;

      return new Response(
        JSON.stringify({
          error: {
            code: error.message.split(":")[0] || "INTERNAL_ERROR",
            message:
              error.message.split(":")[1]?.trim() || "Internal server error",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // Validate dog ID
    const validatedId = dogIdSchema.parse(params.id);

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = updateDogSchema.parse(body);

    // Update dog using service
    const dogService = new DogService(supabaseClient);
    const dog = await dogService.update(validatedId, validatedData);

    return new Response(JSON.stringify(dog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating dog:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid data provided",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("AUTHORIZATION_ERROR")
        ? 403
        : error.message.includes("NOT_FOUND")
          ? 404
          : error.message.includes("CONFLICT")
            ? 409
            : error.message.includes("BUSINESS_RULE_ERROR")
              ? 422
              : 500;

      return new Response(
        JSON.stringify({
          error: {
            code: error.message.split(":")[0] || "INTERNAL_ERROR",
            message:
              error.message.split(":")[1]?.trim() || "Internal server error",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    // Validate dog ID
    const validatedId = dogIdSchema.parse(params.id);

    // Delete dog using service
    const dogService = new DogService(supabaseClient);
    await dogService.delete(validatedId);

    return new Response(
      JSON.stringify({
        message: "Dog deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting dog:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid dog ID format",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("AUTHORIZATION_ERROR")
        ? 403
        : error.message.includes("NOT_FOUND")
          ? 404
          : error.message.includes("CONFLICT")
            ? 409
            : error.message.includes("BUSINESS_RULE_ERROR")
              ? 422
              : 500;

      return new Response(
        JSON.stringify({
          error: {
            code: error.message.split(":")[0] || "INTERNAL_ERROR",
            message:
              error.message.split(":")[1]?.trim() || "Internal server error",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
