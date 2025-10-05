# 📦 Inventory Management System API

A robust, production-ready RESTful API for managing warehouse inventory with full CRUD operations, stock tracking, and low-stock alerts.

Built with **Node.js**, **Express**, and **MySQL**.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 
- **Framework**: Express.js
- **Database**: MySQL 
- **Driver**: `mysql2` 
- **Architecture**: MVC-inspired (Routes → Controllers → Models)

---


## Assumptions & Design Choices

- Stock updates are NOT allowed via general product update
→ Stock changes must go through dedicated /increase and /decrease endpoints to enforce business rules.

- Stock operations are atomic and race-condition safe
→ Uses MySQL transactions with FOR UPDATE row locking during stock decrease.

- Input validation is centralized in middleware
→ Controllers assume valid input, improving readability and testability.

- All errors are standardized
→ Custom error classes (InsufficientStockError, etc.) ensure consistent HTTP responses.

- No authentication
→ Assumed to be handled by a gateway or added later; focus is on core inventory logic.


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
