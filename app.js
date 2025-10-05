// app.js
const express = require('express');
const productsRouter = require('./routes/products');

const app = express();

app.use(express.json({ limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/products', productsRouter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Inventory Management API is running!' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;