// src/models/stok.model.js
import pool from '../config/db.js';

/** Ambil semua stok beserta info produk */
export const getAll = async () => {
  const [rows] = await pool.execute(`
    SELECT
      s.stok_id, s.produk_id, p.barcode, p.nama_produk,
      s.jumlah_stok, s.stok_minimum, s.lokasi_freezer, s.tanggal_update,
      CASE WHEN s.jumlah_stok <= s.stok_minimum THEN 1 ELSE 0 END AS perlu_restock
    FROM stok s
    JOIN produk p ON p.produk_id = s.produk_id
    WHERE p.is_active = 1
    ORDER BY p.nama_produk ASC
  `);
  return rows;
};

/** Ambil stok satu produk */
export const getByProdukId = async (produk_id) => {
  const [rows] = await pool.execute(`
    SELECT
      s.stok_id, s.produk_id, p.barcode, p.nama_produk,
      s.jumlah_stok, s.stok_minimum, s.lokasi_freezer, s.tanggal_update,
      CASE WHEN s.jumlah_stok <= s.stok_minimum THEN 1 ELSE 0 END AS perlu_restock
    FROM stok s
    JOIN produk p ON p.produk_id = s.produk_id
    WHERE s.produk_id = ? LIMIT 1
  `, [produk_id]);
  return rows[0] || null;
};

/**
 * Update stok dengan audit trail - menggunakan DB transaction
 * tipe: 'masuk' | 'keluar' | 'koreksi'
 */
export const updateStok = async ({ produk_id, tipe, jumlah_perubahan, keterangan, user_id, transaksi_id = null }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock row stok untuk mencegah race condition
    const [stokRows] = await conn.execute(
      'SELECT jumlah_stok FROM stok WHERE produk_id = ? FOR UPDATE',
      [produk_id]
    );

    if (stokRows.length === 0) throw new Error('Data stok tidak ditemukan');

    const stok_sebelum = stokRows[0].jumlah_stok;
    let stok_sesudah;

    if (tipe === 'masuk') {
      stok_sesudah = stok_sebelum + Math.abs(jumlah_perubahan);
    } else if (tipe === 'keluar') {
      stok_sesudah = stok_sebelum - Math.abs(jumlah_perubahan);
      if (stok_sesudah < 0) throw new Error('Stok tidak cukup');
    } else {
      // koreksi: jumlah_perubahan bisa negatif atau positif
      stok_sesudah = stok_sebelum + jumlah_perubahan;
      if (stok_sesudah < 0) throw new Error('Stok tidak boleh negatif');
    }

    // Update stok
    await conn.execute(
      'UPDATE stok SET jumlah_stok = ? WHERE produk_id = ?',
      [stok_sesudah, produk_id]
    );

    // Catat log
    await conn.execute(
      `INSERT INTO log_stok
       (produk_id, tipe, jumlah_perubahan, stok_sebelum, stok_sesudah, keterangan, transaksi_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [produk_id, tipe, jumlah_perubahan, stok_sebelum, stok_sesudah, keterangan || null, transaksi_id, user_id]
    );

    await conn.commit();
    return { stok_sebelum, stok_sesudah };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/** Update lokasi freezer dan stok minimum */
export const updateLokasi = async (produk_id, { lokasi_freezer, stok_minimum }) => {
  const fields = [];
  const values = [];

  if (lokasi_freezer !== undefined) { fields.push('lokasi_freezer = ?'); values.push(lokasi_freezer); }
  if (stok_minimum !== undefined)   { fields.push('stok_minimum = ?');   values.push(stok_minimum); }

  if (fields.length === 0) return false;

  values.push(produk_id);
  const [result] = await pool.execute(
    `UPDATE stok SET ${fields.join(', ')} WHERE produk_id = ?`,
    values
  );
  return result.affectedRows > 0;
};

/** Ambil log perubahan stok */
export const getLog = async (produk_id, limit = 20) => {
  const [rows] = await pool.execute(`
    SELECT
      l.log_id, l.tipe, l.jumlah_perubahan,
      l.stok_sebelum, l.stok_sesudah, l.keterangan,
      l.transaksi_id, l.created_at,
      u.nama AS nama_user
    FROM log_stok l
    JOIN users u ON u.user_id = l.user_id
    WHERE l.produk_id = ?
    ORDER BY l.created_at DESC
    LIMIT ?
  `, [produk_id, limit]);
  return rows;
};
