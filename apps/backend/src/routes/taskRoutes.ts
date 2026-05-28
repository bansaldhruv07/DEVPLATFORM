import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBoardTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

router.get('/board/:boardId', authenticate, getBoardTasks);
router.post('/', authenticate, createTask);
router.patch('/:taskId', authenticate, updateTask);
router.delete('/:taskId', authenticate, deleteTask);

export default router;