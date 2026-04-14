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

const router = express.Router();

// Proteger todas as rotas
router.use(authMiddleware);

// GET /investments - Listar investimentos
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const investments = await prepare(
      `SELECT id, name, type, initial_amount, current_value, 
              (current_value - initial_amount) AS gains,
              ROUND(((current_value - initial_amount) / initial_amount * 100)::numeric, 2) AS gains_percent,
              created_at FROM investments WHERE user_id = $1 ORDER BY created_at DESC`
    ).all(userId);

    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST /investments - Criar investimento
router.post('/', async (req, res) => {
  try {
    const { name, type, initial_amount, current_value } = req.body;
    const userId = req.user.id;

    // Validar dados
    if (!name || !type || initial_amount === undefined || current_value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validation = validateInvestment({ name, type, initial_amount, current_value });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await prepare(
      `INSERT INTO investments (user_id, name, type, initial_amount, current_value)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`
    ).run(userId, name, type, initial_amount, current_value);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT /investments/:id - Atualizar investimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, initial_amount, current_value } = req.body;
    const userId = req.user.id;

    // Verificar propriedade
    const investment = await prepare(
      'SELECT user_id FROM investments WHERE id = $1'
    ).get(id);

    if (!investment || investment.user_id !== userId) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const result = await prepare(
      `UPDATE investments 
       SET name = $1, type = $2, initial_amount = $3, current_value = $4
       WHERE id = $5 RETURNING *`
    ).run(name, type, initial_amount, current_value, id);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE /investments/:id - Deletar investimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar propriedade
    const investment = await prepare(
      'SELECT user_id FROM investments WHERE id = $1'
    ).get(id);

    if (!investment || investment.user_id !== userId) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    await prepare('DELETE FROM investments WHERE id = $1').run(id);
    res.json({ message: 'Investment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// GET /investments/summary - Resumo de investimentos
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const summary = await prepare(
      `SELECT 
        COUNT(*) AS total_investments,
        SUM(initial_amount) AS total_invested,
        SUM(current_value) AS total_current_value,
        SUM(current_value - initial_amount) AS total_gains
       FROM investments WHERE user_id = $1`
    ).get(userId);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
