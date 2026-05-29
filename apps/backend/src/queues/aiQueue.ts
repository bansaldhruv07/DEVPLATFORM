import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import RedisClient from '../config/redis';
import aiService from '../services/aiService';
import cacheService, { CacheService } from '../services/cacheService';
import logger from '../config/logger';

// Job data types
export interface RepoAnalysisJobData {
  type: 'repo-analysis';
  jobId: string;
  userId: string;
  owner: string;
  repo: string;
  repoData: any;
}

export interface CodeExplanationJobData {
  type: 'code-explanation';
  jobId: string;
  userId: string;
  code: string;
  language?: string;
}

export type AIJobData = RepoAnalysisJobData | CodeExplanationJobData;

// Queue result stored in Redis
export interface JobResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const CONNECTION = RedisClient.getInstance() as any;

// Create the queue
export const aiQueue = new Queue<AIJobData, any, string>('ai-processing', {
  connection: CONNECTION,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100, // Keep last 100 failed jobs
  },
});

// Create the worker (processes jobs)
export const aiWorker = new Worker<AIJobData, any, string>(
  'ai-processing',
  async (job: Job<AIJobData>) => {
    const { type, jobId } = job.data;

    logger.info('Processing AI job', { jobId, type, attempt: job.attemptsMade + 1 });

    // Update job status to processing
    await cacheService.set(
      CacheService.keys.aiJob(jobId),
      {
        jobId,
        status: 'processing',
        createdAt: new Date().toISOString(),
      } as JobResult,
      3600
    );

    let result: string;

    if (type === 'repo-analysis') {
      const data = job.data as RepoAnalysisJobData;
      result = await aiService.analyzeRepository(data.repoData);
    } else if (type === 'code-explanation') {
      const data = job.data as CodeExplanationJobData;
      result = await aiService.explainCode(data.code, data.language);
    } else {
      throw new Error(`Unknown job type: ${type}`);
    }

    // Store completed result in Redis
    await cacheService.set(
      CacheService.keys.aiJob(jobId),
      {
        jobId,
        status: 'completed',
        result,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      } as JobResult,
      3600
    );

    logger.info('AI job completed', { jobId, type });
    return result;
  },
  {
    connection: CONNECTION,
    concurrency: 3, // Process 3 jobs simultaneously
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per 60 seconds (Gemini rate limit)
    },
  }
);

// Worker event listeners
aiWorker.on('completed', (job) => {
  logger.info('Job completed', { jobId: job.data.jobId });
});

aiWorker.on('failed', async (job, error) => {
  if (!job) return;
  logger.error('Job failed', {
    jobId: job.data.jobId,
    error: error.message,
    attempts: job.attemptsMade,
  });

  // Mark as failed in cache after all retries exhausted
  if (job.attemptsMade >= (job.opts.attempts || 3)) {
    await cacheService.set(
      CacheService.keys.aiJob(job.data.jobId),
      {
        jobId: job.data.jobId,
        status: 'failed',
        error: error.message,
        createdAt: new Date().toISOString(),
      } as JobResult,
      3600
    );
  }
});

// Monitor queue events
export const aiQueueEvents = new QueueEvents('ai-processing', {
  connection: RedisClient.getInstance() as any,
});

logger.info('✅ BullMQ AI Queue initialized');
