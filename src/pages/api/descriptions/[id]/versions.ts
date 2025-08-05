import type { APIRoute } from "astro";
import type {
  DescriptionVersionsResponseDto,
  ErrorResponseDto,
} from "../../../../types";

const DEFAULT_USER = {
  id: "admin-user-id",
  first_name: "Admin",
  last_name: "User",
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const descriptionId = params.id;
    if (!descriptionId) {
      throw new Error("Description ID is required");
    }

    // Mock versions data
    const mockVersions: DescriptionVersionsResponseDto = {
      versions: [
        {
          id: "version-1",
          version: 1,
          content_pl: "Pies o bardzo dobrym typie, zrównoważony temperament...",
          content_en: "Dog of very good type, balanced temperament...",
          changed_by: {
            id: DEFAULT_USER.id,
            first_name: "Admin",
            last_name: "User",
          },
          change_reason: "Pierwsza wersja opisu",
          created_at: "2024-06-10T10:00:00Z",
        },
        {
          id: "version-2",
          version: 2,
          content_pl:
            "Pies o doskonałym typie, zrównoważony temperament, bardzo dobra głowa...",
          content_en:
            "Dog of excellent type, balanced temperament, very good head...",
          changed_by: {
            id: DEFAULT_USER.id,
            first_name: "Admin",
            last_name: "User",
          },
          change_reason: "Poprawka opisu",
          created_at: "2024-06-12T14:30:00Z",
        },
      ],
    };

    return new Response(JSON.stringify(mockVersions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching description versions:", error);
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
