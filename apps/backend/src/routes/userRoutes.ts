import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Protected route - any authenticated user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving current user session',
      error: error instanceof Error ? error.message : String(error),
    });
  }
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