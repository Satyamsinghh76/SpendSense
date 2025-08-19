import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all categories for user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return categories;
  },
});

// Create default categories for new users
export const createDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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

    return categoryIds;
  },
});

// Create custom category
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("categories", {
      userId,
      name: args.name,
      type: args.type,
      color: args.color,
      icon: args.icon,
      isDefault: false,
    });
  },
});

// Update category
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete category
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      throw new Error("Cannot delete default categories");
    }

    await ctx.db.delete(args.id);
  },
});
