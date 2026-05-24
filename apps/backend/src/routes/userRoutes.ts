import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Protected route - any authenticated user
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// Admin-only route
router.get(
  '/admin/dashboard',
  authenticate,
  authorize('admin'),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Welcome to admin dashboard',
      data: { user: req.user },
    });
  }
);

export default router;