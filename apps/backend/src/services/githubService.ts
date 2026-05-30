import axios from 'axios';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  language: string;
  topics: string[];
  license?: {
    name: string;
  };
  default_branch: string;
}

interface GitHubLanguages {
  [key: string]: number;
}

interface CommitActivity {
  total: number;
  week: number;
  days: number[];
}

class GitHubService {
  private baseURL = 'https://api.github.com';
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevPlatform-App',
    };

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      this.headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }
  }

  // Fetch repository details
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await axios.get<GitHubRepo>(
        `${this.baseURL}/repos/${owner}/${repo}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Repository not found');
      }
      if (error.response?.status === 403) {
        throw new Error('GitHub API rate limit exceeded');
      }
      throw new Error('Failed to fetch repository');
    }
  }

  // Fetch languages used in repo
  async getLanguages(owner: string, repo: string): Promise<GitHubLanguages> {
    try {
      const response = await axios.get<GitHubLanguages>(
        `${this.baseURL}/repos/${owner}/${repo}/languages`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {};
    }
  }

  // Fetch commit activity (last 52 weeks)
  async getCommitActivity(owner: string, repo: string): Promise<CommitActivity[]> {
    try {
      const response = await axios.get<CommitActivity[]>(
        `${this.baseURL}/repos/${owner}/${repo}/stats/commit_activity`,
        { headers: this.headers }
      );
      if (response.status === 202 || !Array.isArray(response.data)) {
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching commit activity:', error);
      return [];
    }
  }

  // Fetch README content
  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/readme`,
        { 
          headers: { 
            ...this.headers, 
            Accept: 'application/vnd.github.v3.raw' 
          } 
        }
      );
      return response.data;
    } catch (error) {
      return 'No README found';
    }
  }

  // Fetch contributors count
  async getContributorsCount(owner: string, repo: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contributors`,
        { 
          headers: this.headers,
          params: { per_page: 1, anon: 'true' }
        }
      );
      
      // GitHub returns total count in Link header
      const linkHeader = response.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
      
      return response.data.length;
    } catch (error) {
      console.error('Error fetching contributors:', error);
      return 0;
    }
  }

  // Parse GitHub URL to extract owner and repo
  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    
    if (!match) return null;
    
    return {
      owner: match[1],
      repo: match[2].replace('.git', ''),
    };
  }
}

export default new GitHubService();