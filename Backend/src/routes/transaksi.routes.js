// src/routes/transaksi.routes.js
import { Router } from 'express';
import * as TransaksiController from '../controllers/transaksi.controller.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { buatTransaksiValidator, paramIdValidator } from '../validators/transaksi.validator.js';

const router = Router();

// Semua route transaksi perlu login
router.use(auth);

// POST /api/v1/transaksi  - admin & kasir bisa buat transaksi
router.post('/', buatTransaksiValidator, validate, TransaksiController.create);

// GET /api/v1/transaksi  - admin only (lihat semua)
router.get('/', authorize('admin'), TransaksiController.getAll);

// GET /api/v1/transaksi/:id  - admin only
router.get('/:id', authorize('admin'), paramIdValidator, validate, TransaksiController.getById);

export default router;
