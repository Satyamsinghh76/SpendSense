import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get transactions with filters
export const list = query({
  args: {
    accountId: v.optional(v.id("accounts")),
    category: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let query = ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.accountId) {
      query = ctx.db.query("transactions").withIndex("by_account", (q) => q.eq("accountId", args.accountId!));
    }

    let transactions = await query.order("desc").take(args.limit || 50);

    // Apply additional filters
    if (args.category) {
      transactions = transactions.filter(t => t.category === args.category);
    }

    if (args.startDate || args.endDate) {
      transactions = transactions.filter(t => {
        if (args.startDate && t.date < args.startDate) return false;
        if (args.endDate && t.date > args.endDate) return false;
        return true;
      });
    }

    // Get account names for each transaction
    const transactionsWithAccounts = await Promise.all(
      transactions.map(async (transaction) => {
        const account = await ctx.db.get(transaction.accountId);
        return {
          ...transaction,
          accountName: account?.name || "Unknown Account",
        };
      })
    );

    return transactionsWithAccounts;
  },
});

// Create a new transaction
export const create = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    date: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    debitAccount: v.optional(v.id("accounts")),
    creditAccount: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify account ownership
    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId,
      accountId: args.accountId,
      amount: args.amount,
      description: args.description,
      category: args.category,
      type: args.type,
      date: args.date || Date.now(),
      isRecurring: false,
      tags: args.tags,
      debitAccount: args.debitAccount,
      creditAccount: args.creditAccount,
    });

    // Update account balance
    const balanceChange = args.type === "expense" ? -args.amount : args.amount;
    await ctx.db.patch(args.accountId, {
      balance: account.balance + balanceChange,
    });

    return transactionId;
  },
});

// Update transaction
export const update = mutation({
  args: {
    id: v.id("transactions"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or unauthorized");
    }

    const updates: any = {};
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);

    // If amount changed, update account balance
    if (args.amount !== undefined && args.amount !== transaction.amount) {
      const account = await ctx.db.get(transaction.accountId);
      if (account) {
        const oldBalanceChange = transaction.type === "expense" ? -transaction.amount : transaction.amount;
        const newBalanceChange = transaction.type === "expense" ? -args.amount : args.amount;
        const balanceDiff = newBalanceChange - oldBalanceChange;
        
        await ctx.db.patch(transaction.accountId, {
          balance: account.balance + balanceDiff,
        });
      }
    }
  },
});

// Delete transaction
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or unauthorized");
    }

    // Revert account balance
    const account = await ctx.db.get(transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === "expense" ? transaction.amount : -transaction.amount;
      await ctx.db.patch(transaction.accountId, {
        balance: account.balance + balanceChange,
      });
    }

    await ctx.db.delete(args.id);
  },
});

// Get expense breakdown by category
export const getExpenseBreakdown = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "expense"),
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const breakdown: Record<string, number> = {};
    transactions.forEach((transaction) => {
      breakdown[transaction.category] = (breakdown[transaction.category] || 0) + transaction.amount;
    });

    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
    }));
  },
});

// Get daily spending for charts
export const getDailySpending = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const dailyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === "income") {
        dailyData[date].income += transaction.amount;
      } else if (transaction.type === "expense") {
        dailyData[date].expense += transaction.amount;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    })).sort((a, b) => a.date.localeCompare(b.date));
  },
});
