const express = require('express');
const request = require('supertest');

jest.mock('../src/database/db', () => ({
  prepare: jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

const { prepare } = require('../src/database/db');
const { sendPasswordResetEmail } = require('../src/services/emailService');
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

  test('POST /register creates user and does not return auth token', async () => {
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
    expect(res.body.message).toBe('User created successfully.');
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
