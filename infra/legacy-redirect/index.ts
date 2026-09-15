export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);
    if (url.hostname !== "aqi.orangeiqlabs.com") {
      return new Response("Not found", { status: 404 });
    }
    url.protocol = "https:";
    url.hostname = "aqi.murali.page";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  },
};
