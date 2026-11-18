import express from 'express';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';

const router = express.Router();

// Pengaturan yang mudah diubah
const METODE_VALID = ['Tunai', 'QRIS', 'Transfer'];
const KANAL_TOKO = 1; // kolom kanal_penjualan bertipe angka: 1 = Toko, 0 = Online
const NAMA_KANAL = { 1: 'Toko', 0: 'Online' };
const MAKS_ITEM = 50;

const dua = (n) => String(n).padStart(2, '0');

// Kode TRX-YYYYMMDD-NNN dibuat dari tanggal transaksi + id_transaksi
function buatKode(tgl, id) {
  const d = new Date(tgl);
  const tanggal = `${d.getFullYear()}${dua(d.getMonth() + 1)}${dua(d.getDate())}`;
  return `TRX-${tanggal}-${String(id).padStart(3, '0')}`;
}

function keAngka(v) {
  const s = String(v ?? '').trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : null;
}

const SELECT_HEADER = `
  SELECT t.id_transaksi, t.id_user, t.tgl_transaksi, t.total_transaksi,
         t.kanal_penjualan, t.metode_transaksi, u.nama AS kasir,
         (SELECT COALESCE(SUM(d.jumlah_transaksi), 0)
            FROM detail_transaksi d WHERE d.id_transaksi = t.id_transaksi) AS jumlah_item
  FROM transaksi t
  JOIN users u ON u.id = t.id_user
`;

function formatHeader(row) {
  return {
    id_transaksi: row.id_transaksi,
    kode: buatKode(row.tgl_transaksi, row.id_transaksi),
    tanggal: row.tgl_transaksi,
    total_transaksi: row.total_transaksi,
    metode: row.metode_transaksi,
    kanal: NAMA_KANAL[row.kanal_penjualan] ?? 'Toko',
    kasir: row.kasir,
    id_user: row.id_user,
    jumlah_item: Number(row.jumlah_item),
  };
}

async function ambilDetail(id) {
  const [h] = await pool.query(`${SELECT_HEADER} WHERE t.id_transaksi = ?`, [id]);
  if (!h[0]) return null;
  const [items] = await pool.query(
    `SELECT d.id_produk, p.barcode, p.nama_produk, d.jumlah_transaksi AS jumlah,
            d.harga_satuan, d.subtotal, p.image_url
     FROM detail_transaksi d
     JOIN produk p ON p.id_produk = d.id_produk
     WHERE d.id_transaksi = ?
     ORDER BY d.id_detail`,
    [id]
  );
  return { ...formatHeader(h[0]), items };
}

// Semua rute transaksi wajib login
router.use(wajibLogin);

// POST /transaksi : buat transaksi penjualan
// Body JSON: { "metode": "Tunai", "items": [ { "id_produk": 3, "jumlah": 2 } ] }
// Harga dan total dihitung oleh server dari database, bukan dari aplikasi.
router.post('/', async (req, res) => {
  const metode = String(req.body.metode ?? '').trim();
  if (!METODE_VALID.includes(metode)) {
    return res.status(400).json({ pesan: `Metode pembayaran harus salah satu dari: ${METODE_VALID.join(', ')}` });
  }

  const mentah = req.body.items;
  if (!Array.isArray(mentah) || mentah.length === 0) {
    return res.status(400).json({ pesan: 'Keranjang kosong' });
  }
  if (mentah.length > MAKS_ITEM) {
    return res.status(400).json({ pesan: `Maksimal ${MAKS_ITEM} jenis produk per transaksi` });
  }

  // Gabungkan item yang produknya sama
  const gabung = new Map();
  for (const it of mentah) {
    const id = keAngka(it?.id_produk);
    const jumlah = keAngka(it?.jumlah);
    if (!id || !jumlah) {
      return res.status(400).json({ pesan: 'Setiap item harus punya id_produk dan jumlah (bilangan bulat lebih dari 0)' });
    }
    gabung.set(id, (gabung.get(id) || 0) + jumlah);
  }
  const ids = [...gabung.keys()];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Kunci baris produk supaya stok tidak bentrok dengan transaksi lain
    const [produk] = await conn.query(
      'SELECT id_produk, nama_produk, harga_jual, stok_terakhir FROM produk WHERE id_produk IN (?) FOR UPDATE',
      [ids]
    );

    if (produk.length !== ids.length) {
      await conn.rollback();
      return res.status(404).json({ pesan: 'Ada produk di keranjang yang tidak ditemukan' });
    }

    let total = 0;
    for (const p of produk) {
      const jumlah = gabung.get(p.id_produk);
      if (p.stok_terakhir < jumlah) {
        await conn.rollback();
        return res.status(409).json({
          pesan: `Stok "${p.nama_produk}" tidak cukup (tersisa ${p.stok_terakhir}, diminta ${jumlah})`,
        });
      }
      total += p.harga_jual * jumlah;
    }

    const [hasil] = await conn.query(
      'INSERT INTO transaksi (id_user, total_transaksi, kanal_penjualan, metode_transaksi) VALUES (?, ?, ?, ?)',
      [Number(req.user.sub), total, KANAL_TOKO, metode]
    );
    const idTransaksi = hasil.insertId;

    for (const p of produk) {
      const jumlah = gabung.get(p.id_produk);
      await conn.query(
        'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah_transaksi, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
        [idTransaksi, p.id_produk, jumlah, p.harga_jual, p.harga_jual * jumlah]
      );
      await conn.query(
        'UPDATE produk SET stok_terakhir = stok_terakhir - ? WHERE id_produk = ?',
        [jumlah, p.id_produk]
      );
      await conn.query(
        'INSERT INTO riwayat_stok (id_produk, jumlah_stok, keterangan_stok) VALUES (?, ?, ?)',
        [p.id_produk, `-${jumlah}`, `Penjualan transaksi #${idTransaksi}`]
      );
    }

    await conn.commit();
    res.status(201).json(await ambilDetail(idTransaksi));
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

// GET /transaksi : daftar transaksi (Pemilik melihat semua, selain itu hanya miliknya)
router.get('/', async (req, res) => {
  const semua = req.user.role === 'Pemilik';
  const [rows] = semua
    ? await pool.query(`${SELECT_HEADER} ORDER BY t.id_transaksi DESC`)
    : await pool.query(`${SELECT_HEADER} WHERE t.id_user = ? ORDER BY t.id_transaksi DESC`, [Number(req.user.sub)]);
  res.json(rows.map(formatHeader));
});

// GET /transaksi/:id : satu transaksi lengkap dengan itemnya (untuk nota)
router.get('/:id', async (req, res) => {
  const id = keAngka(req.params.id);
  const detail = id ? await ambilDetail(id) : null;
  const boleh = detail && (req.user.role === 'Pemilik' || detail.id_user === Number(req.user.sub));
  if (!boleh) return res.status(404).json({ pesan: 'Transaksi tidak ditemukan' });
  res.json(detail);
});

export default router;