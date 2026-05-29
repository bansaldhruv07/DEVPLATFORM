'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { repoAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java',
  'c++', 'go', 'rust', 'php', 'ruby', 'swift',
];

export default function CodeExplainerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'explain' | 'debug'>('explain');
  const [errorMsg, setErrorMsg] = useState('');

const handleSubmit = async () => {
  if (!code.trim()) {
    setError('Please enter some code');
    return;
  }

  if (mode === 'debug' && !errorMsg.trim()) {
    setError('Please enter the error message');
    return;
  }

  setError('');
  setIsLoading(true);
  setExplanation('');

  try {
    if (mode === 'debug') {
      // Debug is synchronous
      const response = await repoAPI.debugCode(code, errorMsg, language);
      setExplanation(response.data.data.solution);
      setIsLoading(false);
    } else {
      // Code explanation is async — poll for result
      const response = await repoAPI.explainCode(code, language);
      const { jobId } = response.data.data;

      // Poll every 2 seconds until complete
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await repoAPI.getJobStatus(jobId);
          const { status, result, error: jobError } = statusResponse.data.data;

          if (status === 'completed') {
            clearInterval(pollInterval);
            setExplanation(result || '');
            setIsLoading(false);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setError(jobError || 'AI processing failed');
            setIsLoading(false);
          }
          // status === 'pending' or 'processing' — keep polling
        } catch {
          clearInterval(pollInterval);
          setError('Failed to check job status');
          setIsLoading(false);
        }
      }, 2000);

      // Safety timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isLoading) {
          setError('Request timed out. Please try again.');
          setIsLoading(false);
        }
      }, 60000);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Request failed');
    setIsLoading(false);
  }
};

  const exampleCode = `function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">AI Code Assistant</h1>
          <p className="text-gray-600 mt-1">
            Explain or debug your code with Gemini AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Mode Toggle */}
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex">
              {(['explain', 'debug'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError('');
                    setExplanation('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {m === 'explain' ? '🔍 Explain Code' : '🐛 Debug Code'}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400 font-mono">
                  {language}
                </span>
                <button
                  onClick={() => setCode(exampleCode)}
                  className="ml-auto text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Load example
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                className="w-full h-56 p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
                placeholder={`// Paste your ${language} code here...`}
                spellCheck={false}
              />
            </div>

            {/* Error Input (Debug Mode) */}
            {mode === 'debug' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-xl p-4 shadow-sm border border-red-100"
              >
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Error Message
                </label>
                <textarea
                  value={errorMsg}
                  onChange={(e) => {
                    setErrorMsg(e.target.value);
                    setError('');
                  }}
                  className="w-full h-20 px-3 py-2 border border-red-200 rounded-lg text-sm font-mono text-red-600 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Paste your error message here..."
                />
              </motion.div>
            )}

            {/* Error display */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {mode === 'explain' ? 'Explaining...' : 'Debugging...'}
                </>
              ) : (
                <>
                  {mode === 'explain' ? '🔍 Explain This Code' : '🐛 Debug This Code'}
                </>
              )}
            </button>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {mode === 'explain' ? '🤖 AI Explanation' : '🔧 Debug Solution'}
              </h3>
            </div>

            <div className="p-6 h-[calc(100%-60px)] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    />
                  ))}
                  <p className="text-sm text-gray-400 pt-2">
                    Gemini is thinking...
                  </p>
                </div>
              ) : explanation ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                  <span className="text-5xl mb-3">
                    {mode === 'explain' ? '🔍' : '🐛'}
                  </span>
                  <p className="font-medium text-gray-600">
                    {mode === 'explain'
                      ? 'Paste your code and click Explain'
                      : 'Paste your code and error message'}
                  </p>
                  <p className="text-sm mt-1">
                    Powered by Gemini 1.5 Flash
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}