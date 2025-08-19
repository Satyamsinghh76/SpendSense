const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastProcessed: {
    type: Date,
    default: null
  },
  nextDue: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
recurringTransactionSchema.index({ userId: 1 });
recurringTransactionSchema.index({ nextDue: 1, isActive: 1 });
recurringTransactionSchema.index({ isActive: 1 });

// Helper method to calculate next due date
recurringTransactionSchema.methods.calculateNextDue = function(fromDate = null) {
  const date = new Date(fromDate || this.nextDue || this.startDate);
  
  switch (this.frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  
  return date;
};

// Pre-save hook to set initial nextDue
recurringTransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.nextDue) {
    this.nextDue = this.calculateNextDue(this.startDate);
  }
  next();
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
