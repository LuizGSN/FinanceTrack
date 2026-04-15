const express = require('express');
const { prepare } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const {
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
  ALLOWED_CATEGORIES,
} = require('../utils/validators');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { type, category, day, month, year, date, date_from, date_to } = req.query;

    const conditions = ['user_id = $1'];
    const params = [req.userId];
    let idx = 2;

    if (type && ['income', 'expense'].includes(type)) {
      conditions.push(`type = $${idx++}`);
      params.push(type);
    }
    if (category && category.length <= 100) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }
    if (day) {
      conditions.push(`EXTRACT(DAY FROM date) = $${idx++}`);
      params.push(parseInt(day, 10));
    }
    if (month) {
      conditions.push(`EXTRACT(MONTH FROM date) = $${idx++}`);
      params.push(parseInt(month, 10));
    }
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
      params.push(parseInt(year, 10));
    }
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      conditions.push(`date = $${idx++}`);
      params.push(date);
    }
    if (date_from && /^\d{4}-\d{2}-\d{2}$/.test(date_from)) {
      conditions.push(`date >= $${idx++}`);
      params.push(date_from);
    }
    if (date_to && /^\d{4}-\d{2}-\d{2}$/.test(date_to)) {
      conditions.push(`date <= $${idx++}`);
      params.push(date_to);
    }

    const sql = `SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY date DESC`;
    const transactions = await prepare(sql).all(...params);
    res.json(transactions);
  } catch (err) {
    logger.error('List transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateDescription(description)) {
      return res.status(400).json({ error: 'Invalid description' });
    }
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    if (!validateCategory(category, type)) {
      const allowed = ALLOWED_CATEGORIES[type] || [];
      return res.status(400).json({ error: `Invalid category for ${type}. Allowed: ${allowed.join(', ')}` });
    }
    if (!validateDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const result = await prepare(
      'INSERT INTO transactions (user_id, description, amount, type, category, date) VALUES ($1, $2, $3, $4, $5, $6)'
    ).run(req.userId, description, amount, type, category, date);

    const transaction = await prepare('SELECT * FROM transactions WHERE id = $1').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (err) {
    logger.error('Create transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    const existing = await prepare(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2'
    ).get(req.params.id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const desc = description !== undefined ? description : existing.description;
    const amt = amount !== undefined ? amount : existing.amount;
    const t = type !== undefined ? type : existing.type;
    const cat = category !== undefined ? category : existing.category;
    const d = date !== undefined ? date : existing.date;

    if (description !== undefined && !validateDescription(description)) {
      return res.status(400).json({ error: 'Invalid description' });
    }
    if (amount !== undefined && !validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (type !== undefined && type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    if (category !== undefined && !validateCategory(category, t)) {
      const allowed = ALLOWED_CATEGORIES[t] || [];
      return res.status(400).json({ error: `Invalid category for ${t}. Allowed: ${allowed.join(', ')}` });
    }
    if (date !== undefined && !validateDate(date)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    await prepare(
      'UPDATE transactions SET description = $1, amount = $2, type = $3, category = $4, date = $5 WHERE id = $6'
    ).run(desc, amt, t, cat, d, req.params.id);

    const updated = await prepare('SELECT * FROM transactions WHERE id = $1').get(req.params.id);
    res.json(updated);
  } catch (err) {
    logger.error('Update transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await prepare(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2'
    ).run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    logger.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
