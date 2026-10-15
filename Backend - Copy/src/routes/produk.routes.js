// src/routes/produk.routes.js
import { Router } from 'express';
import * as ProdukController from '../controllers/produk.controller.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import {
  tambahProdukValidator,
  updateProdukValidator,
  paramIdValidator,
  barcodeValidator,
} from '../validators/produk.validator.js';

const router = Router();

// Semua route produk perlu login
router.use(auth);

// GET /api/v1/produk  - admin & kasir
router.get('/', ProdukController.getAll);

// GET /api/v1/produk/barcode/:barcode  - admin & kasir (untuk scan barcode)
router.get('/barcode/:barcode', barcodeValidator, validate, ProdukController.getByBarcode);

// GET /api/v1/produk/:id  - admin & kasir
router.get('/:id', paramIdValidator, validate, ProdukController.getById);

// POST /api/v1/produk  - admin only
router.post('/', authorize('admin'), tambahProdukValidator, validate, ProdukController.create);

// PUT /api/v1/produk/:id  - admin only
router.put('/:id', authorize('admin'), updateProdukValidator, validate, ProdukController.update);

// DELETE /api/v1/produk/:id  - admin only
router.delete('/:id', authorize('admin'), paramIdValidator, validate, ProdukController.remove);

export default router;
