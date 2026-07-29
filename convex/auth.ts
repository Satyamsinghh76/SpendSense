import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { query, mutation } from "./_generated/server";

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth env vars. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET).",
  );
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google({ clientId: googleClientId, clientSecret: googleClientSecret })],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Initialize user data (categories) on first login
export const initializeUserData = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has categories
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingCategories) {
      return { message: "User data already initialized" };
    }

    // Create default categories
    const defaultCategories = [
      // Expense categories
      { name: "Food & Dining", type: "expense" as const, color: "#FF6B6B", icon: "🍽️" },
      { name: "Transportation", type: "expense" as const, color: "#4ECDC4", icon: "🚗" },
      { name: "Shopping", type: "expense" as const, color: "#45B7D1", icon: "🛍️" },
      { name: "Entertainment", type: "expense" as const, color: "#96CEB4", icon: "🎬" },
      { name: "Bills & Utilities", type: "expense" as const, color: "#FFEAA7", icon: "💡" },
      { name: "Healthcare", type: "expense" as const, color: "#DDA0DD", icon: "🏥" },
      { name: "Education", type: "expense" as const, color: "#98D8C8", icon: "📚" },
      { name: "Travel", type: "expense" as const, color: "#F7DC6F", icon: "✈️" },
      
      // Income categories
      { name: "Salary", type: "income" as const, color: "#52C41A", icon: "💰" },
      { name: "Freelance", type: "income" as const, color: "#1890FF", icon: "💼" },
      { name: "Investment", type: "income" as const, color: "#722ED1", icon: "📈" },
      { name: "Other Income", type: "income" as const, color: "#13C2C2", icon: "💵" },
    ];

    const categoryIds = [];
    for (const category of defaultCategories) {
      const id = await ctx.db.insert("categories", {
        userId,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        isDefault: true,
      });
      categoryIds.push(id);
    }

    return { message: "User data initialized", categoryIds };
  },
});
