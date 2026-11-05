# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started
1. masukan query nya di mysql XAMPP

DROP DATABASE IF EXISTS db_frozzy;
CREATE DATABASE db_frozzy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_frozzy;

-- Tabel User (dengan kolom role sesuai PDM Frozzy)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(15) NOT NULL DEFAULT 'Pegawai', -- 'Pemilik' atau 'Pegawai'
  dibuat_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kategori Produk
CREATE TABLE kategori (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(25) NOT NULL
);

-- Tabel Lokasi Freezer/Gudang
CREATE TABLE lokasi (
  id_lokasi INT AUTO_INCREMENT PRIMARY KEY,
  nama_lokasi VARCHAR(25) NOT NULL
);

-- Tabel Produk
CREATE TABLE produk (
  id_produk INT AUTO_INCREMENT PRIMARY KEY,
  id_lokasi INT NOT NULL,
  id_kategori INT NOT NULL,
  barcode VARCHAR(12) NOT NULL UNIQUE,
  nama_produk VARCHAR(25) NOT NULL,
  harga_jual INT NOT NULL,
  stok_terakhir INT NOT NULL DEFAULT 0,
  FOREIGN KEY (id_lokasi) REFERENCES lokasi(id_lokasi),
  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);

-- Tabel Transaksi Penjualan
CREATE TABLE transaksi (
  id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  tgl_transaksi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_transaksi INT NOT NULL,
  kanal_penjualan BOOLEAN NOT NULL, -- 1: Offline, 0: Online/Marketplace
  metode_transaksi VARCHAR(15) NOT NULL, -- 'Tunai' atau 'Transfer'
  FOREIGN KEY (id_user) REFERENCES users(id)
);

-- Tabel Detail Transaksi
CREATE TABLE detail_transaksi (
  id_detail INT AUTO_INCREMENT PRIMARY KEY,
  id_transaksi INT NOT NULL,
  id_produk INT NOT NULL,
  jumlah_transaksi INT NOT NULL,
  harga_satuan INT NOT NULL,
  subtotal INT NOT NULL,
  FOREIGN KEY (id_transaksi) REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  FOREIGN KEY (id_produk) REFERENCES produk(id_produk)
);

-- Tabel Riwayat Stok
CREATE TABLE riwayat_stok (
  id_riwayat INT AUTO_INCREMENT PRIMARY KEY,
  id_produk INT NOT NULL,
  jumlah_stok VARCHAR(25) NOT NULL,
  tgl_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  keterangan_stok VARCHAR(50) NOT NULL, -- Contoh: 'Stok masuk (restock)' atau 'Penjualan offline'
  FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE
);

-- Tabel Push Tokens (Bawaan Modul Praktikum)
CREATE TABLE push_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  dibuat_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

2. lalu buat akun agar bisa masuk
lewat postman (POST /auth/register)
http://localhost:3000/auth/register
(jangan lupa menggunakan body dan json)
kemudian buat akun agar bisa masuk ke sql
{
  "nama": "Dawwas Pemilik",
  "email": "dawwas@frozzy.com",
  "password": "password123",
  "role": "Pemilik"
}

3. test login (opsional)

4. Install dependencies

   ```bash
   npm install
   ```



5. jalankan backend
'''
npm run dev
'''

6. jalankan frontend

   ```bash
   npm install

   npx expo install expo-secure-store

   npx expo start -c

   atau
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.