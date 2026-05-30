import express, { Request, Response } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config(); //always creates an issue...always config first before loading anything

import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Database from './config/database';
import RedisClient from './config/redis';
import logger from './config/logger';
import { requestLogger, errorLogger } from './middleware/requestLogger';
import { initializeSocket } from './socket/socketServer';
import analyticsRoutes from './routes/analyticsRoutes';

// Import queues (initializes workers)
import './queues/aiQueue';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import repoRoutes from './routes/repoRoutes';
import taskRoutes from './routes/taskRoutes';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000', // Always allow local dev
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger); // Log all requests

// Health check — now includes Redis status
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = Database.getConnectionStatus();
  const redisStatus = RedisClient.getStatus();

  res.status(200).json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    redis: redisStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/repos', repoRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Error logger (must be AFTER routes)
app.use(errorLogger);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await Database.connect();

    // Initialize Redis
    RedisClient.getInstance();

    // Initialize Socket.io
    const io = initializeSocket(httpServer);
    app.set('io', io);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  await Database.disconnect();
  await RedisClient.disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();