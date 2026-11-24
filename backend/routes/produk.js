import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { notifStok } from '../services/notifikasiService.js'; // [DITAMBAHKAN]

const router = express.Router();

// Folder penyimpanan foto: backend/uploads
const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Pengaturan multer: simpan ke disk, hanya JPG/PNG, maksimal 3MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format foto harus JPG atau PNG'));
  },
});

// Membungkus multer supaya error upload jadi respons JSON yang rapi
function terimaFoto(req, res, next) {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ pesan: 'Ukuran foto maksimal 3MB' });
    }
    return res.status(400).json({ pesan: err.message });
  });
}

// Hapus file foto dari folder uploads (aman bila file tidak ada)
function hapusFile(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl)), () => {});
}

// Ubah teks angka menjadi integer, atau null bila bukan angka bulat >= 0
function keAngka(v) {
  const s = String(v ?? '').trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : null;
}

const SELECT_PRODUK = `
  SELECT p.id_produk, p.barcode, p.nama_produk, p.harga_jual, p.stok_terakhir,
         p.deskripsi, p.image_url,
         p.id_kategori, k.nama_kategori AS kategori,
         p.id_lokasi, l.nama_lokasi AS lokasi
  FROM produk p
  JOIN kategori k ON k.id_kategori = p.id_kategori
  JOIN lokasi l ON l.id_lokasi = p.id_lokasi
`;

async function ambilSatu(id) {
  const [rows] = await pool.query(`${SELECT_PRODUK} WHERE p.id_produk = ?`, [id]);
  return rows[0] || null;
}

// Cari id kategori dari namanya; null bila tidak ada
async function idKategori(nama) {
  const [rows] = await pool.query('SELECT id_kategori FROM kategori WHERE nama_kategori = ?', [nama]);
  return rows[0]?.id_kategori ?? null;
}

// Cari id lokasi dari namanya; bila nama kosong pakai lokasi pertama
async function idLokasi(nama) {
  if (!nama) {
    const [rows] = await pool.query('SELECT id_lokasi FROM lokasi ORDER BY id_lokasi LIMIT 1');
    return rows[0]?.id_lokasi ?? null;
  }
  const [rows] = await pool.query('SELECT id_lokasi FROM lokasi WHERE nama_lokasi = ?', [nama]);
  return rows[0]?.id_lokasi ?? null;
}

// Semua rute produk wajib login
router.use(wajibLogin);

// GET /produk : daftar semua produk
router.get('/', async (req, res) => {
  const [rows] = await pool.query(`${SELECT_PRODUK} ORDER BY p.id_produk DESC`);
  res.json(rows);
});

// GET /produk/:id : satu produk
router.get('/:id', async (req, res) => {
  const id = keAngka(req.params.id);
  const produk = id ? await ambilSatu(id) : null;
  if (!produk) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
  res.json(produk);
});

