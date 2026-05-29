import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

// Add uuid for correlation IDs
// npm install uuid @types/uuid

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Unique ID per request — trace across logs
  const correlationId = uuidv4();
  const startTime = Date.now();

  // Attach to request for use in controllers
  (req as any).correlationId = correlationId;

  // Log incoming request
  logger.info('Incoming request', {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('Request completed', {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error', {
    correlationId: (req as any).correlationId,
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};  