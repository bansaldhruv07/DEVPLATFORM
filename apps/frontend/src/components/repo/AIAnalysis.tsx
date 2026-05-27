'use client';

import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  analysis: string;
  insights: string[];
}

export default function AIAnalysis({ analysis, insights }: AIAnalysisProps) {
  return (
    <div className="space-y-4">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <span>💡</span> Key Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span> AI Analysis
        </h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}