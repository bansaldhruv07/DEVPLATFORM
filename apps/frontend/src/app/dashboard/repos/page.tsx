'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { repoAPI } from '@/lib/api';
import { AnalysisResult } from '@/types/repo';
import ScoreRing from '@/components/repo/ScoreRing';
import HealthBreakdown from '@/components/repo/HealthBreakdown';
import TechStackChart from '@/components/repo/TechStackChart';
import RepoStats from '@/components/repo/RepoStats';
import AIAnalysis from '@/components/repo/AIAnalysis';
import AnalysisSkeleton from '@/components/repo/AnalysisSkeleton';

export default function RepoAnalyzerPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const response = await repoAPI.analyze(repoUrl);
      const data = response.data.data;
      setResult(data);

      if (data.jobId) {
        const jobId = data.jobId;
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await repoAPI.getJobStatus(jobId);
            const { status, result: jobResult, error: jobError } = statusResponse.data.data;

            if (status === 'completed') {
              clearInterval(pollInterval);
              setResult((prev) => {
                if (!prev || prev.jobId !== jobId) return prev;
                return {
                  ...prev,
                  aiAnalysis: jobResult || '',
                };
              });
            } else if (status === 'failed') {
              clearInterval(pollInterval);
              setResult((prev) => {
                if (!prev || prev.jobId !== jobId) return prev;
                return {
                  ...prev,
                  aiAnalysis: `❌ AI analysis failed: ${jobError || 'Unknown error'}`,
                };
              });
            }
          } catch (err) {
            clearInterval(pollInterval);
            setResult((prev) => {
              if (!prev || prev.jobId !== jobId) return prev;
              return {
                ...prev,
                aiAnalysis: '❌ Failed to check AI analysis job status.',
              };
            });
          }
        }, 2000);

        // Safety timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 60000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Analysis failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const exampleRepos = [
    'https://github.com/vercel/next.js',
    'https://github.com/facebook/react',
    'https://github.com/microsoft/TypeScript',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Repository Analyzer
          </h1>
          <p className="text-gray-600 mt-1">
            Analyze any GitHub repository for health, tech stack, and AI-powered insights
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/owner/repository"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </div>

          {/* Example repos */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleRepos.map((url) => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {url.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Row 1: Repo Stats + Score Ring */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <RepoStats
                    repository={result.repository}
                    metrics={result.metrics}
                  />
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <ScoreRing
                    score={result.healthScore.overall}
                    grade={result.healthScore.grade}
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Grade:{' '}
                      <span className="font-bold text-gray-900">
                        {result.healthScore.grade}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Health Breakdown + Tech Stack */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HealthBreakdown breakdown={result.healthScore.breakdown} />
                <TechStackChart techStack={result.techStack} />
              </div>

              {/* Row 3: AI Analysis */}
              <AIAnalysis
                analysis={result.aiAnalysis}
                insights={result.healthScore.insights}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}