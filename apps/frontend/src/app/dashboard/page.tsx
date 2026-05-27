'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAppStore';
import { authAPI } from '@/lib/api';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🔍',
    title: 'Repo Analyzer',
    description: 'Analyze GitHub repos for health score, tech stack, and AI insights',
    href: '/dashboard/repos',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'Live',
  },
  {
    icon: '🤖',
    title: 'Code Explainer',
    description: 'Get AI-powered explanations and debugging help for any code',
    href: '/dashboard/explain',
    color: 'bg-purple-50 border-purple-200',
    badge: 'Live',
  },
  {
    icon: '📋',
    title: 'Kanban Board',
    description: 'Team task management with real-time collaboration',
    href: '/dashboard/kanban',
    color: 'bg-green-50 border-green-200',
    badge: 'Coming Soon',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Track productivity metrics and team performance',
    href: '/dashboard/analytics',
    color: 'bg-amber-50 border-amber-200',
    badge: 'Coming Soon',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      logout();
      router.push('/login');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-gray-900">DevPlatform</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Your AI-powered developer productivity platform
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={feature.href}
                className={`block p-6 rounded-2xl border-2 ${feature.color} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{feature.icon}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      feature.badge === 'Live'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}