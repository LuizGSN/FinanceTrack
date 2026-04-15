require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const { initializeDb, query } = require('./database/db');

const { authLimiter, apiLimiter, transactionLimiter } = require('./middleware/rateLimiters');
const logger = require('./utils/logger');
const swaggerSpecs = require('./swagger/config');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const investmentRoutes = require('./routes/investments');

const app = express();

// Seguranca
app.use(helmet());
app.set('trust proxy', 1);

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/', apiLimiter);
app.use('/api/v1/transactions', transactionLimiter);

// Rotas com versionamento
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/investments', investmentRoutes);

// Manter compatibilidade com versao anterior
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinanceTrack API Docs',
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  logger.error(`${statusCode}: ${err.message}`, { url: req.url, method: req.method });
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3000;

initializeDb().then(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      confirmation_token TEXT,
      confirmation_expires TIMESTAMP,
      confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reset_token TEXT,
      reset_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS investments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('stock', 'crypto', 'bond', 'real_state', 'fund', 'etf', 'option', 'future', 'other')),
      exchange TEXT,
      initial_amount NUMERIC NOT NULL,
      current_value NUMERIC NOT NULL,
      share_price NUMERIC,
      current_share_price NUMERIC,
      shares_count NUMERIC,
      purchase_date DATE,
      purchase_time TIME,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  logger.info('Database initialized');

  // Tentar usar HTTPS se certificados forem fornecidos
  if (process.env.SSL_CERT && process.env.SSL_KEY
    && fs.existsSync(process.env.SSL_CERT)
    && fs.existsSync(process.env.SSL_KEY)) {
    try {
      const httpsOptions = {
        cert: fs.readFileSync(process.env.SSL_CERT),
        key: fs.readFileSync(process.env.SSL_KEY),
      };
      https.createServer(httpsOptions, app).listen(PORT, () => {
        logger.info(`Secure server running on port ${PORT} (HTTPS)`);
      });
    } catch (err) {
      logger.warn(`HTTPS setup failed: ${err.message}`);
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} (HTTP)`);
      });
    }
  } else {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (HTTP)`);
    });
  }
}).catch((err) => {
  logger.error(`Failed to connect to database: ${err.message}`);
  process.exit(1);
});
