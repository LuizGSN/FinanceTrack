const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('../utils/ipKeyGenerator');

function readPositiveInt(name, defaultValue) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isInteger(value) && value > 0 ? value : defaultValue;
}

const authWindowMinutes = readPositiveInt('AUTH_RATE_LIMIT_WINDOW', 15);
const authMax = readPositiveInt('AUTH_RATE_LIMIT_MAX', 20);
const apiMax = readPositiveInt('API_RATE_LIMIT_MAX', 300);
const transactionMax = readPositiveInt('TRANSACTION_RATE_LIMIT_MAX', 100);

// Rate limiting para autenticacao (login/register)
const authLimiter = rateLimit({
  windowMs: authWindowMinutes * 60 * 1000,
  max: authMax,
  message: { error: `Too many authentication attempts. Try again in ${authWindowMinutes} minutes.` },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  keyGenerator: ipKeyGenerator,
});

// Rate limiting geral para API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: apiMax,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Rate limiting para transacoes
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: transactionMax,
  message: { error: 'Too many transaction requests. Please wait before making more requests.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  apiLimiter,
  transactionLimiter,
};
