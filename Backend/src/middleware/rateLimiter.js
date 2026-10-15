// src/middleware/rateLimiter.js
// Rate limiting untuk mencegah brute force & DDoS

import rateLimit from 'express-rate-limit';

// Rate limit khusus endpoint login (lebih ketat)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,                   // maks 10 percobaan login per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.',
  },
  skipSuccessfulRequests: true, // sukses login tidak dihitung
});

// Rate limit umum untuk semua API
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 menit
  max: 120,                  // maks 120 request per menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.',
  },
});
