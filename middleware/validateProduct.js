const { ValidationError } = require('../utils/errors');

// Helper: check if value is a non-empty string
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

// Helper: check if value is a non-negative integer
const isNonNegativeInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
};

// Middleware to validate product creation
const validateCreateProduct = (req, res, next) => {
  const { name, description, stock_quantity, low_stock_threshold } = req.body;

  // Validate name (required)
  if (!isNonEmptyString(name)) {
    return next(new ValidationError('Product name is required and must be a non-empty string'));
  }

  // Validate description (optional, but if present must be string)
  if (description !== undefined && typeof description !== 'string') {
    return next(new ValidationError('Description must be a string'));
  }

  // Validate stock_quantity (optional, default 0)
  if (stock_quantity !== undefined && !isNonNegativeInteger(stock_quantity)) {
    return next(new ValidationError('Stock quantity must be a non-negative integer'));
  }

  // Validate low_stock_threshold (optional, default 10)
  if (low_stock_threshold !== undefined && !isNonNegativeInteger(low_stock_threshold)) {
    return next(new ValidationError('Low stock threshold must be a non-negative integer'));
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.description = description ? description.trim() : '';
  req.body.stock_quantity = stock_quantity !== undefined ? Number(stock_quantity) : 0;
  req.body.low_stock_threshold = low_stock_threshold !== undefined ? Number(low_stock_threshold) : 10;

  next();
};

// Middleware to validate stock adjustment amount
const validateStockAdjustment = (req, res, next) => {
  const { amount } = req.body;

  if (amount === undefined) {
    return next(new ValidationError('Amount is required in request body'));
  }

  const num = Number(amount);
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return next(new ValidationError('Amount must be a positive integer'));
  }

  req.body.amount = num; // sanitize and attach as number
  next();
};

// Middleware to validate product ID in URL
const validateProductId = (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return next(new ValidationError('Product ID must be a positive integer'));
  }
  req.params.id = id; // replace with clean number
  next();
};

module.exports = {
  validateCreateProduct,
  validateStockAdjustment,
  validateProductId
};