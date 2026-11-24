// backend/services/notifikasiService.js
// Tugas file ini: mencatat notifikasi ke tabel `notifikasi` (log dalam aplikasi)
// lalu mengirim push ke HP penerima lewat pushService.
// Semua fungsi di sini TIDAK pernah melempar error, supaya transaksi/login
// tidak gagal hanya karena notifikasi bermasalah.

import { pool } from '../db.js';
import { kirimExpoPushBanyak } from './pushService.js';

const BATAS_STOK = 10;

// Simpan satu notifikasi untuk setiap penerima, lalu kirim push.
async function buatNotifikasi(daftarIdUser, jenis, judul, isi, data = {}) {
  try {
    if (!daftarIdUser || daftarIdUser.length === 0) return;

    // 1. Catat ke tabel notifikasi (satu baris per penerima)
    const dataJson = JSON.stringify(data);
    const baris = daftarIdUser.map((idUser) => [idUser, jenis, judul, isi, dataJson]);
    await pool.query(
      'INSERT INTO notifikasi (id_user, jenis, judul, isi, data) VALUES ?',
      [baris]
    );

    // 2. Ambil token push milik para penerima, lalu kirim
    const [tokens] = await pool.query(
      'SELECT expo_push_token FROM push_tokens WHERE user_id IN (?)',
      [daftarIdUser]
    );
    if (tokens.length > 0) {
      await kirimExpoPushBanyak(
        tokens.map((t) => t.expo_push_token),
        judul,
        isi,
        data
      );
    }
  } catch (e) {
    console.error('Gagal membuat notifikasi:', e.message);
  }
}

// Ambil id semua user (opsional: hanya role tertentu)
async function ambilIdUser(role = null) {
  const [rows] = role
    ? await pool.query('SELECT id FROM users WHERE role = ?', [role])
    : await pool.query('SELECT id FROM users');
  return rows.map((r) => r.id);
}

// Dipanggil setelah stok sebuah produk berubah.
// Aturan:
//  - habis    : stok sesudah = 0 dan sebelum > 0
//  - menipis  : sebelum > 10 dan sesudah <= 10 dan sesudah > 0
// Penerima: semua user (Pegawai dan Pemilik).
export async function notifStok({ idProduk, namaProduk, stokSebelum, stokSesudah }) {
  try {
    const sebelum = Number(stokSebelum);
    const sesudah = Number(stokSesudah);

    let jenis = null;
    let judul = '';
    let isi = '';

    if (sesudah === 0 && sebelum > 0) {
      jenis = 'stok_habis';
      judul = 'Stok Habis';
      isi = `Stok ${namaProduk} sudah habis.`;
    } else if (sebelum > BATAS_STOK && sesudah <= BATAS_STOK && sesudah > 0) {
      jenis = 'stok_menipis';
      judul = 'Stok Menipis';
      isi = `Stok ${namaProduk} tersisa ${sesudah}.`;
    }

    if (!jenis) return; // tidak melewati batas, tidak ada notifikasi

    const penerima = await ambilIdUser();
    await buatNotifikasi(penerima, jenis, judul, isi, {
      screen: '/(app)/produk',
      id_produk: idProduk,
    });
  } catch (e) {
    console.error('Gagal notifStok:', e.message);
  }
}

// Dipanggil setelah Pegawai berhasil login.
// Penerima: semua Pemilik. Nama diambil dari database, bukan dari token.
export async function notifPegawaiLogin(idPegawai) {
  try {
    const [rows] = await pool.query(
      'SELECT nama, role FROM users WHERE id = ?',
      [idPegawai]
    );
    if (rows.length === 0 || rows[0].role !== 'Pegawai') return;

    const penerima = await ambilIdUser('Pemilik');
    await buatNotifikasi(
      penerima,
      'pegawai_login',
      'Pegawai Login',
      `${rows[0].nama} baru saja login.`,
      { screen: '/(app)/beranda', id_pegawai: idPegawai }
    );
  } catch (e) {
    console.error('Gagal notifPegawaiLogin:', e.message);
  }
}