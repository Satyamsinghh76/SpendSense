import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

declare const process: {
  env: Record<string, string | undefined>;
};

const http = httpRouter();

// AI chat endpoint
http.route({
  path: "/api/ai/chat",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    try {
      const body = await request.json();
      const { message, conversationHistory } = body;

      if (!message || typeof message !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
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

      return new Response(
        JSON.stringify({ response: aiResponse, success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("AI chat error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal server error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

auth.addHttpRoutes(http);

export default http;
