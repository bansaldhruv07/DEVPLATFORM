export interface TechStack {
  name: string;
  percentage: string;
}

export interface HealthBreakdown {
  popularity: number;
  maintenance: number;
  community: number;
  documentation: number;
}

export interface HealthScore {
  overall: number;
  breakdown: HealthBreakdown;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  insights: string[];
}

export interface Repository {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  lastPush: string;
}

export interface RepoMetrics {
  contributors: number;
  commitFrequency: string;
  daysSinceLastCommit: number;
}

export interface AnalysisResult {
  repository: Repository;
  healthScore: HealthScore;
  techStack: TechStack[];
  metrics: RepoMetrics;
  aiAnalysis: string;
  jobId?: string;
}