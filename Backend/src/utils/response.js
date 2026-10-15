// src/utils/response.js
// Standar format response API

export const success = (res, data = null, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const created = (res, data = null, message = 'Data berhasil dibuat') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

export const error = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const badRequest = (res, message = 'Permintaan tidak valid', errors = null) => {
  return error(res, message, 400, errors);
};

export const unauthorized = (res, message = 'Akses tidak sah, silakan login') => {
  return error(res, message, 401);
};

export const forbidden = (res, message = 'Anda tidak memiliki izin') => {
  return error(res, message, 403);
};

export const notFound = (res, message = 'Data tidak ditemukan') => {
  return error(res, message, 404);
};

export const conflict = (res, message = 'Data sudah ada') => {
  return error(res, message, 409);
};
