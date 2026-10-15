// src/middleware/validate.js
// Middleware untuk menangani hasil validasi express-validator

import { validationResult } from 'express-validator';
import { badRequest } from '../utils/response.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return badRequest(res, 'Validasi gagal', formatted);
  }
  next();
};

export default validate;
