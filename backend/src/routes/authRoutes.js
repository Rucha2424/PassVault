import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateSettings,
  deleteAccount,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/settings', requireAuth, updateSettings);
router.delete('/account', requireAuth, deleteAccount);

export default router;
