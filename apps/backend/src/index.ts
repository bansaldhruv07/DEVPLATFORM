import express, { Request, Response } from 'express';
import { createServer } from 'http'; // ADD: Need HTTP server for Socket.io
import dotenv from 'dotenv';
dotenv.config(); //always creates an issue...always config first before loading anything
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Database from './config/database';
import { initializeSocket } from './socket/socketServer';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import repoRoutes from './routes/repoRoutes';
import taskRoutes from './routes/taskRoutes';

const app = express();
const httpServer = createServer(app); // Wrap Express in HTTP server
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = Database.getConnectionStatus();
  res.status(200).json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/repos', repoRoutes);
app.use('/api/v1/tasks', taskRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await Database.connect();

    // Initialize Socket.io AFTER DB connects
    const io = initializeSocket(httpServer);
    app.set('io', io); // Make io accessible in controllers if needed

    // Use httpServer.listen instead of app.listen
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`⚡ Socket.io initialized`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await Database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await Database.disconnect();
  process.exit(0);
});

startServer();