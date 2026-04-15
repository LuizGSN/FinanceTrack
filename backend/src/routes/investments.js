/**
 * @swagger
 * /api/v1/investments:
 *   get:
 *     summary: Listar investimentos do usuário
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de investimentos
 *   post:
 *     summary: Criar novo investimento
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [stock, crypto, bond, real_state, fund, other]
 *               initial_amount:
 *                 type: number
 *               current_value:
 *                 type: number
 */

const express = require('express');
const { prepare } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { validateInvestment } = require('../utils/validators');
const logger = require('../utils/logger');

const router = express.Router();

// Proteger todas as rotas
router.use(authMiddleware);

// GET /investments - Listar investimentos
router.get('/', async (req, res) => {
  try {
    const investments = await prepare(
      `SELECT id, name, type, exchange, initial_amount, current_value, share_price,
              current_share_price, shares_count, purchase_date, purchase_time, notes,
              (current_value - initial_amount) AS gains,
              ROUND(((current_value - initial_amount) / NULLIF(initial_amount, 0) * 100), 2) AS gains_percent,
              created_at FROM investments WHERE user_id = $1 ORDER BY created_at DESC`
    ).all(req.userId);

    res.json(investments);
  } catch (err) {
    logger.error('Failed to fetch investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST /investments - Criar investimento
router.post('/', async (req, res) => {
  try {
    const { name, type, exchange, initial_amount, current_value, share_price,
            current_share_price, shares_count, purchase_date, purchase_time, notes } = req.body;

    // Validar dados obrigatórios
    if (!name || !type || initial_amount === undefined || current_value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validation = validateInvestment({ name, type, initial_amount, current_value });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await prepare(
      `INSERT INTO investments (user_id, name, type, exchange, initial_amount, current_value,
                               share_price, current_share_price, shares_count, purchase_date,
                               purchase_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`
    ).run(req.userId, name, type, exchange || null, initial_amount, current_value,
          share_price || null, current_share_price || null, shares_count || null,
          purchase_date || null, purchase_time || null, notes || null);

    res.status(201).json(result);
  } catch (err) {
    logger.error('Failed to create investment:', err);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT /investments/:id - Atualizar investimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, exchange, initial_amount, current_value, share_price,
            current_share_price, shares_count, purchase_date, purchase_time, notes } = req.body;

    // Verificar propriedade
    const existing = await prepare(
      'SELECT * FROM investments WHERE id = $1 AND user_id = $2'
    ).get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Validar dados enviadas
    const updates = {
      name: name !== undefined ? name : existing.name,
      type: type !== undefined ? type : existing.type,
      exchange: exchange !== undefined ? exchange : existing.exchange,
      initial_amount: initial_amount !== undefined ? initial_amount : existing.initial_amount,
      current_value: current_value !== undefined ? current_value : existing.current_value,
      share_price: share_price !== undefined ? share_price : existing.share_price,
      current_share_price: current_share_price !== undefined ? current_share_price : existing.current_share_price,
      shares_count: shares_count !== undefined ? shares_count : existing.shares_count,
      purchase_date: purchase_date !== undefined ? purchase_date : existing.purchase_date,
      purchase_time: purchase_time !== undefined ? purchase_time : existing.purchase_time,
      notes: notes !== undefined ? notes : existing.notes,
    };

    const validation = validateInvestment(updates);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await prepare(
      `UPDATE investments
       SET name = $1, type = $2, exchange = $3, initial_amount = $4, current_value = $5,
           share_price = $6, current_share_price = $7, shares_count = $8,
           purchase_date = $9, purchase_time = $10, notes = $11
       WHERE id = $12 RETURNING *`
    ).run(updates.name, updates.type, updates.exchange, updates.initial_amount, updates.current_value,
          updates.share_price, updates.current_share_price, updates.shares_count,
          updates.purchase_date, updates.purchase_time, updates.notes, id);

    res.json(result);
  } catch (err) {
    logger.error('Failed to update investment:', err);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE /investments/:id - Deletar investimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar propriedade e deletar em uma operação
    const result = await prepare(
      'DELETE FROM investments WHERE id = $1 AND user_id = $2'
    ).run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete investment:', err);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// GET /investments/summary - Resumo de investimentos
router.get('/summary', async (req, res) => {
  try {
    const summary = await prepare(
      `SELECT
        COUNT(*) AS total_investments,
        COALESCE(SUM(initial_amount), 0) AS total_invested,
        COALESCE(SUM(current_value), 0) AS total_current_value,
        COALESCE(SUM(current_value - initial_amount), 0) AS total_gains
       FROM investments WHERE user_id = $1`
    ).get(req.userId);

    res.json(summary);
  } catch (err) {
    logger.error('Failed to fetch investment summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
