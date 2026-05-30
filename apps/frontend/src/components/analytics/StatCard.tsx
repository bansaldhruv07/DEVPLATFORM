'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span
          className={`text-2xl p-2 rounded-lg ${color}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}