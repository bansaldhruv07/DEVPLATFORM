'use client';

import { useEffect, useState } from 'react';

interface BarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay: number;
}

function AnimatedBar({ label, value, maxValue, color, delay }: BarProps) {
  const [width, setWidth] = useState(0);
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {value}/{maxValue}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface HealthBreakdownProps {
  breakdown: {
    popularity: number;
    maintenance: number;
    community: number;
    documentation: number;
  };
}

export default function HealthBreakdown({ breakdown }: HealthBreakdownProps) {
  const categories = [
    { label: 'Popularity', value: breakdown.popularity, color: '#6366f1' },
    { label: 'Maintenance', value: breakdown.maintenance, color: '#22c55e' },
    { label: 'Community', value: breakdown.community, color: '#f59e0b' },
    { label: 'Documentation', value: breakdown.documentation, color: '#ec4899' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Score Breakdown
      </h3>
      {categories.map((cat, i) => (
        <AnimatedBar
          key={cat.label}
          label={cat.label}
          value={cat.value}
          maxValue={25}
          color={cat.color}
          delay={i * 150}
        />
      ))}
    </div>
  );
}