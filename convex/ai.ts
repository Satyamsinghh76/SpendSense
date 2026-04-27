import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

export const http = httpRouter();

// AI Chat endpoint
http.route({
  path: "/ai/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { message, conversationHistory } = body;

      if (!message || typeof message !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Call OpenAI API
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable not set");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `You are SpendSense AI, a helpful personal finance assistant. You help users understand their spending patterns, manage budgets, reduce expenses, and achieve financial goals. 

When providing advice:
- Be specific and actionable
- Reference spending categories when relevant
- Suggest practical budget cuts or optimizations
- Ask clarifying questions if needed
- Use encouraging and supportive tone
- Keep responses concise (under 150 words unless detailed analysis is needed)

Your goal is to help users make smarter financial decisions.`,
            },
            ...conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Unable to generate response. Please try again.";

      return new Response(
        JSON.stringify({
          response: aiResponse,
          success: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("AI chat error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal server error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});
