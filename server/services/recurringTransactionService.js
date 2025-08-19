const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

class RecurringTransactionService {
  // Get all due recurring transactions
  static async getDueTransactions() {
    const currentTime = new Date();
    
    return await RecurringTransaction.find({
      nextDue: { $lte: currentTime },
      isActive: true
    }).populate('accountId', 'name balance');
  }

  // Process a single recurring transaction
  static async processRecurringTransaction(recurringTransaction) {
    try {
      const currentTime = new Date();
      
      // Check if end date has passed
      if (recurringTransaction.endDate && currentTime > recurringTransaction.endDate) {
        recurringTransaction.isActive = false;
        await recurringTransaction.save();
        return null;
      }

      // Create the actual transaction
      const transaction = new Transaction({
        userId: recurringTransaction.userId,
        accountId: recurringTransaction.accountId,
        amount: recurringTransaction.amount,
        description: recurringTransaction.description,
        category: recurringTransaction.category,
        type: recurringTransaction.type,
        date: currentTime,
        isRecurring: true,
        recurringTransactionId: recurringTransaction._id
      });

      await transaction.save();

      // Update account balance
      const account = await Account.findById(recurringTransaction.accountId);
      if (account) {
        const balanceChange = recurringTransaction.type === 'expense' 
          ? -recurringTransaction.amount 
          : recurringTransaction.amount;
        
        account.balance += balanceChange;
        await account.save();
      }

      // Calculate next due date and update recurring transaction
      const nextDue = recurringTransaction.calculateNextDue(currentTime);
      recurringTransaction.lastProcessed = currentTime;
      recurringTransaction.nextDue = nextDue;
      await recurringTransaction.save();

      return transaction;
    } catch (error) {
      console.error('Error processing recurring transaction:', error);
      throw error;
    }
  }

  // Process all due recurring transactions
  static async processAllDueTransactions() {
    const dueTransactions = await this.getDueTransactions();
    const results = [];

    console.log(`Processing ${dueTransactions.length} due recurring transactions`);

    for (const recurringTransaction of dueTransactions) {
      try {
        const transaction = await this.processRecurringTransaction(recurringTransaction);
        
        if (transaction) {
          results.push({
            recurringTransactionId: recurringTransaction._id,
            transactionId: transaction._id,
            success: true
          });
          console.log(`Created transaction ${transaction._id} from recurring transaction ${recurringTransaction._id}`);
        }
      } catch (error) {
        console.error(`Failed to process recurring transaction ${recurringTransaction._id}:`, error);
        results.push({
          recurringTransactionId: recurringTransaction._id,
          success: false,
          error: error.message
        });
      }
    }

    return {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // Cleanup expired recurring transactions
  static async cleanupExpiredTransactions() {
    const currentTime = new Date();
    
    const result = await RecurringTransaction.updateMany(
      {
        endDate: { $lt: currentTime },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    console.log(`Deactivated ${result.modifiedCount} expired recurring transactions`);
    return result;
  }
}

module.exports = RecurringTransactionService;
