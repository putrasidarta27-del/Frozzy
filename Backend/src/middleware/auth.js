// src/middleware/auth.js
// Middleware verifikasi JWT - wajib dipasang di semua route yang perlu login

import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/response.js';

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Harus ada header: Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { user_id, username, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Sesi habis. Silakan login kembali.');
    }
    return unauthorized(res, 'Token tidak valid.');
  }
};

export default auth;
