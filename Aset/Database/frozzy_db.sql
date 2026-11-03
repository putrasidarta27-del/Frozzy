-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2026 at 05:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `frozzy_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `detail_id` int(10) UNSIGNED NOT NULL,
  `transaksi_id` int(10) UNSIGNED NOT NULL,
  `produk_id` int(10) UNSIGNED NOT NULL,
  `jumlah` int(11) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detail_transaksi`
--

INSERT INTO `detail_transaksi` (`detail_id`, `transaksi_id`, `produk_id`, `jumlah`, `harga_satuan`, `subtotal`) VALUES
(1, 1, 1, 2, 35000.00, 70000.00);

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(10) UNSIGNED NOT NULL,
  `nama_kategori` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lokasi`
--

CREATE TABLE `lokasi` (
  `id_lokasi` int(10) UNSIGNED NOT NULL,
  `nama_lokasi` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lokasi`
--

INSERT INTO `lokasi` (`id_lokasi`, `nama_lokasi`) VALUES
(1, 'Freezer A-01'),
(2, 'Freezer A-02'),
(3, 'Freezer B-01'),
(4, 'Freezer B-02'),
(5, 'Freezer C-01');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `produk_id` int(10) UNSIGNED NOT NULL,
  `id_kategori` int(10) UNSIGNED DEFAULT NULL,
  `id_lokasi` int(10) UNSIGNED DEFAULT NULL,
  `barcode` varchar(50) NOT NULL,
  `nama_produk` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga_beli` decimal(15,2) NOT NULL DEFAULT 0.00,
  `harga_jual` decimal(15,2) NOT NULL DEFAULT 0.00,
  `satuan` varchar(20) NOT NULL DEFAULT 'pcs',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stok_terakhir` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`produk_id`, `id_kategori`, `id_lokasi`, `barcode`, `nama_produk`, `deskripsi`, `harga_beli`, `harga_jual`, `satuan`, `is_active`, `created_at`, `updated_at`, `stok_terakhir`) VALUES
(1, NULL, 1, '899100100001', 'Chicken Nugget Crispy 500g', 'Nugget ayam renyah kualitas premium olahan daging pilihan', 27000.00, 35000.00, 'pcs', 1, '2026-10-14 20:15:13', '2026-10-15 12:06:26', 18),
(2, NULL, 2, '899100100002', 'Sosis Sapi Premium 500g', 'Sosis sapi dengan rempah istimewa cocok untuk dibakar / digoreng', 21000.00, 28000.00, 'pcs', 1, '2026-10-14 20:15:13', '2026-10-15 12:06:26', 15),
(3, NULL, 3, '899100100003', 'Fish Roll Olahan Ikan 500g', 'Roll ikan gurih kenyal rasa seafood otentik', 23000.00, 30000.00, 'pcs', 1, '2026-10-14 20:15:13', '2026-10-15 12:06:26', 12),
(4, NULL, 4, '899100100004', 'Bakso Sapi 500g', 'Bakso sapi kenyal dengan kandungan daging sapi asli', 25000.00, 32000.00, 'pcs', 1, '2026-10-14 20:15:13', '2026-10-15 12:06:26', 18),
(5, NULL, 5, '899100100005', 'Kentang Goreng Shoestring 500g', 'Kentang potongan renyah impor berkualitas', 19000.00, 25000.00, 'pcs', 1, '2026-10-14 20:15:13', '2026-10-15 12:06:26', 10);

-- --------------------------------------------------------

--
-- Table structure for table `riwayat_stok`
--

