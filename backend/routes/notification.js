// backend/routes/notification.js
import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { tokenExpoValid, kirimExpoPushBanyak } from '../services/pushService.js';

const router = Router();

// Semua rute di file ini wajib login (JWT)
router.use(wajibLogin);

// Ubah teks angka menjadi integer, atau null bila bukan angka bulat > 0
function keAngka(v) {
  const s = String(v ?? '').trim();
  const n = /^\d+$/.test(s) ? parseInt(s, 10) : null;
  return n && n > 0 ? n : null;
}

// Kolom `data` disimpan sebagai teks JSON; ubah kembali menjadi objek
function formatNotifikasi(row) {
  let data = null;
  try {
    data = row.data ? JSON.parse(row.data) : null;
  } catch {
    data = null;
  }
  return {
    id: row.id,
    jenis: row.jenis,
    judul: row.judul,
    isi: row.isi,
    data,
    dibaca: row.dibaca === 1,
    dibuat_pada: row.dibuat_pada,
  };
}

// ==========================================
// [DITAMBAHKAN] Rute baca notifikasi (log dalam aplikasi)
// Semua hanya menyentuh notifikasi milik user yang sedang login.
// ==========================================

// GET /notifications : daftar notifikasi milik sendiri (terbaru dulu, maks 100)
router.get('/', async (req, res) => {
  const idUser = Number(req.user.sub);

  const [rows] = await pool.query(
    `SELECT id, jenis, judul, isi, data, dibaca, dibuat_pada
     FROM notifikasi
     WHERE id_user = ?
     ORDER BY id DESC
     LIMIT 100`,
    [idUser]
  );
  const [hitung] = await pool.query(
    'SELECT COUNT(*) AS jumlah FROM notifikasi WHERE id_user = ? AND dibaca = 0',
    [idUser]
  );

  res.json({
    belum_dibaca: Number(hitung[0].jumlah),
    data: rows.map(formatNotifikasi),
  });
});

// GET /notifications/belum-dibaca : hanya jumlahnya (untuk titik merah di lonceng)
router.get('/belum-dibaca', async (req, res) => {
  const [hitung] = await pool.query(
    'SELECT COUNT(*) AS jumlah FROM notifikasi WHERE id_user = ? AND dibaca = 0',
    [Number(req.user.sub)]
  );
  res.json({ jumlah: Number(hitung[0].jumlah) });
});

// PUT /notifications/dibaca-semua : tandai semua notifikasi milik sendiri sudah dibaca
// PENTING: rute ini harus berada SEBELUM /:id/dibaca
router.put('/dibaca-semua', async (req, res) => {
  const [hasil] = await pool.query(
    'UPDATE notifikasi SET dibaca = 1 WHERE id_user = ? AND dibaca = 0',
    [Number(req.user.sub)]
  );
  res.json({ pesan: 'Semua notifikasi ditandai sudah dibaca', diubah: hasil.affectedRows });
});

// PUT /notifications/:id/dibaca : tandai satu notifikasi sudah dibaca
router.put('/:id/dibaca', async (req, res) => {
  const id = keAngka(req.params.id);
  if (!id) return res.status(400).json({ pesan: 'ID notifikasi tidak valid' });

  const [ada] = await pool.query(
    'SELECT id FROM notifikasi WHERE id = ? AND id_user = ?',
    [id, Number(req.user.sub)]
  );
  if (ada.length === 0) {
    return res.status(404).json({ pesan: 'Notifikasi tidak ditemukan' });
  }

  await pool.query('UPDATE notifikasi SET dibaca = 1 WHERE id = ?', [id]);
  res.json({ pesan: 'Notifikasi ditandai sudah dibaca' });
});

// ==========================================
// Rute push token (Tahap 2, tidak diubah)
// ==========================================

// POST /notifications/token
// Body (raw JSON): { "expo_push_token": "ExponentPushToken[xxxx]" }
// Menyimpan token HP milik user yang sedang login.
router.post('/token', async (req, res) => {
  const token = String(req.body?.expo_push_token || '').trim();

  if (!tokenExpoValid(token)) {
    return res.status(400).json({ pesan: 'Token push tidak valid' });
  }

  // Bila token sudah ada (UNIQUE), pindahkan kepemilikannya ke user yang login.
  // Ini penting kalau satu HP dipakai ganti-ganti akun.
  await pool.query(
    `INSERT INTO push_tokens (user_id, expo_push_token)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
    [req.user.sub, token]
  );

  res.status(201).json({ pesan: 'Token push tersimpan' });
});

// POST /notifications/test
// Mengirim push uji ke semua perangkat milik user yang sedang login.
router.post('/test', async (req, res) => {
  const [baris] = await pool.query(
    'SELECT expo_push_token FROM push_tokens WHERE user_id = ?',
    [req.user.sub]
  );

  if (baris.length === 0) {
    return res.status(404).json({ pesan: 'Belum ada token push untuk akun ini' });
  }

  const hasil = await kirimExpoPushBanyak(
    baris.map((b) => b.expo_push_token),
    'Tes Notifikasi Frozzy',
    'Jika ini muncul di HP, push notification berhasil.',
    { screen: '/(app)/beranda' }
  );

  res.json({ pesan: 'Permintaan kirim sudah diproses', ...hasil });
});

export default router;
