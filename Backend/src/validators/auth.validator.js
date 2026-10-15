// src/validators/auth.validator.js
import { body } from 'express-validator';

export const loginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username hanya boleh huruf, angka, dan underscore'),

  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6, max: 100 }).withMessage('Password harus 6-100 karakter'),
];

export const ubahPasswordValidator = [
  body('password_lama')
    .notEmpty().withMessage('Password lama wajib diisi'),

  body('password_baru')
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 8, max: 100 }).withMessage('Password baru minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(
      'Password harus mengandung huruf besar, huruf kecil, dan angka'
    ),
];
