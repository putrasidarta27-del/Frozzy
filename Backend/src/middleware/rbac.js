// src/middleware/rbac.js
// Role-Based Access Control: batasi akses berdasarkan role

import { forbidden } from '../utils/response.js';

/**
 * Hanya izinkan role tertentu
 * Contoh penggunaan: authorize('admin') atau authorize('admin', 'kasir')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Tidak ada informasi pengguna.');
    }
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Akses ditolak. Hanya ${roles.join(' atau ')} yang diizinkan.`);
    }
    next();
  };
};
