// routes/products.js
const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts
} = require('../controllers/productController');

const {
  validateCreateProduct,
  validateStockAdjustment,
  validateProductId
} = require('../middleware/validateProduct');

const router = express.Router();

// Public routes (no ID)
router.post('/', validateCreateProduct, createProduct);
router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);

// Routes with product ID — validate ID first
router.get('/:id', validateProductId, getProductById);
router.put('/:id', validateProductId, updateProduct);
router.delete('/:id', validateProductId, deleteProduct);

// Stock adjustment routes — validate ID and amount
router.patch('/:id/stock/increase', validateProductId, validateStockAdjustment, increaseStock);
router.patch('/:id/stock/decrease', validateProductId, validateStockAdjustment, decreaseStock);

module.exports = router;