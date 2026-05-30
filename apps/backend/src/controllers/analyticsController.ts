import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import User from '../models/User';
import cacheService from '../services/cacheService';
import logger from '../config/logger';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cacheKey = `analytics:dashboard:${req.user!.userId}`;
    const cached = await cacheService.get<any>(cacheKey);

    if (cached) {
      res.status(200).json({ success: true, data: cached, meta: { cached: true } });
      return;
    }

    // Run all aggregations in parallel
    const [
      tasksByStatus,
      tasksByPriority,
      tasksCreatedLast7Days,
      totalUsers,
      recentActivity,
    ] = await Promise.all([
      // Tasks grouped by status
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Tasks grouped by priority
      Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Tasks created per day (last 7 days)
      Task.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Total registered users
      User.countDocuments(),

      // Most recently updated tasks
      Task.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status priority updatedAt'),
    ]);

    // Normalize task status data
    const statusMap: Record<string, number> = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };
    tasksByStatus.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // Normalize priority data
    const priorityMap: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    tasksByPriority.forEach((p) => {
      priorityMap[p._id] = p.count;
    });

    // Fill in missing days with 0
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const found = tasksCreatedLast7Days.find((d) => d._id === key);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: found ? found.count : 0,
      };
    });

    const totalTasks = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const completionRate =
      totalTasks > 0 ? Math.round((statusMap.done / totalTasks) * 100) : 0;

    const responseData = {
      summary: {
        totalTasks,
        totalUsers,
        completionRate,
        activeTasks: statusMap['in-progress'],
      },
      tasksByStatus: Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      })),
      tasksByPriority: Object.entries(priorityMap).map(([priority, count]) => ({
        priority,
        count,
      })),
      tasksOverTime: last7Days,
      recentActivity,
    };

    // Cache for 5 minutes (analytics don't need to be real-time)
    await cacheService.set(cacheKey, responseData, 300);

    logger.info('Analytics dashboard fetched', { userId: req.user!.userId });

    res.status(200).json({ success: true, data: responseData });
  } catch (error: any) {
    logger.error('Analytics error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};