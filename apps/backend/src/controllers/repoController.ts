import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import githubService from '../services/githubService';
import healthScoreService from '../services/healthScoreService';
import aiService from '../services/aiService';

// Analyze repository
export const analyzeRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400).json({
        success: false,
        message: 'Repository URL is required',
      });
      return;
    }

    // Parse GitHub URL
    const parsed = githubService.parseGitHubUrl(repoUrl);
    if (!parsed) {
      res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL',
      });
      return;
    }

    const { owner, repo } = parsed;

    // Fetch repository data in parallel
    const [repoData, languages, commitActivity, readme, contributorsCount] =
      await Promise.all([
        githubService.getRepository(owner, repo),
        githubService.getLanguages(owner, repo),
        githubService.getCommitActivity(owner, repo),
        githubService.getReadme(owner, repo),
        githubService.getContributorsCount(owner, repo),
      ]);

    // Calculate days since last commit
    const daysSinceLastCommit = Math.floor(
      (Date.now() - new Date(repoData.pushed_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Calculate commit frequency (last 12 weeks)
    const recentActivity = commitActivity.slice(-12);
    const commitFrequency =
      recentActivity.reduce((sum, week) => sum + week.total, 0) / 12;

    // Calculate health score
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

    // Detect tech stack from languages
    const languageNames = Object.keys(languages);
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const techStack = languageNames.map((lang) => ({
      name: lang,
      percentage: ((languages[lang] / totalBytes) * 100).toFixed(1),
    }));

    // Generate AI analysis (async, don't block response)
    let aiAnalysis = 'Generating analysis...';
    try {
      aiAnalysis = await aiService.analyzeRepository({
        name: repoData.name,
        description: repoData.description || '',
        languages: languageNames,
        readme,
        stars: repoData.stargazers_count,
        openIssues: repoData.open_issues_count,
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiAnalysis = 'AI analysis unavailable';
    }

    res.status(200).json({
      success: true,
      data: {
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
        aiAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Repository analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze repository',
    });
  }
};

// Explain code snippet
export const explainCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, language } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Code is required',
      });
      return;
    }

    const explanation = await aiService.explainCode(code, language);

    res.status(200).json({
      success: true,
      data: { explanation },
    });
  } catch (error: any) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explain code',
    });
  }
};

// Debug code
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

    const solution = await aiService.debugCode(code, error, language);

    res.status(200).json({
      success: true,
      data: { solution },
    });
  } catch (error: any) {
    console.error('Code debugging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug code',
    });
  }
};