const readRoute = /^\/api\/v1\/(?:health|devices(?:\/[^/]+\/(?:latest|series))?)$/;

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (!readRoute.test(url.pathname)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: "GET" } }
    );
  }

  // A service binding calls the existing Worker internally. Only public read
  // requests are forwarded; browser cookies and upload credentials stay here.
  url.protocol = "https:";
  url.host = "aqi-backend.murali.page";
  try {
    const upstream = await env.AQI_API.fetch(
      new Request(url, { headers: { Accept: "application/json" } })
    );
    const response = new Response(upstream.body, upstream);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("AQI read request failed", error);
    return Response.json(
      { error: "Air quality data is temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
};
