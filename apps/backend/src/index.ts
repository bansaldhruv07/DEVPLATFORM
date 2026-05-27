import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Database from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import repoRoutes from './routes/repoRoutes'; // ADD THIS



const app = express();
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
  const rawReadyState = require('mongoose').connection.readyState;
  console.log(`🔍 [Health Check] dbStatus (Database.ts): ${dbStatus}, rawReadyState (Mongoose): ${rawReadyState}`);
  res.status(200).json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    readyState: rawReadyState,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/repos', repoRoutes); // ADD THIS

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const startServer = async () => {
  try {
    await Database.connect();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

startServer();