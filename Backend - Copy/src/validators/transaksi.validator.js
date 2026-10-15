// src/validators/transaksi.validator.js
import { body, param } from 'express-validator';

export const buatTransaksiValidator = [
  body('kanal_penjualan')
    .optional()
    .isIn(['offline', 'shopee', 'lainnya']).withMessage('Kanal penjualan tidak valid'),

  body('metode_bayar')
    .optional()
    .isIn(['cash', 'transfer']).withMessage('Metode bayar harus cash atau transfer'),

  body('catatan')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Catatan maks 500 karakter'),

  body('items')
    .isArray({ min: 1 }).withMessage('Minimal 1 item dalam transaksi'),

  body('items.*.produk_id')
    .isInt({ min: 1 }).withMessage('ID produk tidak valid'),

  body('items.*.jumlah')
    .isInt({ min: 1 }).withMessage('Jumlah harus minimal 1'),
];

export const paramIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID tidak valid'),
];
