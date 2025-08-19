const cron = require('node-cron');
const RecurringTransactionService = require('../services/recurringTransactionService');

class CronJobs {
  static init() {
    // Process recurring transactions every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running recurring transactions cron job...');
      try {
        const result = await RecurringTransactionService.processAllDueTransactions();
        console.log('Recurring transactions processed:', result);
      } catch (error) {
        console.error('Error in recurring transactions cron job:', error);
      }
    });

    // Daily cleanup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running cleanup cron job...');
      try {
        await RecurringTransactionService.cleanupExpiredTransactions();
        console.log('Cleanup completed');
      } catch (error) {
        console.error('Error in cleanup cron job:', error);
      }
    });

    // Optional: Process on server start (for testing)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(async () => {
        console.log('Processing recurring transactions on startup...');
        try {
          const result = await RecurringTransactionService.processAllDueTransactions();
          console.log('Startup processing completed:', result);
        } catch (error) {
          console.error('Error in startup processing:', error);
        }
      }, 5000); // Wait 5 seconds after server start
    }

    console.log('Cron jobs initialized');
  }
}

module.exports = CronJobs;
