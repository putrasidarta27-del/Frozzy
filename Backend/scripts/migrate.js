// scripts/migrate.js
// Jalankan: node scripts/migrate.js
// Membuat database dan semua tabel Frozzy dari nol

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });

  const queries = [
    `CREATE DATABASE IF NOT EXISTS frozzy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `USE frozzy_db`,
    `SET FOREIGN_KEY_CHECKS = 0`,
    `DROP TABLE IF EXISTS detail_transaksi, log_stok, transaksi, stok, produk, users`,
    `SET FOREIGN_KEY_CHECKS = 1`,

    `CREATE TABLE users (
      user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      nama        VARCHAR(100) NOT NULL,
      username    VARCHAR(50) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        ENUM('admin','kasir') NOT NULL DEFAULT 'kasir',
      is_active   TINYINT(1) NOT NULL DEFAULT 1,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,

    `CREATE TABLE produk (
      produk_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      barcode     VARCHAR(50) NOT NULL UNIQUE,
      nama_produk VARCHAR(150) NOT NULL,
      deskripsi   TEXT,
      harga_beli  DECIMAL(15,2) NOT NULL DEFAULT 0,
      harga_jual  DECIMAL(15,2) NOT NULL DEFAULT 0,
      satuan      VARCHAR(20) NOT NULL DEFAULT 'pcs',
      is_active   TINYINT(1) NOT NULL DEFAULT 1,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_barcode (barcode),
      INDEX idx_nama (nama_produk)
    ) ENGINE=InnoDB`,

    `CREATE TABLE stok (
      stok_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      produk_id      INT UNSIGNED NOT NULL,
      jumlah_stok    INT NOT NULL DEFAULT 0,
      stok_minimum   INT NOT NULL DEFAULT 5,
      lokasi_freezer VARCHAR(50),
      tanggal_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_produk (produk_id),
      CONSTRAINT fk_stok_produk FOREIGN KEY (produk_id) REFERENCES produk(produk_id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE transaksi (
      transaksi_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      kode_transaksi  VARCHAR(30) NOT NULL UNIQUE,
      tanggal         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      total           DECIMAL(15,2) NOT NULL DEFAULT 0,
      kanal_penjualan ENUM('offline','shopee','lainnya') NOT NULL DEFAULT 'offline',
      metode_bayar    ENUM('cash','transfer') NOT NULL DEFAULT 'cash',
      catatan         TEXT,
      user_id         INT UNSIGNED NOT NULL,
      created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_tanggal (tanggal),
      INDEX idx_user (user_id),
      CONSTRAINT fk_trx_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ) ENGINE=InnoDB`,

    `CREATE TABLE detail_transaksi (
      detail_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      transaksi_id INT UNSIGNED NOT NULL,
      produk_id    INT UNSIGNED NOT NULL,
      jumlah       INT NOT NULL,
      harga_satuan DECIMAL(15,2) NOT NULL,
      subtotal     DECIMAL(15,2) NOT NULL,
      INDEX idx_transaksi (transaksi_id),
      CONSTRAINT fk_detail_trx FOREIGN KEY (transaksi_id) REFERENCES transaksi(transaksi_id) ON DELETE CASCADE,
      CONSTRAINT fk_detail_produk FOREIGN KEY (produk_id) REFERENCES produk(produk_id)
    ) ENGINE=InnoDB`,

    `CREATE TABLE log_stok (
      log_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      produk_id        INT UNSIGNED NOT NULL,
      tipe             ENUM('masuk','keluar','koreksi') NOT NULL,
      jumlah_perubahan INT NOT NULL,
      stok_sebelum     INT NOT NULL,
      stok_sesudah     INT NOT NULL,
      keterangan       VARCHAR(255),
      transaksi_id     INT UNSIGNED NULL,
      user_id          INT UNSIGNED NOT NULL,
      created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_produk (produk_id),
      INDEX idx_created (created_at),
      CONSTRAINT fk_log_produk FOREIGN KEY (produk_id) REFERENCES produk(produk_id),
      CONSTRAINT fk_log_trx FOREIGN KEY (transaksi_id) REFERENCES transaksi(transaksi_id),
      CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ) ENGINE=InnoDB`,
  ];

  try {
    for (const q of queries) {
      await conn.query(q);
    }
    console.log('✅ Migrasi database berhasil dibuat dari nol!');
    console.log('   Database: frozzy_db');
    console.log('   Tabel: users, produk, stok, transaksi, detail_transaksi, log_stok');
    console.log('\n➡️  Langkah selanjutnya: npm run seed');
  } catch (err) {
    console.error('❌ Migrasi gagal:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrate();
