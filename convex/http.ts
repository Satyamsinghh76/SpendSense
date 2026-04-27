import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

// Create router and add auth routes
const http = httpRouter();
auth.addHttpRoutes(http);

// Try adding a test HTTP route  
http.route({
  path: "/api/test",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ message: "Test works!" }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
