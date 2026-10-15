// src/routes/stok.routes.js
import { Router } from 'express';
import * as StokController from '../controllers/stok.controller.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { updateStokValidator, updateLokasiValidator } from '../validators/stok.validator.js';

const router = Router();

// Semua route stok perlu login
router.use(auth);

// GET /api/v1/stok  - admin & kasir
router.get('/', StokController.getAll);

// GET /api/v1/stok/:produk_id  - admin & kasir
router.get('/:produk_id', StokController.getByProdukId);

// GET /api/v1/stok/:produk_id/log  - admin only
router.get('/:produk_id/log', authorize('admin'), StokController.getLog);

// PATCH /api/v1/stok/:produk_id  - admin only (manual update stok)
router.patch('/:produk_id', authorize('admin'), updateStokValidator, validate, StokController.updateStok);

// PATCH /api/v1/stok/:produk_id/lokasi  - admin only
router.patch('/:produk_id/lokasi', authorize('admin'), updateLokasiValidator, validate, StokController.updateLokasi);

export default router;
