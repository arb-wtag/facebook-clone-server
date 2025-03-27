const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per window
  message: { error: "Too many requests, please try again later." },
  headers: true, // Include rate limit headers in the response
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150, // Limit each IP to 5 login attempts per window
  message: { error: "Too many login attempts, please try again later." },
});

module.exports = { apiLimiter, authLimiter };
