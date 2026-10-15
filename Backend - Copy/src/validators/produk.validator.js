// src/validators/produk.validator.js
import { body, param, query } from 'express-validator';

export const tambahProdukValidator = [
  body('barcode')
    .trim()
    .notEmpty().withMessage('Barcode wajib diisi')
    .isLength({ min: 1, max: 50 }).withMessage('Barcode maks 50 karakter'),

  body('nama_produk')
    .trim()
    .notEmpty().withMessage('Nama produk wajib diisi')
    .isLength({ min: 2, max: 150 }).withMessage('Nama produk 2-150 karakter'),

  body('harga_beli')
    .notEmpty().withMessage('Harga beli wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga beli harus angka positif'),

  body('harga_jual')
    .notEmpty().withMessage('Harga jual wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga jual harus angka positif'),

  body('stok_awal')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok awal harus angka >= 0'),

  body('stok_minimum')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok minimum harus angka >= 0'),

  body('satuan')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Satuan maks 20 karakter'),

  body('deskripsi')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Deskripsi maks 500 karakter'),

  body('lokasi_freezer')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Lokasi freezer maks 50 karakter'),
];

export const updateProdukValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID produk tidak valid'),

  body('nama_produk')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Nama produk 2-150 karakter'),

  body('harga_beli')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga beli harus angka positif'),

  body('harga_jual')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga jual harus angka positif'),

  body('satuan')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Satuan maks 20 karakter'),

  body('deskripsi')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Deskripsi maks 500 karakter'),
];

export const paramIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID tidak valid'),
];

export const barcodeValidator = [
  param('barcode')
    .trim()
    .notEmpty().withMessage('Barcode wajib diisi')
    .isLength({ min: 1, max: 50 }).withMessage('Barcode tidak valid'),
];
