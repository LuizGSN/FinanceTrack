const express = require('express');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/database/db', () => ({
  prepare: jest.fn(),
}));

const { prepare } = require('../src/database/db');
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

  test('POST /change-password updates password for authenticated user', async () => {
    const app = makeApp();
    const oldHash = await bcrypt.hash('old-password', 4);
    const updateRun = jest.fn().mockResolvedValue({ changes: 1 });

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id, password FROM users WHERE id = $1')) {
        return { get: jest.fn().mockResolvedValue({ id: 12, password: oldHash }) };
      }
      if (sql.includes('UPDATE users SET password = $1 WHERE id = $2')) {
        return { run: updateRun };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const token = jwt.sign({ id: 12 }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'old-password', newPassword: 'new-password' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Password changed successfully' });
    expect(updateRun).toHaveBeenCalledWith(expect.any(String), 12);
  });

  test('POST /change-password rejects incorrect current password', async () => {
    const app = makeApp();
    const oldHash = await bcrypt.hash('old-password', 4);

    prepare.mockImplementation((sql) => {
      if (sql.includes('SELECT id, password FROM users WHERE id = $1')) {
        return { get: jest.fn().mockResolvedValue({ id: 12, password: oldHash }) };
      }
      return { get: jest.fn(), run: jest.fn(), all: jest.fn() };
    });

    const token = jwt.sign({ id: 12 }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrong-password', newPassword: 'new-password' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Current password is incorrect' });
  });
});
