import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const mockDogs = [
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Rex",
      breed_id: "550e8400-e29b-41d4-a716-446655440004",
      birth_date: "2020-01-15",
      microchip_number: "PL123456789012345",
      gender: "male",
      color: "czarny",
      weight: 30.5,
      height: 55,
      owner_id: "550e8400-e29b-41d4-a716-446655440001",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
      scheduled_for_deletion: false,
    },
  ];

  return new Response(
    JSON.stringify({
      data: mockDogs,
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  return new Response(
    JSON.stringify({
      id: "550e8400-e29b-41d4-a716-446655440005",
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      scheduled_for_deletion: false,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    },
  );
};
