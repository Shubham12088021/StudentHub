/**
 * Simple in-memory rate limiter (use express-rate-limit in production)
 */

const requestCounts = {};

/**
 * Rate limit middleware factory
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requestCounts[key]) {
      requestCounts[key] = { count: 1, resetAt: now + windowMs };
      return next();
    }

    if (now > requestCounts[key].resetAt) {
      requestCounts[key] = { count: 1, resetAt: now + windowMs };
      return next();
    }

    requestCounts[key].count++;

    if (requestCounts[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requestCounts[key].resetAt - now) / 1000),
      });
    }

    next();
  };
};

// Auth-specific stricter rate limit (10 attempts per 15 min)
const authRateLimit = rateLimit(10, 15 * 60 * 1000);

// General API rate limit (200 per 15 min)
const apiRateLimit = rateLimit(200, 15 * 60 * 1000);

module.exports = { rateLimit, authRateLimit, apiRateLimit };
