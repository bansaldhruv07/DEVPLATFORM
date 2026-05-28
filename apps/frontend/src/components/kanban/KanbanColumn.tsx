'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/store/useKanbanStore';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  draggingTaskId: string | null;
  draggingUser: { taskId: string; userName: string } | null;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask: (status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
}

const columnStyles: Record<TaskStatus, { header: string; badge: string; dot: string }> = {
  todo: {
    header: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  'in-progress': {
    header: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
  },
  review: {
    header: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-600',
    dot: 'bg-yellow-500',
  },
  done: {
    header: 'text-green-700',
    badge: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
  },
};

const columnTitles: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function KanbanColumn({
  status,
  tasks,
  draggingTaskId,
  draggingUser,
  onDrop,
  onCreateTask,
  onDeleteTask,
  onDragStart,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const styles = columnStyles[status];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div className="flex-1 min-w-[260px] max-w-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
          <h3 className={`font-semibold text-sm ${styles.header}`}>
            {columnTitles[status]}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onCreateTask(status)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[500px] rounded-xl p-3 transition-all space-y-3 ${
          isDragOver
            ? 'bg-indigo-50 border-2 border-indigo-300 border-dashed'
            : 'bg-gray-100 border-2 border-transparent'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            isDragging={draggingTaskId === task._id}
            isDraggedByOther={draggingUser?.taskId === task._id}
            draggedByName={
              draggingUser?.taskId === task._id
                ? draggingUser.userName
                : undefined
            }
            onDragStart={onDragStart}
            onDelete={onDeleteTask}
          />
        ))}

        {tasks.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}