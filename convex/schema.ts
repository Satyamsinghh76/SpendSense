import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Account types: cash, credit, savings, loans, investment
  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("cash"), v.literal("credit"), v.literal("savings"), v.literal("loans"), v.literal("investment")),
    balance: v.number(),
    currency: v.string(),
    isShared: v.boolean(),
    sharedWith: v.optional(v.array(v.id("users"))),
    color: v.string(), // For UI theming
  })
    .index("by_user", ["userId"])
    .index("by_shared", ["isShared"]),

  // Double-entry transaction system
  transactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    date: v.number(), // timestamp
    isRecurring: v.boolean(),
    recurringId: v.optional(v.id("recurringTransactions")),
    receiptId: v.optional(v.id("receipts")),
    tags: v.optional(v.array(v.string())),
    // Double-entry fields
    debitAccount: v.optional(v.id("accounts")),
    creditAccount: v.optional(v.id("accounts")),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_recurring", ["recurringId"]),

  // Recurring transactions (salary, rent, utilities)
  recurringTransactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
    lastProcessed: v.optional(v.number()),
    nextDue: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_due", ["nextDue"])
    .index("by_active", ["isActive"]),

  // Monthly budgets per category
  budgets: defineTable({
    userId: v.id("users"),
    category: v.string(),
    amount: v.number(),
    period: v.string(), // "2024-01" for monthly budgets
    spent: v.number(),
    currency: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_period", ["period"])
    .index("by_user_category", ["userId", "category"]),

  // Receipt storage with OCR data
  receipts: defineTable({
    userId: v.id("users"),
    transactionId: v.optional(v.id("transactions")),
    imageId: v.id("_storage"), // Convex file storage
    ocrData: v.optional(v.object({
      merchant: v.optional(v.string()),
      amount: v.optional(v.number()),
      date: v.optional(v.string()),
      items: v.optional(v.array(v.string())),
      rawText: v.string(),
    })),
    isProcessed: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_transaction", ["transactionId"]),

  // Transaction templates for frequent entries
  transactionTemplates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    accountId: v.id("accounts"),
    amount: v.optional(v.number()),
    description: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    tags: v.optional(v.array(v.string())),
    useCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_use_count", ["useCount"]),

  // Categories for better organization
  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    color: v.string(),
    icon: v.string(),
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // Shared wallet invitations
  walletInvitations: defineTable({
    fromUserId: v.id("users"),
    toEmail: v.string(),
    accountId: v.id("accounts"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    expiresAt: v.number(),
  })
    .index("by_email", ["toEmail"])
    .index("by_account", ["accountId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
