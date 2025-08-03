import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const mockOwners = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      first_name: "Jan",
      last_name: "Kowalski",
      email: "jan.kowalski@example.com",
      phone: "+48123456789",
      address: "ul. Testowa 1",
      city: "Warszawa",
      postal_code: "00-001",
      country: "Polska",
      kennel_name: "Hodowla Kowalski",
      language: "pl",
      gdpr_consent: true,
      gdpr_consent_date: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
      scheduled_for_deletion: false,
    },
  ];

  return new Response(
    JSON.stringify({
      data: mockOwners,
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
      id: "550e8400-e29b-41d4-a716-446655440002",
      ...body,
      gdpr_consent_date: body.gdpr_consent ? new Date().toISOString() : null,
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
