import { Router } from 'express';
import { getDashboardSummary, getHealth } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/health', getHealth);
router.get('/dashboard', requireAuth, getDashboardSummary);

export default router;
