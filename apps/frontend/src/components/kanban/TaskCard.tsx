'use client';

import { Task } from '@/store/useKanbanStore';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  isDraggedByOther: boolean;
  draggedByName?: string;
  onDragStart: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const priorityStyles = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const priorityDot = {
  low: 'bg-green-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-400',
};

export default function TaskCard({
  task,
  isDragging,
  isDraggedByOther,
  draggedByName,
  onDragStart,
  onDelete,
}: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task._id);
    onDragStart(task._id);
  };

  const handleDragEnd = () => {
    onDragStart(''); // Clear dragging state
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg p-4 shadow-sm border cursor-grab active:cursor-grabbing transition-all group
        ${isDragging ? 'opacity-40 scale-95 border-indigo-300' : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'}
        ${isDraggedByOther ? 'border-amber-300 bg-amber-50' : ''}
      `}
    >
      {/* Being dragged by another user */}
      {isDraggedByOther && draggedByName && (
        <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
          <span className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
          {draggedByName} is moving this...
        </div>
      )}

      {/* Title + Delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800 leading-snug">
          {task.title}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            priorityStyles[task.priority]
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`}
          />
          {task.priority}
        </span>

        <span className="text-xs text-gray-400">
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}