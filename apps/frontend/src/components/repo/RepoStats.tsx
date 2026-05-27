'use client';

import { Repository, RepoMetrics } from '@/types/repo';

interface StatBadgeProps {
  icon: string;
  label: string;
  value: string | number;
}

function StatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
      <span className="text-2xl mb-1">{icon}</span>

      <span className="text-xl font-bold text-gray-900">
        {typeof value === 'number' && value >= 1000
          ? `${(value / 1000).toFixed(1)}k`
          : value}
      </span>

      <span className="text-xs text-gray-500 text-center">
        {label}
      </span>
    </div>
  );
}

interface RepoStatsProps {
  repository: Repository;
  metrics: RepoMetrics;
}

export default function RepoStats({
  repository,
  metrics,
}: RepoStatsProps) {
  const lastPush = new Date(repository.lastPush);

  const daysAgo = Math.floor(
    (Date.now() - lastPush.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Repo Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {repository.name}
          </h3>

          <p className="text-sm text-gray-500">
            {repository.fullName}
          </p>
        </div>

        <a
          href={repository.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          View on GitHub →
        </a>
      </div>

      {/* Description */}
      {repository.description && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {repository.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatBadge
          icon="⭐"
          label="Stars"
          value={repository.stars}
        />

        <StatBadge
          icon="🍴"
          label="Forks"
          value={repository.forks}
        />

        <StatBadge
          icon="🐛"
          label="Issues"
          value={repository.openIssues}
        />

        <StatBadge
          icon="👥"
          label="Contributors"
          value={metrics.contributors}
        />

        <StatBadge
          icon="📝"
          label="Commits/Week"
          value={metrics.commitFrequency}
        />

        <StatBadge
          icon="📅"
          label="Days Since Push"
          value={daysAgo}
        />
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 text-xs">
        {repository.language && (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
            {repository.language}
          </span>
        )}

        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          {repository.license || 'No License'}
        </span>

        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
          Created{' '}
          {new Date(repository.createdAt).getFullYear()}
        </span>
      </div>
    </div>
  );
}