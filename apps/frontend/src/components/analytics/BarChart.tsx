'use client';

import { useEffect, useState } from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

export default function BarChart({ data, title, height = 160 }: BarChartProps) {
  const [animated, setAnimated] = useState(false);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div
        className="flex items-end gap-3"
        style={{ height }}
      >
        {data.map((item, i) => (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-1"
          >
            {/* Value label */}
            <span className="text-xs font-semibold text-gray-600">
              {item.value}
            </span>
            {/* Bar */}
            <div
              className="w-full rounded-t-md transition-all duration-700 ease-out"
              style={{
                height: animated
                  ? `${(item.value / maxValue) * (height - 40)}px`
                  : '0px',
                backgroundColor: item.color || '#6366f1',
                transitionDelay: `${i * 80}ms`,
                minHeight: item.value > 0 ? '4px' : '0px',
              }}
            />
            {/* X label */}
            <span className="text-xs text-gray-500 text-center truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}