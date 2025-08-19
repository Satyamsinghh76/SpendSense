import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get budgets for a specific period
export const list = query({
  args: {
    period: v.string(), // "2024-01" format
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("period"), args.period))
      .collect();

    return budgets;
  },
});

// Create or update budget
export const upsert = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    period: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if budget already exists
    const existingBudget = await ctx.db
      .query("budgets")
      .withIndex("by_user_category", (q) => q.eq("userId", userId).eq("category", args.category))
      .filter((q) => q.eq(q.field("period"), args.period))
      .first();

    if (existingBudget) {
      await ctx.db.patch(existingBudget._id, {
        amount: args.amount,
        currency: args.currency,
      });
      return existingBudget._id;
    } else {
      return await ctx.db.insert("budgets", {
        userId,
        category: args.category,
        amount: args.amount,
        period: args.period,
        spent: 0,
        currency: args.currency,
      });
    }
  },
});

// Update spent amount for budget
export const updateSpent = mutation({
  args: {
    category: v.string(),
    period: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_user_category", (q) => q.eq("userId", userId).eq("category", args.category))
      .filter((q) => q.eq(q.field("period"), args.period))
      .first();

    if (budget) {
      await ctx.db.patch(budget._id, {
        spent: budget.spent + args.amount,
      });
    }
  },
});

// Get budget vs actual spending comparison
export const getBudgetComparison = query({
  args: {
    period: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("period"), args.period))
      .collect();

    // Calculate actual spending for each category
    const [year, month] = args.period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).getTime();
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "expense"),
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    const actualSpending: Record<string, number> = {};
    transactions.forEach((transaction) => {
      actualSpending[transaction.category] = (actualSpending[transaction.category] || 0) + transaction.amount;
    });

    return budgets.map((budget) => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: actualSpending[budget.category] || 0,
      remaining: budget.amount - (actualSpending[budget.category] || 0),
      percentage: ((actualSpending[budget.category] || 0) / budget.amount) * 100,
    }));
  },
});

// Delete budget
export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
      throw new Error("Budget not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
