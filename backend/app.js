import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());

// Endpoint Tes Utama
app.get('/', (req, res) => {
  res.json({ pesan: 'API Backend Frozzy Berjalan dengan Baik!' });
});

// Pendaftaran Rute Autentikasi
app.use('/auth', authRoutes);

export default app;