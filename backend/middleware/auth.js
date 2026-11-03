import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Middleware untuk memverifikasi JWT Bearer Token
export function wajibLogin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ pesan: 'Token diperlukan' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'frozzy-mobile-api',
      audience: 'frozzy-mobile-app',
      algorithms: ['HS256'],
    });
    
    // Menyimpan data payload (id, email, role, dll) ke objek req.user
    req.user = payload; 
    next();
  } catch (e) {
    return res.status(401).json({
      pesan: e.name === 'TokenExpiredError' ? 'Token kedaluwarsa' : 'Token tidak valid',
    });
  }
}

// Middleware opsional untuk membatasi akses khusus Pemilik (Owner)
export function khususPemilik(req, res, next) {
  if (req.user?.role !== 'Pemilik') {
    return res.status(403).json({ pesan: 'Akses ditolak. Khusus Pemilik usaha.' });
  }
  next();
}