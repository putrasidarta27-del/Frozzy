// server.js - Entry point Frozzy Backend
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { testConnection } from './src/config/db.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import errorHandler from './src/middleware/errorHandler.js';

// Routes
import authRoutes       from './src/routes/auth.routes.js';
import produkRoutes     from './src/routes/produk.routes.js';
import stokRoutes       from './src/routes/stok.routes.js';
import transaksiRoutes  from './src/routes/transaksi.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet: set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - izinkan mobile client, expo, dan whitelist terdaftar
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006',
];

app.use(cors({
  origin: (origin, callback) => {
    // Request dari native mobile apps (fetch/axios di React Native/Expo) biasanya tidak punya origin header
    if (!origin) return callback(null, true);

    // Di development, izinkan localhost, LAN IP (192.168.*, 10.*), dan exp://
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin tidak diizinkan'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiter global
app.use('/api/', apiLimiter);

// ============================================================
// GENERAL MIDDLEWARE
// ============================================================

// Logger HTTP request
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON body, batasi ukuran 1mb (anti payload flood)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ============================================================
// ROUTES
// ============================================================

app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/produk',     produkRoutes);
app.use('/api/v1/stok',       stokRoutes);
app.use('/api/v1/transaksi',  transaksiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Frozzy Backend', time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler (harus setelah semua route)
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Frozzy Backend berjalan di http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
}

start();
