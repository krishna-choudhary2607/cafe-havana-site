import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool;

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'cafe_db',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// If DATABASE_URL is present, use it directly (common for cloud deployment)
if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool(config);
}

// MySQL query wrapper
export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// MySQL run wrapper (inserts/updates)
export const run = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId, changes: result.affectedRows };
};

// MySQL get single row wrapper
export const get = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

// Initialize Tables (MySQL Syntax)
export async function initDatabase() {
  // 1. Create Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'staff'
    )
  `);

  // 2. Create Orders Table
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      tableNumber INT NOT NULL,
      total DOUBLE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      items TEXT NOT NULL,
      date VARCHAR(100) NOT NULL
    )
  `);

  // 3. Create Reservations Table
  await run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(255) PRIMARY KEY,
      reservationNo VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      date VARCHAR(100) NOT NULL,
      time VARCHAR(100) NOT NULL,
      guests INT NOT NULL,
      request TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      createdAt VARCHAR(100) NOT NULL
    )
  `);

  // Seed default admin account if users table is empty
  const users = await query('SELECT * FROM users');
  if (users.length === 0) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'krishna123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
    console.log('[DB] Seeded default admin account in MySQL (username: admin)');
  }
}

export default { query, run, get, initDatabase };
