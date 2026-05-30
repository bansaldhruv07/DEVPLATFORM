'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAppStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [healthStatus, setHealthStatus] = useState<'ok' | 'error' | 'loading'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
        const response = await axios.get(`${cleanApiUrl}/health`);
        setHealthStatus(response.data.status === 'ok' ? 'ok' : 'error');
      } catch (error) {
        setHealthStatus('error');
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-white mb-4">
            Developer Productivity Platform
          </h1>
          <p className="text-xl text-white/90 mb-8">
            AI-powered tools for modern developers
          </p>

          {/* Health Status */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div
              className={`h-3 w-3 rounded-full ${
                healthStatus === 'ok'
                  ? 'bg-green-400'
                  : healthStatus === 'error'
                  ? 'bg-red-400'
                  : 'bg-yellow-400 animate-pulse'
              }`}
            />
            <span className="text-white text-sm">
              Backend {healthStatus === 'ok' ? 'Connected' : healthStatus === 'error' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg border-2 border-white"
            >
              Get Started
            </Link>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
          >
            {[
              { icon: '🤖', title: 'AI Assistant', desc: 'Code explanation & debugging' },
              { icon: '📊', title: 'Analytics', desc: 'Track your productivity' },
              { icon: '🔄', title: 'Real-time', desc: 'Live collaboration' },
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}