CREATE TABLE `riwayat_stok` (
  `log_id` int(10) UNSIGNED NOT NULL,
  `produk_id` int(10) UNSIGNED NOT NULL,
  `tipe` enum('masuk','keluar','koreksi') NOT NULL,
  `jumlah_perubahan` int(11) NOT NULL,
  `stok_sebelum` int(11) NOT NULL,
  `stok_sesudah` int(11) NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `transaksi_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `riwayat_stok`
--

INSERT INTO `riwayat_stok` (`log_id`, `produk_id`, `tipe`, `jumlah_perubahan`, `stok_sebelum`, `stok_sesudah`, `keterangan`, `transaksi_id`, `user_id`, `created_at`) VALUES
(1, 1, 'masuk', 20, 0, 20, 'Stok awal sistem', NULL, 1, '2026-10-14 20:15:13'),
(2, 2, 'masuk', 15, 0, 15, 'Stok awal sistem', NULL, 1, '2026-10-14 20:15:13'),
(3, 3, 'masuk', 12, 0, 12, 'Stok awal sistem', NULL, 1, '2026-10-14 20:15:13'),
(4, 4, 'masuk', 18, 0, 18, 'Stok awal sistem', NULL, 1, '2026-10-14 20:15:13'),
(5, 5, 'masuk', 10, 0, 10, 'Stok awal sistem', NULL, 1, '2026-10-14 20:15:13'),
(6, 1, 'keluar', 2, 20, 18, 'Penjualan TRX-20261014-0001', 1, 2, '2026-10-14 20:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `transaksi_id` int(10) UNSIGNED NOT NULL,
  `kode_transaksi` varchar(30) NOT NULL,
  `tanggal` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `kanal_penjualan` enum('offline','shopee','lainnya') NOT NULL DEFAULT 'offline',
  `metode_bayar` enum('cash','transfer') NOT NULL DEFAULT 'cash',
  `catatan` text DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`transaksi_id`, `kode_transaksi`, `tanggal`, `total`, `kanal_penjualan`, `metode_bayar`, `catatan`, `user_id`, `created_at`) VALUES
(1, 'TRX-20261014-0001', '2026-10-14 20:24:10', 70000.00, 'offline', 'cash', 'Pembelian test kasir', 2, '2026-10-14 20:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `nama`, `username`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Administrator Frozzy', 'admin', '$2b$12$4mOSceYJQb11TRLnkf5fc.OauSxVc4WQulJ6rp.HXfc6bGwst1Im2', 'admin', 1, '2026-10-14 20:15:13', '2026-10-14 20:15:13'),
(2, 'Kasir Frozzy', 'kasir', '$2b$12$0W5gZpZzmDL.ckvRnX54iOJZJJfHsMQxE6X58iaq14QWhPyTE/dm2', 'kasir', 1, '2026-10-14 20:15:13', '2026-10-14 20:15:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `idx_transaksi` (`transaksi_id`),
  ADD KEY `fk_detail_produk` (`produk_id`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `lokasi`
--
ALTER TABLE `lokasi`
  ADD PRIMARY KEY (`id_lokasi`),
  ADD UNIQUE KEY `nama_lokasi` (`nama_lokasi`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`produk_id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `idx_barcode` (`barcode`),
  ADD KEY `idx_nama` (`nama_produk`),
  ADD KEY `fk_produk_kategori` (`id_kategori`),
  ADD KEY `fk_produk_lokasi` (`id_lokasi`);

--
-- Indexes for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_produk` (`produk_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `fk_log_trx` (`transaksi_id`),
  ADD KEY `fk_log_user` (`user_id`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`transaksi_id`),
  ADD UNIQUE KEY `kode_transaksi` (`kode_transaksi`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  MODIFY `detail_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lokasi`
--
ALTER TABLE `lokasi`
  MODIFY `id_lokasi` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `produk_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  MODIFY `log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `transaksi_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `fk_detail_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`produk_id`),
  ADD CONSTRAINT `fk_detail_trx` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`transaksi_id`) ON DELETE CASCADE;

--
-- Constraints for table `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `fk_produk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_produk_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi` (`id_lokasi`) ON DELETE SET NULL;

--
-- Constraints for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  ADD CONSTRAINT `fk_log_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`produk_id`),
  ADD CONSTRAINT `fk_log_trx` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`transaksi_id`),
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_trx_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
