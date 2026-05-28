import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';

// Get all tasks for a board
export const getBoardTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({ boardId }).sort({ status: 1, order: 1 });

    // Group by status
    const grouped = {
      todo: tasks.filter((t) => t.status === 'todo'),
      'in-progress': tasks.filter((t) => t.status === 'in-progress'),
      review: tasks.filter((t) => t.status === 'review'),
      done: tasks.filter((t) => t.status === 'done'),
    };

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

// Create a new task
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, priority, boardId, status } = req.body;

    if (!title || !boardId) {
      res.status(400).json({
        success: false,
        message: 'Title and boardId are required',
      });
      return;
    }

    // Get highest order in column to append at end
    const lastTask = await Task.findOne({
      boardId,
      status: status || 'todo',
    }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'todo',
      boardId,
      order,
      createdBy: req.user!.userId,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

// Update task (status change = drag & drop)
export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

// Delete task
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};