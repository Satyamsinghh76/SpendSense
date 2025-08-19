import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all recurring transactions for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recurringTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get account names for each recurring transaction
    const transactionsWithAccounts = await Promise.all(
      recurringTransactions.map(async (transaction) => {
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

// Create a new recurring transaction
export const create = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify account ownership
    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    // Calculate next due date based on frequency
    const nextDue = calculateNextDue(args.startDate, args.frequency);

    return await ctx.db.insert("recurringTransactions", {
      userId,
      accountId: args.accountId,
      amount: args.amount,
      description: args.description,
      category: args.category,
      type: args.type,
      frequency: args.frequency,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      nextDue,
    });
  },
});

// Update recurring transaction
export const update = mutation({
  args: {
    id: v.id("recurringTransactions"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))),
    isActive: v.optional(v.boolean()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recurringTransaction = await ctx.db.get(args.id);
    if (!recurringTransaction || recurringTransaction.userId !== userId) {
      throw new Error("Recurring transaction not found or unauthorized");
    }

    const updates: any = {};
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.endDate !== undefined) updates.endDate = args.endDate;

    // Recalculate next due date if frequency changed
    if (args.frequency !== undefined) {
      updates.frequency = args.frequency;
      updates.nextDue = calculateNextDue(recurringTransaction.startDate, args.frequency);
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Delete recurring transaction
export const remove = mutation({
  args: { id: v.id("recurringTransactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recurringTransaction = await ctx.db.get(args.id);
    if (!recurringTransaction || recurringTransaction.userId !== userId) {
      throw new Error("Recurring transaction not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Get due recurring transactions (internal function for cron processing)
export const getDueTransactions = internalQuery({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const dueTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_next_due", (q) => q.lte("nextDue", args.currentTime))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return dueTransactions;
  },
});

// Process a single recurring transaction (internal function)
export const processRecurringTransaction = internalMutation({
  args: {
    recurringTransactionId: v.id("recurringTransactions"),
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const recurringTransaction = await ctx.db.get(args.recurringTransactionId);
    if (!recurringTransaction || !recurringTransaction.isActive) {
      return null;
    }

    // Check if end date has passed
    if (recurringTransaction.endDate && args.currentTime > recurringTransaction.endDate) {
      await ctx.db.patch(args.recurringTransactionId, { isActive: false });
      return null;
    }

    // Create the actual transaction
    const transactionId = await ctx.db.insert("transactions", {
      userId: recurringTransaction.userId,
      accountId: recurringTransaction.accountId,
      amount: recurringTransaction.amount,
      description: recurringTransaction.description,
      category: recurringTransaction.category,
      type: recurringTransaction.type,
      date: args.currentTime,
      isRecurring: true,
      recurringId: args.recurringTransactionId,
    });

    // Update account balance
    const account = await ctx.db.get(recurringTransaction.accountId);
    if (account) {
      const balanceChange = recurringTransaction.type === "expense" 
        ? -recurringTransaction.amount 
        : recurringTransaction.amount;
      
      await ctx.db.patch(recurringTransaction.accountId, {
        balance: account.balance + balanceChange,
      });
    }

    // Calculate next due date
    const nextDue = calculateNextDue(args.currentTime, recurringTransaction.frequency);
    
    // Update recurring transaction
    await ctx.db.patch(args.recurringTransactionId, {
      lastProcessed: args.currentTime,
      nextDue,
    });

    return transactionId;
  },
});

// Helper function to calculate next due date
function calculateNextDue(currentDate: number, frequency: string): number {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid frequency");
  }
  
  return date.getTime();
}
