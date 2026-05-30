'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '@/lib/api';
import StatCard from '@/components/analytics/StatCard';
import BarChart from '@/components/analytics/BarChart';
import DonutChart from '@/components/analytics/DonutChart';
import ActivityFeed from '@/components/analytics/ActivityFeed';

interface AnalyticsData {
  summary: {
    totalTasks: number;
    totalUsers: number;
    completionRate: number;
    activeTasks: number;
  };
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksOverTime: { date: string; count: number }[];
  recentActivity: any[];
}

const statusColors: Record<string, string> = {
  todo: '#9ca3af',
  'in-progress': '#3b82f6',
  review: '#f59e0b',
  done: '#22c55e',
};

const priorityColors: Record<string, string> = {
  low: '#86efac',
  medium: '#fcd34d',
  high: '#f87171',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsAPI.getDashboard();
        setData(response.data.data);
      } catch {
        setError('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusChartData = data.tasksByStatus.map((s) => ({
    label: s.status,
    value: s.count,
    color: statusColors[s.status] || '#6366f1',
  }));

  const priorityChartData = data.tasksByPriority.map((p) => ({
    label: p.priority,
    value: p.count,
    color: priorityColors[p.priority] || '#6366f1',
  }));

  const timelineData = data.tasksOverTime.map((t) => ({
    label: t.date,
    value: t.count,
    color: '#6366f1',
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Platform-wide productivity metrics
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Tasks"
            value={data.summary.totalTasks}
            icon="📋"
            color="bg-indigo-50"
            delay={0}
          />
          <StatCard
            title="Active Tasks"
            value={data.summary.activeTasks}
            subtitle="In Progress"
            icon="⚡"
            color="bg-blue-50"
            delay={0.1}
          />
          <StatCard
            title="Completion Rate"
            value={`${data.summary.completionRate}%`}
            subtitle="Tasks marked done"
            icon="✅"
            color="bg-green-50"
            delay={0.2}
          />
          <StatCard
            title="Total Users"
            value={data.summary.totalUsers}
            icon="👥"
            color="bg-purple-50"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <DonutChart
            data={statusChartData}
            title="Tasks by Status"
          />
          <DonutChart
            data={priorityChartData}
            title="Tasks by Priority"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChart
            data={timelineData}
            title="Tasks Created — Last 7 Days"
            height={180}
          />
          <ActivityFeed items={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
