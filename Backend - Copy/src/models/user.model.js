// src/models/user.model.js
import pool from '../config/db.js';

export const findByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT user_id, nama, username, password, role, is_active FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
};

export const findById = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT user_id, nama, username, role, is_active, created_at FROM users WHERE user_id = ? LIMIT 1',
    [user_id]
  );
  return rows[0] || null;
};

export const updatePassword = async (user_id, hashedPassword) => {
  const [result] = await pool.execute(
    'UPDATE users SET password = ? WHERE user_id = ?',
    [hashedPassword, user_id]
  );
  return result.affectedRows > 0;
};
