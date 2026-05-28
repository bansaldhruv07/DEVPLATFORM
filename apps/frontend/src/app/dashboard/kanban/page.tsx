'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAppStore';
import { useKanbanStore, TaskStatus } from '@/store/useKanbanStore';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import OnlinePresence from '@/components/kanban/OnlinePresence';
import CreateTaskModal from '@/components/kanban/CreateTaskModal';

const BOARD_ID = 'default-board'; // Single board for now

export default function KanbanPage() {
  const { user } = useAuthStore();
  const {
    tasks, onlineUsers, draggingTaskId, draggingUser,
    setTasks, addTask, updateTask, deleteTask,
    moveTask, setOnlineUsers, addOnlineUser, removeOnlineUser,
    setDraggingTaskId, setDraggingUser,
  } = useKanbanStore();

  const { socket, isConnected } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<TaskStatus>('todo');
  const [isLoading, setIsLoading] = useState(true);

  // ─── Load Tasks ──────────────────────────────────────────
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await api.get(`/tasks/board/${BOARD_ID}`);
        setTasks(response.data.data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [setTasks]);

  // ─── Socket Events ───────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    // Join board room
    socket.emit('board:join', {
      boardId: BOARD_ID,
      userName: user.name,
    });

    // Listen for events from other users
    socket.on('board:online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('board:user_joined', (newUser) => {
      addOnlineUser(newUser);
    });

    socket.on('board:user_left', ({ socketId }) => {
      removeOnlineUser(socketId);
    });

    socket.on('task:created', ({ task }) => {
      addTask(task);
    });

    socket.on('task:updated', ({ task }) => {
      updateTask(task);
    });

    socket.on('task:deleted', ({ taskId }) => {
      deleteTask(taskId);
    });

    socket.on('task:dragging', ({ taskId, userName }) => {
      setDraggingUser({ taskId, userName });
      // Clear after 3s if no update
      setTimeout(() => setDraggingUser(null), 3000);
    });

    return () => {
      socket.emit('board:leave', { boardId: BOARD_ID });
      socket.off('board:online_users');
      socket.off('board:user_joined');
      socket.off('board:user_left');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:dragging');
    };
  }, [socket, user, setOnlineUsers, addOnlineUser, removeOnlineUser,
      addTask, updateTask, deleteTask, setDraggingUser]);

  // ─── Handlers ────────────────────────────────────────────

  const handleDrop = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      // Find current task
      const allTasks = Object.values(tasks).flat();
      const task = allTasks.find((t) => t._id === taskId);
      if (!task || task.status === newStatus) return;

      // Optimistic update
      moveTask(taskId, newStatus);
      setDraggingTaskId(null);

      try {
        const response = await api.patch(`/tasks/${taskId}`, {
          status: newStatus,
        });

        // Broadcast to others
        socket?.emit('task:updated', {
          boardId: BOARD_ID,
          task: response.data.data,
        });
      } catch (error) {
        // Rollback optimistic update
        console.error('Failed to update task:', error);
        moveTask(taskId, task.status); // Revert
      }
    },
    [tasks, moveTask, setDraggingTaskId, socket]
  );

  const handleDragStart = useCallback(
    (taskId: string) => {
      setDraggingTaskId(taskId || null);
      if (taskId) {
        socket?.emit('task:dragging', {
          boardId: BOARD_ID,
          taskId,
          userName: user?.name || 'Someone',
        });
      }
    },
    [setDraggingTaskId, socket, user]
  );

  const handleCreateTask = useCallback(
    async (data: {
      title: string;
      description: string;
      priority: any;
      status: TaskStatus;
    }) => {
      try {
        const response = await api.post('/tasks', {
          ...data,
          boardId: BOARD_ID,
        });

        const newTask = response.data.data;

        // Add locally
        addTask(newTask);

        // Broadcast to others
        socket?.emit('task:created', {
          boardId: BOARD_ID,
          task: newTask,
        });
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    },
    [addTask, socket]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      // Optimistic delete
      deleteTask(taskId);

      try {
        await api.delete(`/tasks/${taskId}`);

        socket?.emit('task:deleted', {
          boardId: BOARD_ID,
          taskId,
        });
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    },
    [deleteTask, socket]
  );

  const handleOpenModal = (status: TaskStatus) => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const columns: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600 text-sm mt-1">
              Real-time collaborative task management
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="text-gray-500">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Online presence */}
            <OnlinePresence
              users={onlineUsers}
              currentUserId={user?.id}
            />

            {/* Add task button */}
            <button
              onClick={() => handleOpenModal('todo')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Add Task
            </button>
          </div>
        </motion.div>

        {/* Board */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4"
        >
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              title={status}
              status={status}
              tasks={tasks[status]}
              draggingTaskId={draggingTaskId}
              draggingUser={draggingUser}
              onDrop={handleDrop}
              onCreateTask={handleOpenModal}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
            />
          ))}
        </motion.div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        defaultStatus={modalStatus}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}