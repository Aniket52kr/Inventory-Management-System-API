// controllers/productController.js
const Product = require('../models/Product');
const { InsufficientStockError } = require('../utils/errors');

// Helper: validate positive integer
const validatePositiveInt = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return num;
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, stock_quantity = 0, low_stock_threshold = 10 } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required and must be a non-empty string' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      stock_quantity: Number(stock_quantity),
      low_stock_threshold: Number(low_stock_threshold)
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('cannot be negative')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// GET /api/products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { name, description } = req.body;
    if (name === undefined && description === undefined) {
      return res.status(400).json({ error: 'At least one field (name or description) must be provided' });
    }

    const product = await Product.update(id, { name, description });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const deleted = await Product.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock/increase
const increaseStock = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { amount } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required in request body' });
    }

    const amountNum = validatePositiveInt(amount, 'Amount');
    const product = await Product.increaseStock(id, amountNum);
    res.json(product);
  } catch (err) {
    if (err.message === 'Product not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('must be a positive integer')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/products/:id/stock/decrease
const decreaseStock = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { amount } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required in request body' });
    }

    const amountNum = validatePositiveInt(amount, 'Amount');
    const product = await Product.decreaseStock(id, amountNum);
    res.json(product);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Product not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('must be a positive integer')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// GET /api/products/low-stock
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.getLowStockProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts
};