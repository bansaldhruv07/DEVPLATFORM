import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardStats } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);

export default router;