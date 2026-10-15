// src/controllers/stok.controller.js
import * as StokModel from '../models/stok.model.js';
import * as R from '../utils/response.js';

/** GET /api/v1/stok */
export const getAll = async (req, res, next) => {
  try {
    const data = await StokModel.getAll();
    return R.success(res, data);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/stok/:produk_id */
export const getByProdukId = async (req, res, next) => {
  try {
    const data = await StokModel.getByProdukId(parseInt(req.params.produk_id));
    if (!data) return R.notFound(res, 'Data stok tidak ditemukan');
    return R.success(res, data);
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/v1/stok/:produk_id - Update stok manual (masuk/keluar/koreksi) */
export const updateStok = async (req, res, next) => {
  try {
    const produk_id = parseInt(req.params.produk_id);
    const { jumlah_perubahan, tipe, keterangan } = req.body;

    const stokAda = await StokModel.getByProdukId(produk_id);
    if (!stokAda) return R.notFound(res, 'Data stok tidak ditemukan');

    const result = await StokModel.updateStok({
      produk_id,
      tipe,
      jumlah_perubahan: parseInt(jumlah_perubahan),
      keterangan,
      user_id: req.user.user_id,
    });

    return R.success(res, result, 'Stok berhasil diperbarui');
  } catch (err) {
    // Stok tidak cukup = 400, bukan 500
    if (err.message.includes('Stok')) {
      return R.badRequest(res, err.message);
    }
    next(err);
  }
};

/** PATCH /api/v1/stok/:produk_id/lokasi - Update lokasi freezer & stok minimum */
export const updateLokasi = async (req, res, next) => {
  try {
    const produk_id = parseInt(req.params.produk_id);
    const { lokasi_freezer, stok_minimum } = req.body;

    const stokAda = await StokModel.getByProdukId(produk_id);
    if (!stokAda) return R.notFound(res, 'Data stok tidak ditemukan');

    await StokModel.updateLokasi(produk_id, { lokasi_freezer, stok_minimum });
    const updated = await StokModel.getByProdukId(produk_id);
    return R.success(res, updated, 'Lokasi stok berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/stok/:produk_id/log - Riwayat perubahan stok */
export const getLog = async (req, res, next) => {
  try {
    const produk_id = parseInt(req.params.produk_id);
    const limit = parseInt(req.query.limit) || 20;
    const data = await StokModel.getLog(produk_id, limit);
    return R.success(res, data);
  } catch (err) {
    next(err);
  }
};
