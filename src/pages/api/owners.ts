import type { APIRoute } from "astro";
import type { OwnerResponseDto, PaginatedResponseDto } from "../../types";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // Przykładowi właściciele psów
    const mockOwners: OwnerResponseDto[] = [
      {
        id: "owner-1",
        first_name: "Jan",
        last_name: "Kowalski",
        email: "jan.kowalski@example.com",
        phone: "+48 123 456 789",
        address: "ul. Kwiatowa 1",
        city: "Warszawa",
        postal_code: "00-001",
        country: "Polska",
        kennel_name: "Z Kwiatowej",
        language: "pl",
        gdpr_consent: true,
        gdpr_consent_date: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "owner-2",
        first_name: "Anna",
        last_name: "Nowak",
        email: "anna.nowak@example.com",
        phone: "+48 987 654 321",
        address: "ul. Słoneczna 15",
        city: "Kraków",
        postal_code: "30-001",
        country: "Polska",
        kennel_name: "Ze Słonecznej",
        language: "pl",
        gdpr_consent: true,
        gdpr_consent_date: "2024-01-02T00:00:00Z",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "owner-3",
        first_name: "Piotr",
        last_name: "Wiśniewski",
        email: "piotr.wisniewski@example.com",
        phone: "+48 555 666 777",
        address: "ul. Leśna 8",
        city: "Gdańsk",
        postal_code: "80-001",
        country: "Polska",
        kennel_name: "Z Leśnej",
        language: "pl",
        gdpr_consent: true,
        gdpr_consent_date: "2024-01-03T00:00:00Z",
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "owner-4",
        first_name: "Maria",
        last_name: "Dąbrowska",
        email: "maria.dabrowska@example.com",
        phone: "+48 111 222 333",
        address: "ul. Parkowa 22",
        city: "Wrocław",
        postal_code: "50-001",
        country: "Polska",
        kennel_name: "Z Parkowej",
        language: "pl",
        gdpr_consent: true,
        gdpr_consent_date: "2024-01-04T00:00:00Z",
        created_at: "2024-01-04T00:00:00Z",
        updated_at: "2024-01-04T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "owner-5",
        first_name: "Tomasz",
        last_name: "Lewandowski",
        email: "tomasz.lewandowski@example.com",
        phone: "+48 444 555 666",
        address: "ul. Ogrodowa 7",
        city: "Poznań",
        postal_code: "60-001",
        country: "Polska",
        kennel_name: "Z Ogrodowej",
        language: "pl",
        gdpr_consent: true,
        gdpr_consent_date: "2024-01-05T00:00:00Z",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-05T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
    ];

    // Apply search filter
    let filteredOwners = mockOwners;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOwners = mockOwners.filter(
        (owner) =>
          owner.first_name.toLowerCase().includes(searchLower) ||
          owner.last_name.toLowerCase().includes(searchLower) ||
          owner.email.toLowerCase().includes(searchLower) ||
          owner.kennel_name?.toLowerCase().includes(searchLower),
      );
    }

    // Apply pagination
    const total = filteredOwners.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOwners = filteredOwners.slice(startIndex, endIndex);

    const response: PaginatedResponseDto<OwnerResponseDto> = {
      data: paginatedOwners,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching owners:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async () => {
  try {
    // Mock response for POST
    return new Response(JSON.stringify({ message: "Owner created (mock)" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating owner:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
