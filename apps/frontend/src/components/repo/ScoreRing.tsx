'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  grade: string;
  size?: number;
}

const gradeColors: Record<string, string> = {
  A: '#22c55e', // green
  B: '#84cc16', // lime
  C: '#eab308', // yellow
  D: '#f97316', // orange
  F: '#ef4444', // red
};

export default function ScoreRing({ score, grade, size = 160 }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const color = gradeColors[grade] || '#6366f1';

  useEffect(() => {
    // Animate score from 0 to actual value
    let start = 0;
    const step = score / 60; // 60 frames
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.05s ease' }}
          />
        </svg>
        {/* Score text (centered) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {animatedScore}
          </span>
          <span
            className="text-2xl font-bold"
            style={{ color }}
          >
            {grade}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">Health Score</p>
    </div>
  );
}