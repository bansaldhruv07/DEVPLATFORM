import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

interface OnlineUser {
  userId: string;
  name: string;
  socketId: string;
  boardId?: string;
}

// Track online users (in-memory for now, Redis in production)
const onlineUsers = new Map<string, OnlineUser>();

export const initializeSocket = (httpServer: HTTPServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for Socket.io
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      // Attach user to socket
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`⚡ User connected: ${user.email} (${socket.id})`);

    // Track online user
    onlineUsers.set(socket.id, {
      userId: user.userId,
      name: user.email,
      socketId: socket.id,
    });

    // ─── Board Events ──────────────────────────────────────

    // Join a board room
    socket.on('board:join', ({ boardId, userName }) => {
      socket.join(`board:${boardId}`);

      // Update user's current board
      const userEntry = onlineUsers.get(socket.id);
      if (userEntry) {
        userEntry.boardId = boardId;
        userEntry.name = userName || user.email;
      }

      // Notify others in the room
      socket.to(`board:${boardId}`).emit('board:user_joined', {
        userId: user.userId,
        name: userName || user.email,
        socketId: socket.id,
      });

      // Send current online users in this board to new joiner
      const boardUsers = Array.from(onlineUsers.values()).filter(
        (u) => u.boardId === boardId && u.socketId !== socket.id
      );
      socket.emit('board:online_users', boardUsers);

      console.log(`👥 ${user.email} joined board: ${boardId}`);
    });

    // Leave board
    socket.on('board:leave', ({ boardId }) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('board:user_left', {
        userId: user.userId,
        socketId: socket.id,
      });
    });

    // ─── Task Events ───────────────────────────────────────

    // Task created
    socket.on('task:created', ({ boardId, task }) => {
      // Broadcast to everyone in room EXCEPT sender
      socket.to(`board:${boardId}`).emit('task:created', { task });
    });

    // Task updated (drag & drop, edit)
    socket.on('task:updated', ({ boardId, task }) => {
      socket.to(`board:${boardId}`).emit('task:updated', { task });
    });

    // Task deleted
    socket.on('task:deleted', ({ boardId, taskId }) => {
      socket.to(`board:${boardId}`).emit('task:deleted', { taskId });
    });

    // User is dragging a task (live cursor feedback)
    socket.on('task:dragging', ({ boardId, taskId, userName }) => {
      socket.to(`board:${boardId}`).emit('task:dragging', {
        taskId,
        userName,
        userId: user.userId,
      });
    });

    // ─── Disconnect ────────────────────────────────────────

    socket.on('disconnect', () => {
      const userEntry = onlineUsers.get(socket.id);

      if (userEntry?.boardId) {
        socket.to(`board:${userEntry.boardId}`).emit('board:user_left', {
          userId: user.userId,
          socketId: socket.id,
        });
      }

      onlineUsers.delete(socket.id);
      console.log(`❌ User disconnected: ${user.email}`);
    });
  });

  return io;
};