'use client';

import { OnlineUser } from '@/store/useKanbanStore';

interface OnlinePresenceProps {
  users: OnlineUser[];
  currentUserId?: string;
}

const avatarColors = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-amber-500',
];

export default function OnlinePresence({
  users,
  currentUserId,
}: OnlinePresenceProps) {
  const others = users.filter((u) => u.userId !== currentUserId);

  if (others.length === 0) return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
      Only you here
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-xs text-gray-500 mr-1">Online:</span>
      <div className="flex -space-x-2">
        {others.slice(0, 5).map((user, i) => (
          <div
            key={user.socketId}
            className={`h-7 w-7 rounded-full ${
              avatarColors[i % avatarColors.length]
            } flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {others.length > 5 && (
          <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
            +{others.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {others.length} collaborating
      </span>
    </div>
  );
}