const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API limiter
exports.apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  200,
  'Too many requests. Please try again after 15 minutes.'
);

// Strict auth limiter
exports.authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'development' ? 100 : 10,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

// Search limiter
exports.searchLimiter = createLimiter(
  1 * 60 * 1000, // 1 minute
  30,
  'Too many search requests. Please slow down.'
);
