import { create } from 'zustand';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  boardId: string;
  order: number;
  createdBy: string;
  createdAt: string;
}

export interface OnlineUser {
  userId: string;
  name: string;
  socketId: string;
}

interface KanbanState {
  tasks: Record<TaskStatus, Task[]>;
  onlineUsers: OnlineUser[];
  draggingTaskId: string | null;
  draggingUser: { taskId: string; userName: string } | null;

  // Actions
  setTasks: (tasks: Record<TaskStatus, Task[]>) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (socketId: string) => void;
  setDraggingTaskId: (id: string | null) => void;
  setDraggingUser: (data: { taskId: string; userName: string } | null) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: { todo: [], 'in-progress': [], review: [], done: [] },
  onlineUsers: [],
  draggingTaskId: null,
  draggingUser: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [task.status]: [...state.tasks[task.status], task],
      },
    })),

  updateTask: (updatedTask) =>
    set((state) => {
      // Remove from all columns, add to correct one
      const newTasks = { ...state.tasks };
      (Object.keys(newTasks) as TaskStatus[]).forEach((status) => {
        newTasks[status] = newTasks[status].filter(
          (t) => t._id !== updatedTask._id
        );
      });
      newTasks[updatedTask.status] = [
        ...newTasks[updatedTask.status],
        updatedTask,
      ];
      return { tasks: newTasks };
    }),

  deleteTask: (taskId) =>
    set((state) => {
      const newTasks = { ...state.tasks };
      (Object.keys(newTasks) as TaskStatus[]).forEach((status) => {
        newTasks[status] = newTasks[status].filter((t) => t._id !== taskId);
      });
      return { tasks: newTasks };
    }),

  moveTask: (taskId, newStatus) =>
    set((state) => {
      let taskToMove: Task | null = null;
      const newTasks = { ...state.tasks };

      // Find and remove from current column
      (Object.keys(newTasks) as TaskStatus[]).forEach((status) => {
        const idx = newTasks[status].findIndex((t) => t._id === taskId);
        if (idx !== -1) {
          taskToMove = { ...newTasks[status][idx], status: newStatus };
          newTasks[status] = newTasks[status].filter((t) => t._id !== taskId);
        }
      });

      // Add to new column
      if (taskToMove) {
        newTasks[newStatus] = [...newTasks[newStatus], taskToMove];
      }

      return { tasks: newTasks };
    }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (user) =>
    set((state) => ({
      onlineUsers: [...state.onlineUsers.filter(u => u.socketId !== user.socketId), user],
    })),

  removeOnlineUser: (socketId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.socketId !== socketId),
    })),

  setDraggingTaskId: (id) => set({ draggingTaskId: id }),

  setDraggingUser: (data) => set({ draggingUser: data }),
}));