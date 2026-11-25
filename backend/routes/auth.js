import { Router } from 'express';
import { randomInt } from 'node:crypto';
import { kirimOtpEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { notifPegawaiLogin } from '../services/notifikasiService.js'; // [DITAMBAHKAN]

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

    // [DITAMBAHKAN] Beri tahu Pemilik bila yang login adalah Pegawai.
    // Tidak di-await dan tidak melempar error, jadi login tidak ikut gagal.
    notifPegawaiLogin(user.id);

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



// ==========================================
// RESET PASSWORD VIA EMAIL OTP
// ==========================================

router.post('/forgot-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ pesan: 'Format email tidak valid' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!users.length) {
      return res.status(404).json({ pesan: 'Email tidak ditemukan' });
    }

    const otp = String(randomInt(0, 1000000)).padStart(6, '0');
    const otpHash = await bcrypt.hash(otp, 10);

    await pool.query(
      'DELETE FROM password_reset_otps WHERE email = ? AND used_at IS NULL',
      [email]
    );

    const [result] = await pool.query(
      `INSERT INTO password_reset_otps
       (email, otp_hash, expires_at, attempts)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0)`,
      [email, otpHash]
    );

    try {
      await kirimOtpEmail(email, otp);
    } catch (mailError) {
      await pool.query(
        'DELETE FROM password_reset_otps WHERE id = ?',
        [result.insertId]
      );
      console.error('Gagal mengirim OTP:', mailError.message);
      return res.status(500).json({ pesan: 'Email OTP gagal dikirim. Periksa konfigurasi Gmail.' });
    }

    return res.json({ pesan: 'Kode OTP berhasil dikirim ke email.' });
  } catch (e) {
    console.error('Forgot password:', e.message);
    return res.status(500).json({ pesan: 'Gagal memproses permintaan OTP.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ pesan: 'Email dan OTP 6 digit wajib diisi.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE email = ? AND used_at IS NULL
       ORDER BY id DESC LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ pesan: 'OTP tidak ditemukan atau sudah digunakan.' });
    }

    const data = rows[0];

    if (data.attempts >= 5 || new Date(data.expires_at) <= new Date()) {
      return res.status(400).json({ pesan: 'OTP sudah kedaluwarsa atau batas percobaan habis.' });
    }

    const cocok = await bcrypt.compare(otp, data.otp_hash);

    if (!cocok) {
      await pool.query(
        'UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?',
        [data.id]
      );
      return res.status(400).json({ pesan: 'Kode OTP salah.' });
    }

    return res.json({ pesan: 'OTP berhasil diverifikasi.' });
  } catch (e) {
    console.error('Verify OTP:', e.message);
    return res.status(500).json({ pesan: 'Gagal memverifikasi OTP.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const password = String(req.body.password || '');

  if (!email || !/^\d{6}$/.test(otp) || !password) {
    return res.status(400).json({ pesan: 'Data reset password belum lengkap.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ pesan: 'Password minimal 8 karakter.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE email = ? AND used_at IS NULL
       ORDER BY id DESC LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ pesan: 'OTP tidak valid atau sudah digunakan.' });
    }

    const data = rows[0];

    if (data.attempts >= 5 || new Date(data.expires_at) <= new Date()) {
      return res.status(400).json({ pesan: 'OTP kedaluwarsa atau batas percobaan habis.' });
    }

    const cocok = await bcrypt.compare(otp, data.otp_hash);

    if (!cocok) {
      await pool.query(
        'UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?',
        [data.id]
      );
      return res.status(400).json({ pesan: 'Kode OTP salah.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    await pool.query(
      'UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?',
      [data.id]
    );

    return res.json({ pesan: 'Password berhasil diperbarui.' });
  } catch (e) {
    console.error('Reset password:', e.message);
    return res.status(500).json({ pesan: 'Gagal memperbarui password.' });
  }
});

export default router;
