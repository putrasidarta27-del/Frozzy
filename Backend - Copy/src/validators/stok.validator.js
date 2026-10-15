// src/validators/stok.validator.js
import { body, param } from 'express-validator';

export const updateStokValidator = [
  param('produk_id')
    .isInt({ min: 1 }).withMessage('ID produk tidak valid'),

  body('jumlah_perubahan')
    .notEmpty().withMessage('Jumlah perubahan wajib diisi')
    .isInt().withMessage('Jumlah perubahan harus berupa angka bulat'),

  body('tipe')
    .notEmpty().withMessage('Tipe perubahan wajib diisi')
    .isIn(['masuk', 'keluar', 'koreksi']).withMessage('Tipe harus: masuk, keluar, atau koreksi'),

  body('keterangan')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Keterangan maks 255 karakter'),
];

export const updateLokasiValidator = [
  param('produk_id')
    .isInt({ min: 1 }).withMessage('ID produk tidak valid'),

  body('lokasi_freezer')
    .trim()
    .notEmpty().withMessage('Lokasi freezer wajib diisi')
    .isLength({ max: 50 }).withMessage('Lokasi freezer maks 50 karakter'),

  body('stok_minimum')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok minimum harus >= 0'),
];
