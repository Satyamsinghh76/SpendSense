const express = require('express');
const router = express.Router();
const RecurringTransaction = require('../models/RecurringTransaction');
const { authenticateToken } = require('../middleware/auth');

// Get all recurring transactions for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({
      userId: req.user.id
    }).populate('accountId', 'name balance').sort({ createdAt: -1 });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
});

// Create a new recurring transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      accountId,
      amount,
      description,
      category,
      type,
      frequency,
      startDate,
      endDate
    } = req.body;

    // Validate required fields
    if (!accountId || !amount || !description || !category || !type || !frequency || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recurringTransaction = new RecurringTransaction({
      userId: req.user.id,
      accountId,
      amount: parseFloat(amount),
      description,
      category,
      type,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null
    });

    await recurringTransaction.save();
    await recurringTransaction.populate('accountId', 'name balance');

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

// Update a recurring transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const recurringTransaction = await RecurringTransaction.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== '_id' && key !== 'userId') {
        recurringTransaction[key] = updates[key];
      }
    });

    // Recalculate next due date if frequency changed
    if (updates.frequency) {
      recurringTransaction.nextDue = recurringTransaction.calculateNextDue(recurringTransaction.startDate);
    }

    await recurringTransaction.save();
    await recurringTransaction.populate('accountId', 'name balance');

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
});

// Delete a recurring transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const recurringTransaction = await RecurringTransaction.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
});

// Toggle active status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const recurringTransaction = await RecurringTransaction.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    recurringTransaction.isActive = !recurringTransaction.isActive;
    await recurringTransaction.save();
    await recurringTransaction.populate('accountId', 'name balance');

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error toggling recurring transaction:', error);
    res.status(500).json({ error: 'Failed to toggle recurring transaction' });
  }
});

module.exports = router;
