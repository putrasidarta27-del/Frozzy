// src/controllers/produk.controller.js
import * as ProdukModel from '../models/produk.model.js';
import * as R from '../utils/response.js';

/** GET /api/v1/produk */
export const getAll = async (req, res, next) => {
  try {
    const data = await ProdukModel.getAll();
    return R.success(res, data);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/produk/:id */
export const getById = async (req, res, next) => {
  try {
    const produk = await ProdukModel.getById(parseInt(req.params.id));
    if (!produk) return R.notFound(res, 'Produk tidak ditemukan');
    return R.success(res, produk);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/produk/barcode/:barcode */
export const getByBarcode = async (req, res, next) => {
  try {
    const produk = await ProdukModel.getByBarcode(req.params.barcode);
    if (!produk) return R.notFound(res, 'Produk dengan barcode tersebut tidak ditemukan');
    return R.success(res, produk);
  } catch (err) {
    next(err);
  }
};

/** POST /api/v1/produk */
export const create = async (req, res, next) => {
  try {
    const produk_id = await ProdukModel.create(req.body);
    const produk = await ProdukModel.getById(produk_id);
    return R.created(res, produk, 'Produk berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
};

/** PUT /api/v1/produk/:id */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await ProdukModel.getById(id);
    if (!exists) return R.notFound(res, 'Produk tidak ditemukan');

    await ProdukModel.update(id, req.body);
    const updated = await ProdukModel.getById(id);
    return R.success(res, updated, 'Produk berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/v1/produk/:id */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await ProdukModel.getById(id);
    if (!exists) return R.notFound(res, 'Produk tidak ditemukan');

    await ProdukModel.softDelete(id);
    return R.success(res, null, 'Produk berhasil dihapus');
  } catch (err) {
    next(err);
  }
};
