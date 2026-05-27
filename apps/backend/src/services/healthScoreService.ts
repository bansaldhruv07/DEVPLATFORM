interface RepoMetrics {
  stars: number;
  forks: number;
  openIssues: number;
  hasReadme: boolean;
  hasLicense: boolean;
  daysSinceLastCommit: number;
  contributorsCount: number;
  commitFrequency: number; // Commits per week (last 12 weeks)
}

interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    popularity: number; // Stars + Forks
    maintenance: number; // Recent commits + open issues
    community: number; // Contributors + engagement
    documentation: number; // README + License
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  insights: string[];
}

class HealthScoreService {
  calculateHealthScore(metrics: RepoMetrics): HealthScore {
    // 1. Popularity Score (0-25 points)
    const popularityScore = this.calculatePopularityScore(
      metrics.stars,
      metrics.forks
    );

    // 2. Maintenance Score (0-25 points)
    const maintenanceScore = this.calculateMaintenanceScore(
      metrics.daysSinceLastCommit,
      metrics.openIssues,
      metrics.commitFrequency
    );

    // 3. Community Score (0-25 points)
    const communityScore = this.calculateCommunityScore(
      metrics.contributorsCount,
      metrics.forks
    );

    // 4. Documentation Score (0-25 points)
    const documentationScore = this.calculateDocumentationScore(
      metrics.hasReadme,
      metrics.hasLicense
    );

    const overall = Math.round(
      popularityScore + maintenanceScore + communityScore + documentationScore
    );

    const grade = this.getGrade(overall);
    const insights = this.generateInsights(metrics, {
      popularity: popularityScore,
      maintenance: maintenanceScore,
      community: communityScore,
      documentation: documentationScore,
    });

    return {
      overall,
      breakdown: {
        popularity: Math.round(popularityScore),
        maintenance: Math.round(maintenanceScore),
        community: Math.round(communityScore),
        documentation: Math.round(documentationScore),
      },
      grade,
      insights,
    };
  }

  private calculatePopularityScore(stars: number, forks: number): number {
    // Logarithmic scale (popular repos have exponential stars)
    const starScore = Math.min(15, Math.log10(stars + 1) * 3);
    const forkScore = Math.min(10, Math.log10(forks + 1) * 2);
    return starScore + forkScore;
  }

  private calculateMaintenanceScore(
    daysSinceLastCommit: number,
    openIssues: number,
    commitFrequency: number
  ): number {
    // Recent activity (0-10 points)
    let activityScore = 10;
    if (daysSinceLastCommit > 180) activityScore = 0;
    else if (daysSinceLastCommit > 90) activityScore = 3;
    else if (daysSinceLastCommit > 30) activityScore = 6;
    else if (daysSinceLastCommit > 7) activityScore = 8;

    // Issue management (0-8 points)
    let issueScore = 8;
    if (openIssues > 100) issueScore = 2;
    else if (openIssues > 50) issueScore = 4;
    else if (openIssues > 20) issueScore = 6;

    // Commit frequency (0-7 points)
    const frequencyScore = Math.min(7, commitFrequency / 2);

    return activityScore + issueScore + frequencyScore;
  }

  private calculateCommunityScore(
    contributors: number,
    forks: number
  ): number {
    // Contributors (0-15 points)
    const contributorScore = Math.min(15, Math.log10(contributors + 1) * 5);

    // Fork engagement (0-10 points)
    const forkScore = Math.min(10, Math.log10(forks + 1) * 2);

    return contributorScore + forkScore;
  }

  private calculateDocumentationScore(
    hasReadme: boolean,
    hasLicense: boolean
  ): number {
    let score = 0;
    if (hasReadme) score += 15;
    if (hasLicense) score += 10;
    return score;
  }

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private generateInsights(
    metrics: RepoMetrics,
    breakdown: HealthScore['breakdown']
  ): string[] {
    const insights: string[] = [];

    // Popularity insights
    if (breakdown.popularity < 10) {
      insights.push('Low visibility - consider promoting your project');
    } else if (breakdown.popularity > 20) {
      insights.push('Excellent community interest!');
    }

    // Maintenance insights
    if (metrics.daysSinceLastCommit > 180) {
      insights.push('⚠️ No commits in 6+ months - project may be abandoned');
    } else if (metrics.daysSinceLastCommit < 7) {
      insights.push('✅ Active development - recently updated');
    }

    if (metrics.openIssues > 50) {
      insights.push('⚠️ High number of open issues - maintenance backlog');
    }

    // Community insights
    if (metrics.contributorsCount === 1) {
      insights.push('Single maintainer - bus factor risk');
    } else if (metrics.contributorsCount > 10) {
      insights.push('Strong contributor base');
    }

    // Documentation insights
    if (!metrics.hasReadme) {
      insights.push('❌ Missing README - add documentation');
    }
    if (!metrics.hasLicense) {
      insights.push('❌ No license - legal ambiguity for users');
    }

    return insights;
  }
}

export default new HealthScoreService();