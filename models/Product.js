const db = require('../config/db');
const { InsufficientStockError } = require('../utils/errors');

class Product {
  // Create a new product
  static async create({ name, description, stock_quantity = 0, low_stock_threshold = 10 }) {
    if (stock_quantity < 0) {
      throw new Error('Initial stock quantity cannot be negative');
    }
    if (low_stock_threshold < 0) {
      throw new Error('Low stock threshold cannot be negative');
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, description, stock_quantity, low_stock_threshold)
       VALUES (?, ?, ?, ?)`,
      [name, description, stock_quantity, low_stock_threshold]
    );

    return {
      id: result.insertId,
      name,
      description,
      stock_quantity: Number(stock_quantity),
      low_stock_threshold: Number(low_stock_threshold)
    };
  }

  // Get all products
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY id');
    return rows.map(row => ({
      ...row,
      stock_quantity: Number(row.stock_quantity),
      low_stock_threshold: Number(row.low_stock_threshold)
    }));
  }

  // Get product by ID
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return null;

    const product = rows[0];
    return {
      ...product,
      stock_quantity: Number(product.stock_quantity),
      low_stock_threshold: Number(product.low_stock_threshold)
    };
  }

  // Update product (name and description only — NOT stock)
  static async update(id, { name, description }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null; // Product not found
    }

    return await this.findById(id);
  }

  // Delete a product
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Increase stock quantity
  static async increaseStock(id, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be a positive integer');
    }

    const [result] = await db.execute(
      `UPDATE products 
       SET stock_quantity = stock_quantity + ? 
       WHERE id = ? AND stock_quantity >= 0`,
      [amount, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Product not found');
    }

    return await this.findById(id);
  }

  // Decrease stock quantity (with validation)
  static async decreaseStock(id, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be a positive integer');
    }

    // Use a transaction to safely check and update
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lock the row for update to prevent race conditions
      const [rows] = await connection.execute(
        'SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('Product not found');
      }

      const currentStock = rows[0].stock_quantity;

      if (currentStock < amount) {
        throw new InsufficientStockError(
          `Insufficient stock. Available: ${currentStock}, Requested: ${amount}`
        );
      }

      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [amount, id]
      );

      await connection.commit();
      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all products below low_stock_threshold
  static async getLowStockProducts() {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE stock_quantity < low_stock_threshold ORDER BY stock_quantity ASC'
    );
    return rows.map(row => ({
      ...row,
      stock_quantity: Number(row.stock_quantity),
      low_stock_threshold: Number(row.low_stock_threshold)
    }));
  }
}

module.exports = Product;