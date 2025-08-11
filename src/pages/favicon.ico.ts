import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  // Redirect to existing PNG favicon to silence 404s in dev
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/favicon.png",
    },
  });
};
