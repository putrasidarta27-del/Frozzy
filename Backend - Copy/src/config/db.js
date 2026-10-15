// src/config/db.js
// Connection pool MySQL dengan error handling

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'frozzy_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00',
});

// Test koneksi saat startup
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database terhubung:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Koneksi database gagal:', err.message);
    process.exit(1);
  }
}

export default pool;
