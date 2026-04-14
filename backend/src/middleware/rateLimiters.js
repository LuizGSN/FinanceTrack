const rateLimit = require('express-rate-limit');

// Rate limiting para autenticação (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máx 5 tentativas por IP
  message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => {
    // Usar IP do cliente real (de trás de reverse proxy)
    return req.ip || req.connection.remoteAddress;
  },
});

// Rate limiting geral para API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máx 100 requisições por IP
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Rate limiting para transações (mais restritivo)
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máx 30 requisições por IP
  message: { error: 'Too many transaction requests. Please wait before making more requests.' },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  apiLimiter,
  transactionLimiter,
};
