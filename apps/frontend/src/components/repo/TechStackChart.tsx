'use client';

import { useEffect, useState } from 'react';

interface TechStack {
  name: string;
  percentage: string;
}

const languageColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  default: '#6366f1',
};

interface TechStackChartProps {
  techStack: TechStack[];
}

export default function TechStackChart({ techStack }: TechStackChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const top = techStack.slice(0, 6); // Show top 6 languages

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack</h3>

      {/* Stacked Bar */}
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        {top.map((lang) => (
          <div
            key={lang.name}
            style={{
              width: animated ? `${lang.percentage}%` : '0%',
              backgroundColor:
                languageColors[lang.name] || languageColors.default,
              transition: 'width 0.8s ease-out',
            }}
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {top.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  languageColors[lang.name] || languageColors.default,
              }}
            />
            <span className="text-sm text-gray-700 truncate">{lang.name}</span>
            <span className="text-sm text-gray-400 ml-auto">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}