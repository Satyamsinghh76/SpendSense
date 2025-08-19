import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// Process all due recurring transactions
export const processRecurringTransactions = internalAction({
  args: {},
  handler: async (ctx) => {
    const currentTime = Date.now();
    
    // Get all due recurring transactions
    const dueTransactions: any[] = await ctx.runQuery(internal.recurringTransactions.getDueTransactions, {
      currentTime,
    });

    console.log(`Processing ${dueTransactions.length} due recurring transactions`);

    // Process each due transaction
    const results: any[] = [];
    for (const recurringTransaction of dueTransactions) {
      try {
        const transactionId: any = await ctx.runMutation(
          internal.recurringTransactions.processRecurringTransaction,
          {
            recurringTransactionId: recurringTransaction._id,
            currentTime,
          }
        );
        
        if (transactionId) {
          results.push({
            recurringTransactionId: recurringTransaction._id,
            transactionId,
            success: true,
          });
          console.log(`Created transaction ${transactionId} from recurring transaction ${recurringTransaction._id}`);
        }
      } catch (error: any) {
        console.error(`Failed to process recurring transaction ${recurringTransaction._id}:`, error);
        results.push({
          recurringTransactionId: recurringTransaction._id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      processed: results.length,
      successful: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
      results,
    };
  },
});

// Daily cleanup of expired recurring transactions
export const cleanupExpiredRecurringTransactions = internalAction({
  args: {},
  handler: async (ctx) => {
    const currentTime = Date.now();
    
    // This would need a custom query to find expired transactions
    // For now, we'll just log that cleanup ran
    console.log(`Cleanup job ran at ${new Date(currentTime).toISOString()}`);
    
    return { cleanupTime: currentTime };
  },
});

// Set up cron jobs
const crons = cronJobs();

// Process recurring transactions every hour
crons.interval(
  "process recurring transactions",
  { hours: 1 },
  internal.crons.processRecurringTransactions,
  {}
);

// Daily cleanup at 2 AM
crons.cron(
  "cleanup expired recurring transactions",
  "0 2 * * *",
  internal.crons.cleanupExpiredRecurringTransactions,
  {}
);

export default crons;
