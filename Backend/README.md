# Frozzy Backend API (Grade A Security Standard)

Backend RESTful API untuk Sistem Manajemen Inventaris dan Penjualan Frozen Food **Frozzy**, dibangun dengan Node.js (Express), MySQL, dan standar keamanan tinggi.

---

## 🛡️ Arsitektur Keamanan (Grade A Security)

| Fitur Keamanan | Implementasi & Manfaat |
| :--- | :--- |
| **SQL Injection Safe** | 100% Prepared Statements (`mysql2/promise` dengan parameterized query `?`). Tidak ada string concatenation query. |
| **Password Hashing** | Bcrypt dengan 12 Salt Rounds + proteksi anti-timing attack saat login. |
| **Autentikasi & Otorisasi** | JSON Web Token (JWT) standar HS256 + Role-Based Access Control (RBAC) ketat antara **admin** & **kasir**. |
| **Brute-force Protection** | `express-rate-limit` membatasi percobaan login (maks 5 request per 15 menit per IP). Global API limiter 100 req/15 menit. |
| **Race-Condition Protection** | Transaksi database ACID (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) dengan pessimistic locking `FOR UPDATE` saat transaksi kasir dan mutasi stok agar tidak terjadi overselling. |
| **HTTP Hardening** | `helmet` untuk proteksi XSS, Clickjacking, MIME sniffing, HSTS header. |
| **Audit Trail Lengkap** | Tabel `log_stok` mencatat setiap perubahan stok (masuk, keluar, koreksi), stok sebelum & sesudah, siapa yang mengubah, dan ID transaksi terkait. |
| **Input Sanitization & Validation** | `express-validator` pada setiap endpoint untuk memvalidasi tipe data, format barcode Code128, panjang string, dan nilai numerik. |

---

## 🚀 Panduan Memulai Cepat

### 1. Masuk ke direktori Backend
```bash
cd "Backend"
```

### 2. Konfigurasi Environment (`.env`)
Pastikan file `.env` sudah sesuai dengan MySQL Anda (default XAMPP):
```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=frozzy_db

JWT_SECRET=frozzy_super_secret_jwt_key_2026_grade_a_production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### 3. Migrasi Database & Seeding Data Awal
```bash
# Membuat struktur database dan 6 tabel dari nol
npm run migrate

# Mengisi user admin & kasir serta 5 master produk frozen food awal
npm run seed
```

### 4. Menjalankan Automated Security & Functional Test Suite
```bash
npm test
```
Semua 10 pengujian keamanan dan alur transaksi kasir akan dieksekusi otomatis.

### 5. Menjalankan Server Development
```bash
npm run dev
# Server aktif di: http://localhost:3000
# Health check: http://localhost:3000/health
```

---

## 🔐 Akun Default Siap Pakai

| Role | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | CRUD Produk, Koreksi Stok & Freezer, Lihat Semua Transaksi, Lihat Audit Log |
| **Kasir** | `kasir` | `Kasir@123` | Buat Transaksi Penjualan, Scan Barcode, Lihat Daftar Produk & Stok |

---

## 📡 Daftar Endpoint API

### 1. Autentikasi (`/api/v1/auth`)

#### `POST /api/v1/auth/login`
- **Rate Limit**: 5 request per 15 menit
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```
- **Response Success (200)**:
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "user": {
        "user_id": 1,
        "nama": "Administrator Frozzy",
        "username": "admin",
        "role": "admin"
      },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

#### `GET /api/v1/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response**: Mengembalikan profil akun user yang sedang aktif.

---

### 2. Master Produk (`/api/v1/produk`)

| Method | Endpoint | Hak Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/produk` | Admin, Kasir | Daftar semua produk aktif beserta sisa stok |
| `GET` | `/api/v1/produk/:id` | Admin, Kasir | Detail satu produk |
| `GET` | `/api/v1/produk/barcode/:barcode` | Admin, Kasir | Scan barcode Code128 untuk kasir |
| `POST` | `/api/v1/produk` | **Admin Only** | Tambah produk baru beserta stok awal |
| `PUT` | `/api/v1/produk/:id` | **Admin Only** | Ubah data produk |
| `DELETE` | `/api/v1/produk/:id` | **Admin Only** | Soft-delete produk (stok & transaksi lama tetap aman) |

#### Contoh Scan Barcode:
`GET /api/v1/produk/barcode/899100100001`
```json
{
  "success": true,
  "data": {
    "produk_id": 1,
    "barcode": "899100100001",
    "nama_produk": "Chicken Nugget Crispy 500g",
    "deskripsi": "Nugget ayam renyah kualitas premium...",
    "harga_beli": "27000.00",
    "harga_jual": "35000.00",
    "satuan": "pcs",
    "jumlah_stok": 18,
    "stok_minimum": 5,
    "lokasi_freezer": "Freezer A-01"
  }
}
```

---

### 3. Manajemen Stok (`/api/v1/stok`)

| Method | Endpoint | Hak Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/stok` | Admin, Kasir | Monitoring seluruh stok & status restock |
| `GET` | `/api/v1/stok/:produk_id` | Admin, Kasir | Cek stok satu produk |
| `POST` | `/api/v1/stok/:produk_id/update` | **Admin Only** | Penyesuaian/restock manual + catat log |
| `PUT` | `/api/v1/stok/:produk_id/lokasi` | **Admin Only** | Pindah lokasi freezer / set minimum stok |
| `GET` | `/api/v1/stok/:produk_id/log` | **Admin Only** | Riwayat pergerakan barang (Audit Trail) |

#### Contoh Body Update Stok Manual:
`POST /api/v1/stok/1/update`
```json
{
  "tipe": "masuk",
  "jumlah_perubahan": 10,
  "keterangan": "Restock supplier dari distributor"
}
```

---

### 4. Transaksi Kasir (`/api/v1/transaksi`)

| Method | Endpoint | Hak Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/transaksi` | Admin, Kasir | Checkout transaksi (Atomic DB Transaction) |
| `GET` | `/api/v1/transaksi` | **Admin Only** | Riwayat transaksi penjualan (dengan filter tanggal & pagination) |
| `GET` | `/api/v1/transaksi/:id` | Admin, Kasir | Detail invoice transaksi & daftar item terjual |

#### Contoh Body Checkout Transaksi:
`POST /api/v1/transaksi`
```json
{
  "kanal_penjualan": "offline",
  "metode_bayar": "cash",
  "catatan": "Pelanggan umum",
  "items": [
    {
      "produk_id": 1,
      "jumlah": 2
    },
    {
      "produk_id": 2,
      "jumlah": 1
    }
  ]
}
```
*Sistem secara otomatis mengunci stok, memvalidasi ketersediaan, menghitung total harga server-side, menerbitkan nomor kode unik `TRX-YYYYMMDD-XXXX`, memotong stok barang, dan menulis log pergerakan stok dalam 1 operasi database ACID.*

---

## 📱 Panduan Integrasi ke Mobile App (Expo Go / React Native)

Untuk mengakses backend dari HP fisik melalui Expo Go:
1. Pastikan Laptop/PC dan Smartphone terhubung ke jaringan Wi-Fi yang sama.
2. Cari IP laptop Anda di Command Prompt: `ipconfig` (misal: `192.168.1.50`).
3. Konfigurasikan base URL API pada aplikasi mobile Anda ke:
   ```javascript
   const API_BASE_URL = 'http://192.168.1.50:3000/api/v1';
   ```
4. Setiap request yang butuh otentikasi wajib menyertakan header:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
