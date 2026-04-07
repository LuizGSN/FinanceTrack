const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prepare } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

router.post('/register', async (req, res) => {
  try {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const rawPassword = req.body?.password;
    const name = (rawName || '').trim();
    const email = (rawEmail || '').toLowerCase();
    const password = rawPassword;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name is too long' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
    }

    const existing = await prepare('SELECT id FROM users WHERE email = $1').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const result = await prepare(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)'
    ).run(name, email, hashedPassword);

    const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const email = (rawEmail || '').toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await prepare('SELECT * FROM users WHERE email = $1').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prepare('SELECT id, name, email, created_at FROM users WHERE id = $1').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
