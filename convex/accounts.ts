import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all accounts for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return accounts;
  },
});

// Create a new account
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("cash"), v.literal("credit"), v.literal("savings"), v.literal("loans"), v.literal("investment")),
    balance: v.number(),
    currency: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("accounts", {
      userId,
      name: args.name,
      type: args.type,
      balance: args.balance,
      currency: args.currency,
      isShared: false,
      color: args.color,
    });
  },
});

// Update account
export const update = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    balance: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.balance !== undefined) updates.balance = args.balance;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete account
export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    // Clean up transactions referencing this account
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Clean up recurring transactions referencing this account
    const recurringTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const rt of recurringTransactions) {
      if (rt.accountId === args.id) {
        await ctx.db.delete(rt._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});

// Get account balance summary
export const getBalanceSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const summary = {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      byType: {} as Record<string, number>,
    };

    accounts.forEach((account) => {
      if (account.type === "loans" || account.type === "credit") {
        summary.totalLiabilities += Math.abs(account.balance);
      } else {
        summary.totalAssets += account.balance;
      }
      
      summary.byType[account.type] = (summary.byType[account.type] || 0) + account.balance;
    });

    summary.netWorth = summary.totalAssets - summary.totalLiabilities;

    return summary;
  },
});