// POST /produk : tambah produk (form-data, foto opsional di field "foto")
router.post('/', terimaFoto, async (req, res) => {
  const fotoBaru = req.file ? `/uploads/${req.file.filename}` : null;
  const batal = (kode, pesan) => {
    hapusFile(fotoBaru);
    return res.status(kode).json({ pesan });
  };

  const nama = String(req.body.nama_produk ?? '').trim();
  const barcode = String(req.body.barcode ?? '').trim();
  const harga = keAngka(req.body.harga_jual);
  const stok = keAngka(req.body.stok_terakhir);
  const deskripsi = req.body.deskripsi ? String(req.body.deskripsi) : null;

  if (!nama || !barcode || harga === null || stok === null) {
    return batal(400, 'Nama produk, barcode, harga jual, dan stok wajib diisi dengan benar');
  }
  if (nama.length > 100) return batal(400, 'Nama produk maksimal 100 karakter');
  if (barcode.length > 20) return batal(400, 'Barcode maksimal 20 karakter');

  const kategoriId = await idKategori(req.body.kategori);
  if (!kategoriId) return batal(400, 'Kategori tidak dikenal');
  const lokasiId = await idLokasi(req.body.lokasi);
  if (!lokasiId) return batal(400, 'Lokasi tidak dikenal');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [hasil] = await conn.query(
      `INSERT INTO produk (id_lokasi, id_kategori, barcode, nama_produk, harga_jual, stok_terakhir, deskripsi, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lokasiId, kategoriId, barcode, nama, harga, stok, deskripsi, fotoBaru]
    );
    await conn.query(
      'INSERT INTO riwayat_stok (id_produk, jumlah_stok, keterangan_stok) VALUES (?, ?, ?)',
      [hasil.insertId, String(stok), 'Stok awal produk baru']
    );
    await conn.commit();
    res.status(201).json(await ambilSatu(hasil.insertId));
  } catch (e) {
    await conn.rollback();
    hapusFile(fotoBaru);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'Barcode sudah dipakai produk lain' });
    }
    throw e;
  } finally {
    conn.release();
  }
});

// PUT /produk/:id : ubah produk (form-data; field yang tidak dikirim tidak berubah)
router.put('/:id', terimaFoto, async (req, res) => {
  const fotoBaru = req.file ? `/uploads/${req.file.filename}` : null;
  const batal = (kode, pesan) => {
    hapusFile(fotoBaru);
    return res.status(kode).json({ pesan });
  };

  const id = keAngka(req.params.id);
  const lama = id ? await ambilSatu(id) : null;
  if (!lama) return batal(404, 'Produk tidak ditemukan');

  const b = req.body;
  const nama = b.nama_produk !== undefined ? String(b.nama_produk).trim() : lama.nama_produk;
  const barcode = b.barcode !== undefined ? String(b.barcode).trim() : lama.barcode;
  const harga = b.harga_jual !== undefined ? keAngka(b.harga_jual) : lama.harga_jual;
  const stok = b.stok_terakhir !== undefined ? keAngka(b.stok_terakhir) : lama.stok_terakhir;
  const deskripsi = b.deskripsi !== undefined ? String(b.deskripsi) : lama.deskripsi;

  if (!nama || !barcode || harga === null || stok === null) {
    return batal(400, 'Nama produk, barcode, harga jual, dan stok harus diisi dengan benar');
  }
  if (nama.length > 100) return batal(400, 'Nama produk maksimal 100 karakter');
  if (barcode.length > 20) return batal(400, 'Barcode maksimal 20 karakter');

  let kategoriId = lama.id_kategori;
  if (b.kategori !== undefined) {
    kategoriId = await idKategori(b.kategori);
    if (!kategoriId) return batal(400, 'Kategori tidak dikenal');
  }
  let lokasiId = lama.id_lokasi;
  if (b.lokasi !== undefined && b.lokasi !== '') {
    lokasiId = await idLokasi(b.lokasi);
    if (!lokasiId) return batal(400, 'Lokasi tidak dikenal');
  }

  const imageUrl = fotoBaru || lama.image_url;
  const selisih = stok - lama.stok_terakhir;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE produk SET id_lokasi = ?, id_kategori = ?, barcode = ?, nama_produk = ?,
              harga_jual = ?, stok_terakhir = ?, deskripsi = ?, image_url = ?
       WHERE id_produk = ?`,
      [lokasiId, kategoriId, barcode, nama, harga, stok, deskripsi, imageUrl, id]
    );
    if (selisih !== 0) {
      await conn.query(
        'INSERT INTO riwayat_stok (id_produk, jumlah_stok, keterangan_stok) VALUES (?, ?, ?)',
        [id, `${selisih > 0 ? '+' : ''}${selisih}`, 'Penyesuaian stok (edit produk)']
      );
    }
    await conn.commit();
    if (fotoBaru) hapusFile(lama.image_url); // foto lama sudah tidak dipakai

    // [DITAMBAHKAN] Cek stok menipis/habis bila stok berubah lewat edit produk.
    // Tidak di-await dan tidak melempar error.
    notifStok({
      idProduk: id,
      namaProduk: nama,
      stokSebelum: lama.stok_terakhir,
      stokSesudah: stok,
    });

    res.json(await ambilSatu(id));
  } catch (e) {
    await conn.rollback();
    hapusFile(fotoBaru);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'Barcode sudah dipakai produk lain' });
    }
    throw e;
  } finally {
    conn.release();
  }
});

// DELETE /produk/:id : hapus produk
router.delete('/:id', async (req, res) => {
  const id = keAngka(req.params.id);
  const lama = id ? await ambilSatu(id) : null;
  if (!lama) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });

  // Produk yang sudah pernah terjual tidak boleh dihapus (menjaga riwayat transaksi)
  const [dipakai] = await pool.query(
    'SELECT COUNT(*) AS jumlah FROM detail_transaksi WHERE id_produk = ?',
    [id]
  );
  if (dipakai[0].jumlah > 0) {
    return res.status(409).json({ pesan: 'Produk sudah dipakai di transaksi, tidak bisa dihapus' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM riwayat_stok WHERE id_produk = ?', [id]);
    await conn.query('DELETE FROM produk WHERE id_produk = ?', [id]);
    await conn.commit();
    hapusFile(lama.image_url);
    res.json({ pesan: 'Produk berhasil dihapus' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export default router;
