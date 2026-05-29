import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import githubService from '../services/githubService';
import healthScoreService from '../services/healthScoreService';
import aiService from '../services/aiService';
import cacheService, { CacheService } from '../services/cacheService';
import { aiQueue, JobResult } from '../queues/aiQueue';
import logger from '../config/logger';

export const analyzeRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const correlationId = (req as any).correlationId;

  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400).json({ success: false, message: 'Repository URL is required' });
      return;
    }

    const parsed = githubService.parseGitHubUrl(repoUrl);
    if (!parsed) {
      res.status(400).json({ success: false, message: 'Invalid GitHub URL' });
      return;
    }

    const { owner, repo } = parsed;

    logger.info('Analyzing repository', { correlationId, owner, repo });

    // Check cache first (avoid re-fetching GitHub API)
    const cacheKey = CacheService.keys.repoAnalysis(owner, repo);
    const cached = await cacheService.get<any>(cacheKey);

    if (cached) {
      logger.info('Serving cached repo analysis', { correlationId, owner, repo });
      res.status(200).json({
        success: true,
        data: cached,
        meta: { cached: true },
      });
      return;
    }

    // Fetch GitHub data in parallel
    const [repoData, languages, commitActivity, readme, contributorsCount] =
      await Promise.all([
        githubService.getRepository(owner, repo),
        githubService.getLanguages(owner, repo),
        githubService.getCommitActivity(owner, repo),
        githubService.getReadme(owner, repo),
        githubService.getContributorsCount(owner, repo),
      ]);

    const daysSinceLastCommit = Math.floor(
      (Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const recentActivity = commitActivity.slice(-12);
    const commitFrequency =
      recentActivity.reduce((sum, week) => sum + week.total, 0) / 12;

    const healthScore = healthScoreService.calculateHealthScore({
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      hasReadme: readme !== 'No README found',
      hasLicense: !!repoData.license,
      daysSinceLastCommit,
      contributorsCount,
      commitFrequency,
    });

    const languageNames = Object.keys(languages);
    const totalBytes = Object.values(languages).reduce((a: number, b: number) => a + b, 0);
    const techStack = languageNames.map((lang) => ({
      name: lang,
      percentage: ((languages[lang] / totalBytes) * 100).toFixed(1),
    }));

    // Queue AI analysis as background job
    const jobId = uuidv4();
    await aiQueue.add(
      'repo-analysis',
      {
        type: 'repo-analysis',
        jobId,
        userId: req.user!.userId,
        owner,
        repo,
        repoData: {
          name: repoData.name,
          description: repoData.description || '',
          languages: languageNames,
          readme,
          stars: repoData.stargazers_count,
          openIssues: repoData.open_issues_count,
        },
      },
      { jobId }
    );

    const responseData = {
      repository: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.watchers_count,
        language: repoData.language,
        license: repoData.license?.name || 'No license',
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        lastPush: repoData.pushed_at,
      },
      healthScore,
      techStack,
      metrics: {
        contributors: contributorsCount,
        commitFrequency: commitFrequency.toFixed(1),
        daysSinceLastCommit,
      },
      aiAnalysis: 'Analyzing with AI... check /repos/job/' + jobId,
      jobId, // Client can poll this
    };

    // Cache for 1 hour
    await cacheService.set(cacheKey, responseData, 3600);

    logger.info('Repository analysis complete', { correlationId, owner, repo, jobId });

    res.status(200).json({
      success: true,
      data: responseData,
      meta: { cached: false, jobId },
    });
  } catch (error: any) {
    logger.error('Repository analysis failed', {
      correlationId,
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze repository',
    });
  }
};

// Poll job status
export const getJobStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const result = await cacheService.get<JobResult>(
      CacheService.keys.aiJob(jobId as string)
    );

    if (!result) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get job status' });
  }
};

// Explain code (with caching)
export const explainCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, language } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Code is required' });
      return;
    }

    // For code explanation, queue as background job
    const jobId = uuidv4();

    // Store initial pending state
    await cacheService.set(
      CacheService.keys.aiJob(jobId),
      {
        jobId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } as JobResult,
      3600
    );

    await aiQueue.add('code-explanation', {
      type: 'code-explanation',
      jobId,
      userId: req.user!.userId,
      code,
      language,
    });

    res.status(202).json({
      success: true,
      message: 'Code explanation queued',
      data: { jobId, status: 'pending' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to queue code explanation' });
  }
};

// Debug code (synchronous — needs fast feedback)
export const debugCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, error, language } = req.body;

    if (!code || !error) {
      res.status(400).json({
        success: false,
        message: 'Code and error message are required',
      });
      return;
    }

    // Debug is synchronous — developers need immediate feedback
    const solution = await aiService.debugCode(code, error, language);

    res.status(200).json({ success: true, data: { solution } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to debug code' });
  }
};