'use client';

import { useEffect, useState } from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  title: string;
  size?: number;
}

export default function DonutChart({
  data,
  title,
  size = 160,
}: DonutChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Build slices
  let cumulativePercent = 0;
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const percent = d.value / total;
      const offset = circumference * (1 - cumulativePercent);
      const dash = circumference * percent;
      cumulativePercent += percent;
      return { ...d, percent, offset, dash };
    });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        {/* SVG Donut */}
        <div className="flex-shrink-0">
          <svg
            width={size}
            height={size}
            className="-rotate-90"
          >
            {/* Background */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            {slices.map((slice, i) => (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="20"
                strokeDasharray={`${animated ? slice.dash : 0} ${circumference}`}
                strokeDashoffset={slice.offset}
                style={{
                  transition: `stroke-dasharray 0.6s ease ${i * 100}ms`,
                }}
              />
            ))}
            {/* Center text */}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="rotate-90"
              style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
              fill="#111827"
              fontSize="20"
              fontWeight="700"
            >
              {total}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 capitalize">
                  {item.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}