import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

declare const process: {
  env: Record<string, string | undefined>;
};

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

http.route({
  path: "/api/ai/chat",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// AI chat endpoint
http.route({
  path: "/api/ai/chat",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    try {
      const rawBody = await request.text();
      const body = rawBody ? JSON.parse(rawBody) : {};
      const { message, conversationHistory, financialContext } = body;

      if (!message || typeof message !== "string") {
        return jsonResponse({ error: "Invalid message format" }, 400);
      }

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable not set");
      }

      const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

      const history = Array.isArray(conversationHistory)
        ? conversationHistory.filter(
            (m: unknown) =>
              typeof m === "object" &&
              m !== null &&
              (m as { role?: unknown }).role &&
              typeof (m as { content?: unknown }).content === "string"
          )
        : [];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are SpendSense AI, a personal finance assistant. Give concise, actionable budgeting and spending advice.",
            },
            {
              role: "system",
              content:
                typeof financialContext === "string" && financialContext.trim()
                  ? `Use this financial context when answering:\n${financialContext}`
                  : "No financial context provided.",
            },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const aiResponse =
        data?.choices?.[0]?.message?.content ||
        "Unable to generate response. Please try again.";

      return jsonResponse({ response: aiResponse, success: true });
    } catch (error) {
      console.error("AI chat error:", error);
      return jsonResponse(
        {
          error: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }),
});

auth.addHttpRoutes(http);

export default http;
