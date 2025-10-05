// utils/errors.js

class InsufficientStockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientStockError';
    this.statusCode = 400;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = {
  InsufficientStockError,
  ValidationError,
  NotFoundError
};