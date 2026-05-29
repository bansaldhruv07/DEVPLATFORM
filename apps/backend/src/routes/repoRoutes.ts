import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  analyzeRepository,
  explainCode,
  debugCode,
  getJobStatus,
} from '../controllers/repoController';

const router = Router();

// All routes are protected (require authentication)
router.post('/analyze', authenticate, analyzeRepository);
router.post('/explain', authenticate, explainCode);
router.post('/debug', authenticate, debugCode);
router.get('/job/:jobId', authenticate, getJobStatus);

export default router;