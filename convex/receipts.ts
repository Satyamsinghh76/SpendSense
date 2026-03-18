import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Generate upload URL for receipt image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Save receipt with OCR processing
export const create = mutation({
  args: {
    imageId: v.id("_storage"),
    transactionId: v.optional(v.id("transactions")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const receiptId = await ctx.db.insert("receipts", {
      userId,
      imageId: args.imageId,
      transactionId: args.transactionId,
      isProcessed: false,
    });

    // Schedule OCR processing
    await ctx.scheduler.runAfter(0, internal.receipts.processOCR, { receiptId });

    return receiptId;
  },
});

// Process OCR for receipt (scheduled internal action)
export const processOCR = internalAction({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args) => {
    // In a real implementation, you would:
    // 1. Get the image from storage
    // 2. Send it to an OCR service (Tesseract.js, Google Vision API, etc.)
    // 3. Parse the results to extract merchant, amount, date, items
    
    // For now, we'll simulate OCR processing
    const mockOCRData = {
      merchant: "Sample Store",
      amount: 25.99,
      date: new Date().toISOString().split('T')[0],
      items: ["Item 1", "Item 2", "Item 3"],
      rawText: "SAMPLE STORE\n123 Main St\nDate: " + new Date().toLocaleDateString() + "\nTotal: $25.99",
    };

    await ctx.runMutation(internal.receipts.updateOCRData, {
      receiptId: args.receiptId,
      ocrData: mockOCRData,
    });
  },
});

// Update receipt with OCR data (internal - called by processOCR)
export const updateOCRData = internalMutation({
  args: {
    receiptId: v.id("receipts"),
    ocrData: v.object({
      merchant: v.optional(v.string()),
      amount: v.optional(v.number()),
      date: v.optional(v.string()),
      items: v.optional(v.array(v.string())),
      rawText: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.receiptId, {
      ocrData: args.ocrData,
      isProcessed: true,
    });
  },
});

// Get receipts for user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get image URLs
    const receiptsWithUrls = await Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        imageUrl: await ctx.storage.getUrl(receipt.imageId),
      }))
    );

    return receiptsWithUrls;
  },
});

// Get receipt by ID
export const get = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const receipt = await ctx.db.get(args.id);
    if (!receipt || receipt.userId !== userId) {
      throw new Error("Receipt not found or unauthorized");
    }

    return {
      ...receipt,
      imageUrl: await ctx.storage.getUrl(receipt.imageId),
    };
  },
});
