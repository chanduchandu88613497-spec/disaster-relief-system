/**
 * Custom application error class with HTTP status codes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps async route handlers to catch rejected promises
 * and forward errors to Express error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validates that required fields exist in req.body
 * Returns middleware function
 */
const validateRequired = (fields) => (req, res, next) => {
  const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      { missingFields: missing }
    );
  }
  next();
};

/**
 * Global error handling middleware — must be registered last
 */
const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  // Log full error in development
  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  if (!err.isOperational) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      ...(err.details && { details: err.details })
    }
  });
};

/**
 * 404 catch-all for unknown routes
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = {
  AppError,
  asyncHandler,
  validateRequired,
  globalErrorHandler,
  notFoundHandler
};
