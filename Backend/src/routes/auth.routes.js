// src/routes/auth.routes.js
import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { loginValidator, ubahPasswordValidator } from '../validators/auth.validator.js';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', loginLimiter, loginValidator, validate, AuthController.login);

// GET /api/v1/auth/me  (perlu login)
router.get('/me', auth, AuthController.getMe);

// PUT /api/v1/auth/ubah-password  (perlu login)
router.put('/ubah-password', auth, ubahPasswordValidator, validate, AuthController.ubahPassword);

export default router;
