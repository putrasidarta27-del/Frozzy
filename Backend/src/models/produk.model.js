// src/models/produk.model.js
import pool from '../config/db.js';

/** Ambil semua produk aktif beserta stok */
export const getAll = async () => {
  const [rows] = await pool.execute(`
    SELECT
      p.produk_id, p.barcode, p.nama_produk, p.deskripsi,
      p.harga_beli, p.harga_jual, p.satuan, p.is_active,
      COALESCE(s.jumlah_stok, 0) AS jumlah_stok,
      s.stok_minimum, s.lokasi_freezer
    FROM produk p
    LEFT JOIN stok s ON s.produk_id = p.produk_id
    WHERE p.is_active = 1
    ORDER BY p.nama_produk ASC
  `);
  return rows;
};

/** Cari produk by ID */
export const getById = async (produk_id) => {
  const [rows] = await pool.execute(`
    SELECT
      p.produk_id, p.barcode, p.nama_produk, p.deskripsi,
      p.harga_beli, p.harga_jual, p.satuan, p.is_active,
      COALESCE(s.jumlah_stok, 0) AS jumlah_stok,
      s.stok_minimum, s.lokasi_freezer, p.created_at, p.updated_at
    FROM produk p
    LEFT JOIN stok s ON s.produk_id = p.produk_id
    WHERE p.produk_id = ? LIMIT 1
  `, [produk_id]);
  return rows[0] || null;
};

/** Cari produk by barcode (Code128) */
export const getByBarcode = async (barcode) => {
  const [rows] = await pool.execute(`
    SELECT
      p.produk_id, p.barcode, p.nama_produk, p.deskripsi,
      p.harga_beli, p.harga_jual, p.satuan,
      COALESCE(s.jumlah_stok, 0) AS jumlah_stok,
      s.stok_minimum, s.lokasi_freezer
    FROM produk p
    LEFT JOIN stok s ON s.produk_id = p.produk_id
    WHERE p.barcode = ? AND p.is_active = 1
    LIMIT 1
  `, [barcode]);
  return rows[0] || null;
};

/** Tambah produk baru (dengan transaksi DB) */
export const create = async ({ barcode, nama_produk, deskripsi, harga_beli, harga_jual, satuan, stok_awal, stok_minimum, lokasi_freezer }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO produk (barcode, nama_produk, deskripsi, harga_beli, harga_jual, satuan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [barcode, nama_produk, deskripsi || null, harga_beli, harga_jual, satuan || 'pcs']
    );
    const produk_id = result.insertId;

    await conn.execute(
      `INSERT INTO stok (produk_id, jumlah_stok, stok_minimum, lokasi_freezer)
       VALUES (?, ?, ?, ?)`,
      [produk_id, stok_awal || 0, stok_minimum || 5, lokasi_freezer || null]
    );

    await conn.commit();
    return produk_id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/** Update data produk */
export const update = async (produk_id, { nama_produk, deskripsi, harga_beli, harga_jual, satuan }) => {
  const fields = [];
  const values = [];

  if (nama_produk !== undefined) { fields.push('nama_produk = ?'); values.push(nama_produk); }
  if (deskripsi !== undefined)  { fields.push('deskripsi = ?');  values.push(deskripsi); }
  if (harga_beli !== undefined) { fields.push('harga_beli = ?'); values.push(harga_beli); }
  if (harga_jual !== undefined) { fields.push('harga_jual = ?'); values.push(harga_jual); }
  if (satuan !== undefined)     { fields.push('satuan = ?');     values.push(satuan); }

  if (fields.length === 0) return false;

  values.push(produk_id);
  const [result] = await pool.execute(
    `UPDATE produk SET ${fields.join(', ')} WHERE produk_id = ?`,
    values
  );
  return result.affectedRows > 0;
};

/** Soft delete produk */
export const softDelete = async (produk_id) => {
  const [result] = await pool.execute(
    'UPDATE produk SET is_active = 0 WHERE produk_id = ?',
    [produk_id]
  );
  return result.affectedRows > 0;
};
