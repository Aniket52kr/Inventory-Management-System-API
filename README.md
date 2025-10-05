# 📦 Inventory Management System API

A robust, production-ready RESTful API for managing warehouse inventory with full CRUD operations, stock tracking, and low-stock alerts.

Built with **Node.js**, **Express**, and **MySQL**.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL (v5.7+ or MariaDB)
- **Driver**: `mysql2` (with Promise support)
- **Architecture**: MVC-inspired (Routes → Controllers → Models)

---

## 🗃️ Database Schema

Run the following SQL to set up your database:

```sql
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);