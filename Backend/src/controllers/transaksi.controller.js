// src/controllers/transaksi.controller.js
import * as TransaksiModel from '../models/transaksi.model.js';
import * as R from '../utils/response.js';

/** POST /api/v1/transaksi */
export const create = async (req, res, next) => {
  try {
    const result = await TransaksiModel.create({
      ...req.body,
      user_id: req.user.user_id,
    });
    const detail = await TransaksiModel.getById(result.transaksi_id);
    return R.created(res, detail, 'Transaksi berhasil dicatat');
  } catch (err) {
    // Error stok tidak cukup = 400
    if (err.message.includes('Stok') || err.message.includes('tidak ditemukan')) {
      return R.badRequest(res, err.message);
    }
    next(err);
  }
};

/** GET /api/v1/transaksi */
export const getAll = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tanggal = req.query.tanggal || null; // format: YYYY-MM-DD

    const result = await TransaksiModel.getAll({ page, limit, tanggal });
    return R.success(res, result);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/transaksi/:id */
export const getById = async (req, res, next) => {
  try {
    const data = await TransaksiModel.getById(parseInt(req.params.id));
    if (!data) return R.notFound(res, 'Transaksi tidak ditemukan');
    return R.success(res, data);
  } catch (err) {
    next(err);
  }
};
