// scripts/seed.js
// Jalankan: node scripts/seed.js
// Mengisi data awal akun default & master produk frozen food

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'frozzy_db',
});

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

    // 1. Akun Admin Default
    const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
    const [adminRes] = await conn.execute(
      `INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['Administrator Frozzy', 'admin', adminPassword, 'admin']
    );

    // 2. Akun Kasir Default
    const kasirPassword = await bcrypt.hash('Kasir@123', saltRounds);
    await conn.execute(
      `INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['Kasir Frozzy', 'kasir', kasirPassword, 'kasir']
    );

    // Ambil ID admin untuk log_stok
    const [adminRow] = await conn.execute(`SELECT user_id FROM users WHERE username = 'admin' LIMIT 1`);
    const adminId = adminRow[0].user_id;

    // 3. Produk Awal Frozen Food
    const initialProducts = [
      {
        barcode: '899100100001',
        nama: 'Chicken Nugget Crispy 500g',
        deskripsi: 'Nugget ayam renyah kualitas premium olahan daging pilihan',
        harga_beli: 27000,
        harga_jual: 35000,
        stok: 20,
        min: 5,
        freezer: 'Freezer A-01',
      },
      {
        barcode: '899100100002',
        nama: 'Sosis Sapi Premium 500g',
        deskripsi: 'Sosis sapi dengan rempah istimewa cocok untuk dibakar / digoreng',
        harga_beli: 21000,
        harga_jual: 28000,
        stok: 15,
        min: 5,
        freezer: 'Freezer A-02',
      },
      {
        barcode: '899100100003',
        nama: 'Fish Roll Olahan Ikan 500g',
        deskripsi: 'Roll ikan gurih kenyal rasa seafood otentik',
        harga_beli: 23000,
        harga_jual: 30000,
        stok: 12,
        min: 5,
        freezer: 'Freezer B-01',
      },
      {
        barcode: '899100100004',
        nama: 'Bakso Sapi 500g',
        deskripsi: 'Bakso sapi kenyal dengan kandungan daging sapi asli',
        harga_beli: 25000,
        harga_jual: 32000,
        stok: 18,
        min: 5,
        freezer: 'Freezer B-02',
      },
      {
        barcode: '899100100005',
        nama: 'Kentang Goreng Shoestring 500g',
        deskripsi: 'Kentang potongan renyah impor berkualitas',
        harga_beli: 19000,
        harga_jual: 25000,
        stok: 10,
        min: 5,
        freezer: 'Freezer C-01',
      },
    ];

    for (const p of initialProducts) {
      // Masukkan produk
      const [prodRes] = await conn.execute(
        `INSERT INTO produk (barcode, nama_produk, deskripsi, harga_beli, harga_jual, satuan)
         VALUES (?, ?, ?, ?, ?, 'pcs')`,
        [p.barcode, p.nama, p.deskripsi, p.harga_beli, p.harga_jual]
      );
      const produkId = prodRes.insertId;

      // Masukkan stok
      await conn.execute(
        `INSERT INTO stok (produk_id, jumlah_stok, stok_minimum, lokasi_freezer)
         VALUES (?, ?, ?, ?)`,
        [produkId, p.stok, p.min, p.freezer]
      );

      // Catat di log_stok
      await conn.execute(
        `INSERT INTO log_stok (produk_id, tipe, jumlah_perubahan, stok_sebelum, stok_sesudah, keterangan, user_id)
         VALUES (?, 'masuk', ?, 0, ?, 'Stok awal sistem', ?)`,
        [produkId, p.stok, p.stok, adminId]
      );
    }

    await conn.commit();

    console.log('✅ Seed berhasil diisi!');
    console.log('\n🔐 Akun Siap Pakai:');
    console.log('   Admin  -> username: admin  | password: Admin@123');
    console.log('   Kasir  -> username: kasir  | password: Kasir@123');
    console.log('\n📦 Master Produk Awal: 5 Item Frozen Food berhasil dibuat & stok tercatat.');
    console.log('⚠️  Catatan Keamanan: Segera ganti password default setelah login pertama kali!');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seed gagal:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
