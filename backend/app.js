import express from 'express';
import cors from 'cors';
import path from 'path'; // [DITAMBAHKAN]
import { fileURLToPath } from 'url'; // [DITAMBAHKAN]
import authRoutes from './routes/auth.js';
import produkRoutes from './routes/produk.js'; // [DITAMBAHKAN]

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());

// [DITAMBAHKAN] Foto produk bisa dibuka lewat http://IP:3000/uploads/namafile.jpg
app.use(
  '/uploads',
  express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads'))
);

// Endpoint Tes Utama
app.get('/', (req, res) => {
  res.json({ pesan: 'API Backend Frozzy Berjalan dengan Baik!' });
});

// Pendaftaran Rute Autentikasi
app.use('/auth', authRoutes);

// [DITAMBAHKAN] Rute produk
app.use('/produk', produkRoutes);

export default app;