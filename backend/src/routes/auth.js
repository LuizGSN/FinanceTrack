const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prepare } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../services/emailService');
const logger = require('../utils/logger');

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

    const hashedPassword = await bcrypt.hash(password, 12);

    // Gerar token de confirmação de email
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationTokenHash = crypto.createHash('sha256').update(confirmationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const result = await prepare(
      'INSERT INTO users (name, email, password, confirmation_token, confirmation_expires) VALUES ($1, $2, $3, $4, $5)'
    ).run(name, email, hashedPassword, confirmationTokenHash, tokenExpires);

    // Enviar email de confirmação
    const emailSent = await sendConfirmationEmail(email, name, confirmationToken);
    if (!emailSent) {
      logger.warn('Failed to send confirmation email, but user was created');
    }

    const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, name, email },
      message: 'User created successfully. Please check your email to confirm your account.'
    });
  } catch (err) {
    logger.error('Register error:', err);
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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prepare('SELECT id, name, email, created_at FROM users WHERE id = $1').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    logger.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm Email
router.get('/confirm-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prepare(
      'SELECT id FROM users WHERE confirmation_token = $1 AND confirmation_expires > NOW()'
    ).get(tokenHash);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Mark user as confirmed
    await prepare(
      'UPDATE users SET confirmed_at = NOW(), confirmation_token = NULL, confirmation_expires = NULL WHERE id = $1'
    ).run(user.id);

    res.json({ message: 'Email confirmed successfully' });
  } catch (err) {
    logger.error('Confirm email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const user = await prepare('SELECT id, name, email FROM users WHERE email = $1').get(email.toLowerCase());
    if (!user) {
      // Não revelar se email existe ou não (segurança)
      return res.json({ message: 'If email exists, password reset link was sent' });
    }

    // Gerar token de reset com expiração de 1 hora
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prepare(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3'
    ).run(resetTokenHash, resetExpires, user.id);

    // Enviar email
    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetToken);
    if (!emailSent) {
      logger.error('Failed to send password reset email');
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Reset Token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prepare(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()'
    ).get(tokenHash);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prepare(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()'
    ).get(tokenHash);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha e limpar token
    await prepare(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2'
    ).run(hashedPassword, user.id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
