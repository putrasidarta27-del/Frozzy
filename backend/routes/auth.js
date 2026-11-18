import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';

const router = Router();

// Endpoint Register
router.post('/register', async (req, res) => {
  const { nama, email, password, role } = req.body;
  
  if (!nama || !email || !password) {
    return res.status(400).json({ pesan: 'Nama, email, dan password wajib diisi' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ pesan: 'Password minimal 8 karakter' });
  }

  const emailBersih = email.trim().toLowerCase();
  // Menyesuaikan dengan role Frozzy ('Pemilik' atau 'Pegawai')
  const userRole = role === 'Pemilik' ? 'Pemilik' : 'Pegawai';

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [hasil] = await pool.query(
      'INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [nama.trim(), emailBersih, passwordHash, userRole]
    );

    return res.status(201).json({
      id: hasil.insertId,
      nama: nama.trim(),
      email: emailBersih,
      role: userRole,
      pesan: 'Akun berhasil dibuat'
    });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'Email sudah terdaftar' });
    }
    console.error(e);
    return res.status(500).json({ pesan: 'Gagal membuat akun' });
  }
});

// Endpoint Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ pesan: 'Email dan password wajib diisi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ pesan: 'Email atau password salah' });
    }

    const user = rows[0];
    const cocok = await bcrypt.compare(password, user.password_hash);
    if (!cocok) {
      return res.status(401).json({ pesan: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { email: user.email, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'frozzy-mobile-api',
        audience: 'frozzy-mobile-app',
        algorithm: 'HS256',
      }
    );

    return res.json({
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ pesan: 'Gagal login' });
  }
});

// Endpoint Profil (Dilindungi wajibLogin middleware)
router.get('/me', wajibLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, email, role, dibuat_pada FROM users WHERE id = ?',
      [req.user.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'Pengguna tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil data profil' });
  }
});


// ==========================================
// [DITAMBAHKAN] PUT /auth/profil : Ubah Nama / Email
// ==========================================
// ==========================================
// [DIUBAH] PUT /auth/profil : Ubah Nama / Email
// Tanpa transaksi database (sebelumnya transaksi tidak ditutup saat email kembar)
// ==========================================
router.put('/profil', wajibLogin, async (req, res) => {
  const namaBersih = String(req.body.nama ?? '').trim();
  const emailBersih = String(req.body.email ?? '').trim().toLowerCase();
  const userId = req.user.sub;

  if (!namaBersih || !emailBersih) {
    return res.status(400).json({ pesan: 'Nama dan email wajib diisi' });
  }
  if (!/^\S+@\S+\.\S+$/.test(emailBersih)) {
    return res.status(400).json({ pesan: 'Format email tidak valid' });
  }

  try {
    // Cek apakah email sudah dipakai user lain
    const [duplikat] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [emailBersih, userId]
    );
    if (duplikat.length > 0) {
      return res.status(409).json({ pesan: 'Email sudah digunakan oleh akun lain' });
    }

    await pool.query('UPDATE users SET nama = ?, email = ? WHERE id = ?', [namaBersih, emailBersih, userId]);

    const [rows] = await pool.query(
      'SELECT id, nama, email, role, dibuat_pada FROM users WHERE id = ?',
      [userId]
    );

    res.json({ pesan: 'Profil berhasil diperbarui', user: rows[0] });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'Email sudah digunakan oleh akun lain' });
    }
    console.error(e);
    res.status(500).json({ pesan: 'Gagal memperbarui profil' });
  }
});

// ==========================================
// [DITAMBAHKAN] PUT /auth/kata-sandi : Ubah Password
// ==========================================
router.put('/kata-sandi', wajibLogin, async (req, res) => {
  const { passwordLama, passwordBaru } = req.body;
  if (!passwordLama || !passwordBaru) {
    return res.status(400).json({ pesan: 'Kata sandi lama dan baru wajib diisi' });
  }
  if (passwordBaru.length < 8) {
    return res.status(400).json({ pesan: 'Kata sandi baru minimal 8 karakter' });
  }

  const userId = req.user.sub;

  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'Pengguna tidak ditemukan' });
    }

    const user = rows[0];
    const cocok = await bcrypt.compare(passwordLama, user.password_hash);
    if (!cocok) {
      return res.status(400).json({ pesan: 'Kata sandi lama tidak sesuai' });
    }

    const passwordBaruHash = await bcrypt.hash(passwordBaru, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordBaruHash, userId]);

    res.json({ pesan: 'Kata sandi berhasil diubah' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengubah kata sandi' });
  }
});


export default router;