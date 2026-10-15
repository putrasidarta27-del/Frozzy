-- ============================================================
-- FROZZY DATABASE SCHEMA
-- Sistem Manajemen Inventaris & Penjualan Frozen Food
-- ============================================================

CREATE DATABASE IF NOT EXISTS frozzy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE frozzy_db;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hash
    role        ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: produk
-- ============================================================
CREATE TABLE IF NOT EXISTS produk (
    produk_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barcode         VARCHAR(50) NOT NULL UNIQUE,   -- Code128
    nama_produk     VARCHAR(150) NOT NULL,
    deskripsi       TEXT,
    harga_beli      DECIMAL(15, 2) NOT NULL DEFAULT 0,
    harga_jual      DECIMAL(15, 2) NOT NULL DEFAULT 0,
    satuan          VARCHAR(20) NOT NULL DEFAULT 'pcs',
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_barcode (barcode),
    INDEX idx_nama    (nama_produk)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: stok
-- ============================================================
CREATE TABLE IF NOT EXISTS stok (
    stok_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produk_id       INT UNSIGNED NOT NULL,
    jumlah_stok     INT NOT NULL DEFAULT 0,
    stok_minimum    INT NOT NULL DEFAULT 5,        -- batas restock
    lokasi_freezer  VARCHAR(50),                   -- opsional, kelompokan freezer
    tanggal_update  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_produk (produk_id),
    FOREIGN KEY (produk_id) REFERENCES produk(produk_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: transaksi
-- ============================================================
CREATE TABLE IF NOT EXISTS transaksi (
    transaksi_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_transaksi      VARCHAR(30) NOT NULL UNIQUE,  -- contoh: TRX-20261014-001
    tanggal             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total               DECIMAL(15, 2) NOT NULL DEFAULT 0,
    kanal_penjualan     ENUM('offline', 'shopee', 'lainnya') NOT NULL DEFAULT 'offline',
    metode_bayar        ENUM('cash', 'transfer') NOT NULL DEFAULT 'cash',
    catatan             TEXT,
    user_id             INT UNSIGNED NOT NULL,         -- kasir yang mencatat
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_tanggal   (tanggal),
    INDEX idx_user      (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: detail_transaksi
-- ============================================================
CREATE TABLE IF NOT EXISTS detail_transaksi (
    detail_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaksi_id    INT UNSIGNED NOT NULL,
    produk_id       INT UNSIGNED NOT NULL,
    jumlah          INT NOT NULL,
    harga_satuan    DECIMAL(15, 2) NOT NULL,     -- snapshot harga saat transaksi
    subtotal        DECIMAL(15, 2) NOT NULL,

    INDEX idx_transaksi (transaksi_id),
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(transaksi_id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id)    REFERENCES produk(produk_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: log_stok (audit trail perubahan stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS log_stok (
    log_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produk_id       INT UNSIGNED NOT NULL,
    tipe            ENUM('masuk', 'keluar', 'koreksi') NOT NULL,
    jumlah_perubahan INT NOT NULL,
    stok_sebelum    INT NOT NULL,
    stok_sesudah    INT NOT NULL,
    keterangan      VARCHAR(255),
    transaksi_id    INT UNSIGNED,               -- NULL jika bukan dari transaksi
    user_id         INT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_produk    (produk_id),
    INDEX idx_created   (created_at),
    FOREIGN KEY (produk_id)     REFERENCES produk(produk_id),
    FOREIGN KEY (transaksi_id)  REFERENCES transaksi(transaksi_id),
    FOREIGN KEY (user_id)       REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA: Admin default
-- Password: Admin@123 (bcrypt hash)
-- GANTI PASSWORD INI SETELAH PERTAMA LOGIN!
-- ============================================================
INSERT INTO users (nama, username, password, role) VALUES
(
    'Administrator',
    'admin',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password: Admin@123
    'admin'
);
-- Note: Hash di atas adalah placeholder. Jalankan seeder untuk hash yang benar.
