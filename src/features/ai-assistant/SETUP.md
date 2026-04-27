# 🤖 AI Finance Assistant Integration Guide

This guide walks through integrating the AI Finance Assistant into your SpendSense app.

## Component Setup

The AI Assistant is located at:
- **Component:** `src/features/ai-assistant/AIAssistant.tsx`
- **Export:** `src/features/ai-assistant/index.ts`

### 1. Add to App Navigation

Update [App.tsx](../../App.tsx) to include the AI Assistant in your routing:

```tsx
import { AIAssistant } from './features/ai-assistant';

// In your router/navigation:
<Route path="/ai-assistant" element={<AIAssistant />} />
```

Add a nav link (e.g., in your navigation bar):

```tsx
<Link to="/ai-assistant" className="flex items-center gap-2">
  <Bot className="w-5 h-5" />
  AI Assistant
</Link>
```

### 2. Backend API Integration

The frontend expects a POST endpoint at `/api/ai/chat`.

#### Option A: Use the provided Convex Handler

The handler is already created at `convex/ai.ts` and registered in your HTTP router.

**Steps:**

1. Ensure `convex/http.ts` includes the AI router:

```tsx
import { http as aiHttp } from "./ai";

export const http = httpRouter()
  // ... your other routes
  .route({
    path: "/ai/chat",
    method: "POST",
    handler: aiHttp.handler,
  });
```

Or merge it into your existing http.ts router.

2. Deploy: `npx convex deploy`

#### Option B: Integrate with OpenAI

Update `convex/ai.ts` to use OpenAI's API:

```tsx
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI finance assistant...",
      },
      ...conversationHistory,
    ],
    temperature: 0.7,
    max_tokens: 500,
  }),
});
```

**Set environment variables on Convex:**

```bash
npx convex env set OPENAI_API_KEY "sk-your-key-here"
```

#### Option C: Use Anthropic Claude

```tsx
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "content-type": "application/json",
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: 500,
    system: "You are a helpful AI finance assistant...",
    messages: conversationHistory,
  }),
});
```

## Features

✅ **Real-time Chat UI** — User and AI messages with timestamps
✅ **Auto-scroll** — Automatically scrolls to the latest message
✅ **Loading State** — Shows "AI is thinking..." while waiting
✅ **Error Handling** — Displays errors gracefully
✅ **Clear History** — Button to reset conversation
✅ **Responsive Design** — Works on mobile and desktop
✅ **Accessible** — Proper ARIA labels and keyboard support

## Component Props & Behavior

The component is self-contained and needs no props. It manages:

- **State:** `messages[]`, `input`, `isLoading`, `error`
- **API Call:** POST to `/api/ai/chat` with message + conversation history
- **UI:** Auto-scrolling chat, input form, clear button

## Example API Response Format

Your backend should return:

```json
{
  "response": "Based on your spending patterns, I notice...",
  "success": true
}
```

## Styling

The component uses **Tailwind CSS** with:

- `from-slate-50 to-slate-100` — Gradient background
- `blue-600` — Primary accent (user messages, buttons)
- `slate-*` — Neutral tones (AI messages, borders)
- Responsive padding (`px-4 sm:px-6 lg:px-8`)

## Next Steps

1. **Add AI Provider:** Integrate OpenAI, Claude, or Ollama
2. **Context Awareness:** Pass user's financial data to the AI for better recommendations
3. **System Prompt:** Customize the AI's personality for finance advice
4. **Rate Limiting:** Add request throttling to prevent abuse
5. **Conversation Persistence:** Save chat history to the database

## Customization

### Change the Initial Message

In [AIAssistant.tsx](./AIAssistant.tsx), update the initial message:

```tsx
const [messages, setMessages] = useState<Message[]>([
  {
    id: "1",
    type: "ai",
    content: "Your custom greeting here...",
    timestamp: new Date(),
  },
]);
```

### Adjust Message Styling

Update the message bubble classes:

```tsx
className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
  message.type === "user"
    ? "bg-blue-600 text-white"  // Customize user message
    : "bg-white text-slate-900" // Customize AI message
}`}
```

### Add New Features

- **Attachments:** File/image upload for receipts
- **Suggested Prompts:** Quick-action buttons for common queries
- **Voice Input:** Speech-to-text for hands-free operation
- **Export:** Save conversations as PDF
