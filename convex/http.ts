import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

// Create router
const http = httpRouter();

// Add custom routes BEFORE auth routes
http.route({
  path: "/api/test",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ message: "Test works!" }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Then add auth routes
auth.addHttpRoutes(http);

export default http;
