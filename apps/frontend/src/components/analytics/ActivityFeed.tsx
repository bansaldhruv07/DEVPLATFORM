interface ActivityItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

const priorityDot: Record<string, string> = {
  low: 'bg-green-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-400',
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">
          No tasks yet. Create some on the Kanban board!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                priorityDot[item.priority]
              }`}
            />
            <p className="text-sm text-gray-800 flex-1 truncate">
              {item.title}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                statusColors[item.status]
              }`}
            >
              {item.status}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {new Date(item.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}