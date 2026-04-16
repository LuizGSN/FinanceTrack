const express = require('express');
const request = require('supertest');

jest.mock('../src/database/db', () => ({
  prepare: jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

const { prepare } = require('../src/database/db');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../src/services/emailService');
const authRoutes = require('../src/routes/auth');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  return app;
}

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'this-is-a-very-strong-jwt-secret-with-more-than-32-chars';
  });

  test('POST /register creates unconfirmed user and does not return auth token', async () => {
    const app = makeApp();

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id FROM users WHERE email = $1')) {
        return { get: jest.fn().mockResolvedValue(undefined) };
      }
      if (sql.includes('INSERT INTO users')) {
        return { run: jest.fn().mockResolvedValue({ lastInsertRowid: 42, changes: 1 }) };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Maria', email: 'maria@example.com', password: 'strong-pass-123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toEqual({
      id: 42,
      name: 'Maria',
      email: 'maria@example.com',
    });
    expect(res.body.message).toMatch(/Please check your email/i);
  });

  test('GET /confirm-email confirms valid token', async () => {
    const app = makeApp();

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id FROM users')) {
        return { get: jest.fn().mockResolvedValue({ id: 42 }) };
      }
      if (sql.includes('UPDATE users SET confirmed_at = NOW()')) {
        return { run: jest.fn().mockResolvedValue({ changes: 1 }) };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const res = await request(app)
      .get('/api/v1/auth/confirm-email')
      .query({ token: 'plain-token' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Email confirmed successfully' });
  });

  test('GET /confirm-email returns 400 when token is missing', async () => {
    const app = makeApp();

    const res = await request(app).get('/api/v1/auth/confirm-email');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Token is required' });
  });

  test('POST /register returns 503 and rolls back user when confirmation email fails', async () => {
    const app = makeApp();
    sendConfirmationEmail.mockResolvedValueOnce(false);

    const rollbackRun = jest.fn().mockResolvedValue({ changes: 1 });

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id FROM users WHERE email = $1')) {
        return { get: jest.fn().mockResolvedValue(undefined) };
      }
      if (sql.includes('INSERT INTO users')) {
        return { run: jest.fn().mockResolvedValue({ lastInsertRowid: 77, changes: 1 }) };
      }
      if (sql.includes('DELETE FROM users WHERE id = $1')) {
        return { run: rollbackRun };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Maria', email: 'maria@example.com', password: 'strong-pass-123' });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Unable to send confirmation email. Please try again.' });
    expect(rollbackRun).toHaveBeenCalledWith(77);
  });

  test('POST /forgot-password clears reset token when email delivery fails', async () => {
    const app = makeApp();
    sendPasswordResetEmail.mockResolvedValueOnce(false);

    const clearTokenRun = jest.fn().mockResolvedValue({ changes: 1 });

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id, name, email FROM users WHERE email = $1')) {
        return { get: jest.fn().mockResolvedValue({ id: 12, name: 'Ana', email: 'ana@example.com' }) };
      }
      if (sql.includes('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3')) {
        return { run: jest.fn().mockResolvedValue({ changes: 1 }) };
      }
      if (sql.includes('UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = $1')) {
        return { run: clearTokenRun };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'ana@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'If email exists, password reset link was sent' });
    expect(clearTokenRun).toHaveBeenCalledWith(12);
  });
});
