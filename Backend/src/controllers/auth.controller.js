// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';
import * as R from '../utils/response.js';

/** POST /api/v1/auth/login */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);

    // Gunakan waktu konstan untuk mencegah timing attack
    const dummyHash = '$2b$12$invalid.hash.to.prevent.timing.attack.padding.here';
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !passwordMatch) {
      return R.unauthorized(res, 'Username atau password salah.');
    }

    if (!user.is_active) {
      return R.forbidden(res, 'Akun ini dinonaktifkan. Hubungi administrator.');
    }

    const token = signToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    });

    return R.success(res, {
      token,
      user: {
        user_id: user.user_id,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    }, 'Login berhasil');
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/auth/me */
export const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.user_id);
    if (!user) return R.notFound(res, 'Pengguna tidak ditemukan');
    return R.success(res, user);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/v1/auth/ubah-password */
export const ubahPassword = async (req, res, next) => {
  try {
    const { password_lama, password_baru } = req.body;

    const user = await UserModel.findByUsername(req.user.username);
    if (!user) return R.notFound(res, 'Pengguna tidak ditemukan');

    const match = await bcrypt.compare(password_lama, user.password);
    if (!match) return R.badRequest(res, 'Password lama salah.');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashed = await bcrypt.hash(password_baru, saltRounds);
    await UserModel.updatePassword(user.user_id, hashed);

    return R.success(res, null, 'Password berhasil diubah.');
  } catch (err) {
    next(err);
  }
};
