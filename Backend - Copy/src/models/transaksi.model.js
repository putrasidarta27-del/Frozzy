// src/models/transaksi.model.js
import pool from '../config/db.js';
import { updateStok } from './stok.model.js';

/** Generate kode transaksi unik: TRX-YYYYMMDD-XXXX */
const generateKode = async (conn) => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await conn.execute(
    "SELECT COUNT(*) AS cnt FROM transaksi WHERE DATE(tanggal) = CURDATE()"
  );
  const urut = String(rows[0].cnt + 1).padStart(4, '0');
  return `TRX-${dateStr}-${urut}`;
};

/** Buat transaksi baru (atomic: transaksi + detail + kurangi stok + log) */
export const create = async ({ kanal_penjualan, metode_bayar, catatan, items, user_id }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validasi & ambil harga produk
    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const [prodRows] = await conn.execute(
        'SELECT produk_id, nama_produk, harga_jual FROM produk WHERE produk_id = ? AND is_active = 1 FOR UPDATE',
        [item.produk_id]
      );
      if (prodRows.length === 0) throw new Error(`Produk ID ${item.produk_id} tidak ditemukan`);

      const [stokRows] = await conn.execute(
        'SELECT jumlah_stok FROM stok WHERE produk_id = ? FOR UPDATE',
        [item.produk_id]
      );
      if (stokRows.length === 0 || stokRows[0].jumlah_stok < item.jumlah) {
        throw new Error(`Stok ${prodRows[0].nama_produk} tidak cukup (tersedia: ${stokRows[0]?.jumlah_stok ?? 0})`);
      }

      const subtotal = prodRows[0].harga_jual * item.jumlah;
      total += subtotal;
      enrichedItems.push({
        produk_id: item.produk_id,
        nama_produk: prodRows[0].nama_produk,
        jumlah: item.jumlah,
        harga_satuan: prodRows[0].harga_jual,
        subtotal,
        stok_sebelum: stokRows[0].jumlah_stok,
      });
    }

    // Buat header transaksi
    const kode = await generateKode(conn);
    const [trxResult] = await conn.execute(
      `INSERT INTO transaksi (kode_transaksi, total, kanal_penjualan, metode_bayar, catatan, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [kode, total, kanal_penjualan || 'offline', metode_bayar || 'cash', catatan || null, user_id]
    );
    const transaksi_id = trxResult.insertId;

    // Insert detail & update stok + log
    for (const item of enrichedItems) {
      await conn.execute(
        `INSERT INTO detail_transaksi (transaksi_id, produk_id, jumlah, harga_satuan, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [transaksi_id, item.produk_id, item.jumlah, item.harga_satuan, item.subtotal]
      );

      // Kurangi stok
      const stok_sesudah = item.stok_sebelum - item.jumlah;
      await conn.execute(
        'UPDATE stok SET jumlah_stok = ? WHERE produk_id = ?',
        [stok_sesudah, item.produk_id]
      );

      // Catat log stok
      await conn.execute(
        `INSERT INTO log_stok
         (produk_id, tipe, jumlah_perubahan, stok_sebelum, stok_sesudah, keterangan, transaksi_id, user_id)
         VALUES (?, 'keluar', ?, ?, ?, ?, ?, ?)`,
        [item.produk_id, item.jumlah, item.stok_sebelum, stok_sesudah, `Penjualan ${kode}`, transaksi_id, user_id]
      );
    }

    await conn.commit();
    return { transaksi_id, kode_transaksi: kode, total };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/** Ambil semua transaksi (dengan paginasi) */
export const getAll = async ({ page = 1, limit = 20, tanggal } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';

  if (tanggal) {
    where = 'WHERE DATE(t.tanggal) = ?';
    params.push(tanggal);
  }

  const [rows] = await pool.execute(`
    SELECT
      t.transaksi_id, t.kode_transaksi, t.tanggal,
      t.total, t.kanal_penjualan, t.metode_bayar, t.catatan,
      u.nama AS nama_kasir
    FROM transaksi t
    JOIN users u ON u.user_id = t.user_id
    ${where}
    ORDER BY t.tanggal DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [[{ total: totalData }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM transaksi t ${where}`,
    params
  );

  return { data: rows, total: totalData, page, limit };
};

/** Ambil detail satu transaksi */
export const getById = async (transaksi_id) => {
  const [trxRows] = await pool.execute(`
    SELECT
      t.transaksi_id, t.kode_transaksi, t.tanggal,
      t.total, t.kanal_penjualan, t.metode_bayar, t.catatan,
      u.nama AS nama_kasir
    FROM transaksi t
    JOIN users u ON u.user_id = t.user_id
    WHERE t.transaksi_id = ? LIMIT 1
  `, [transaksi_id]);

  if (!trxRows[0]) return null;

  const [detailRows] = await pool.execute(`
    SELECT
      d.detail_id, d.produk_id, p.nama_produk, p.barcode,
      d.jumlah, d.harga_satuan, d.subtotal
    FROM detail_transaksi d
    JOIN produk p ON p.produk_id = d.produk_id
    WHERE d.transaksi_id = ?
  `, [transaksi_id]);

  return { ...trxRows[0], items: detailRows };
};
