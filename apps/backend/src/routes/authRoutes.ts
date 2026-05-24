import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

export default router;