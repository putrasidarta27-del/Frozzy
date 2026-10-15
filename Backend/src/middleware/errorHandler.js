// src/middleware/errorHandler.js
// Global error handler - tangkap semua unhandled error, jangan bocorkan stack trace ke client

const errorHandler = (err, req, res, next) => {
  // Log error detail di server (jangan dikirim ke client)
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  // Kesalahan dari MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikat).',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referensi data tidak ditemukan.',
    });
  }

  // Default: server error
  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
