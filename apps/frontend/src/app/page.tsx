'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAppStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [healthStatus, setHealthStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [activeTab, setActiveTab] = useState<'analyzer' | 'explainer' | 'kanban' | 'analytics'>('analyzer');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
        const response = await axios.get(`${cleanApiUrl}/health`);
        setHealthStatus(response.data.status === 'ok' ? 'ok' : 'error');
      } catch (error) {
        setHealthStatus('error');
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock Data for Platform Preview
  const mockRepoData = {
    name: 'v8-engine/optimization-pipeline',
    healthScore: 94,
    techStack: ['C++', 'JavaScript', 'WebAssembly'],
    insights: 'Memory leaks resolved in JIT compilation path.',
  };

  const mockCodeSnippet = `// Bug in event dispatcher
function dispatch(event, listeners) {
  for (let i = 0; i < listeners.length; i++) {
    // BUG: Modifying array during iteration causes skip
    listeners[i].handler(event);
  }
}`;

  const mockExplanation = 'Modifying the listeners array during dispatch can cause handlers to be skipped. Solution: Slice the list first (`[...listeners]`) to create a stable copy before iterating.';

  return (
    <div className="min-h-screen bg-[#070514] text-gray-100 overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute top-[400px] left-[35%] w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[130px]" />
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute top-0 left-0 w-full h-[1200px] opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070514]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold text-white">⚡</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              DevPlatform
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">
              Features
            </button>
            <button onClick={() => scrollToSection('dashboard-preview')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">
              Platform Demo
            </button>
            <a href="#docs" className="hover:text-white transition-colors">Docs</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition-transform hover:scale-105 active:scale-95 animate-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl" />
              <span className="relative block px-5 py-2.5 bg-[#070514] hover:bg-[#0c0822] rounded-[11px] text-white transition-colors duration-200">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Status & Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 mb-8 backdrop-blur-sm shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next-Gen AI Development Suite
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
              The AI-Powered OS for{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Modern Developers
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
              DevPlatform brings repository analytics, real-time Kanban collaboration, and AI code intelligence together. Accelerate shipping speeds and streamline workflows instantly.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 text-center"
              >
                Start for Free
              </Link>
              <button
                onClick={() => scrollToSection('dashboard-preview')}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-white/20 font-semibold rounded-xl transition-all text-center cursor-pointer"
              >
                View Live Demo
              </button>
            </div>

            {/* Health Status Indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500 border border-white/5 bg-white/[0.02] px-4 py-2 rounded-full mb-20">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  healthStatus === 'ok'
                    ? 'bg-emerald-400 shadow-md shadow-emerald-400/30'
                    : healthStatus === 'error'
                    ? 'bg-rose-400 shadow-md shadow-rose-400/30'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>
                System Status:{' '}
                <strong className="text-gray-400 font-medium">
                  {healthStatus === 'ok' ? 'Online' : healthStatus === 'error' ? 'Degraded (Backend Disconnected)' : 'Connecting...'}
                </strong>
              </span>
            </div>
          </motion.div>

          {/* Interactive Mock Dashboard */}
          <motion.div
            id="dashboard-preview"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto bg-[#0a071d]/80 rounded-2xl border border-white/10 shadow-2xl shadow-indigo-900/30 overflow-hidden relative"
          >
            {/* Window Topbar */}
            <div className="bg-[#0b0a1d] px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs text-gray-500 font-mono bg-[#110f27] px-4 py-1.5 rounded-md border border-white/5 select-none w-1/3 truncate text-center">
                devplatform.io/dashboard
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] text-indigo-400 font-mono">Workspace v1.0</span>
              </div>
            </div>

            {/* Dashboard Inner Layout */}
            <div className="flex min-h-[480px] flex-col md:flex-row bg-[#080518]/90">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-56 bg-[#09071c] border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto select-none">
                <button
                  onClick={() => setActiveTab('analyzer')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer border-none bg-transparent ${
                    activeTab === 'analyzer'
                      ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 shadow-sm'
                      : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
                  }`}
                >
                  <span className="text-sm">🔍</span> Repo Analyzer
                </button>
                <button
                  onClick={() => setActiveTab('explainer')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer border-none bg-transparent ${
                    activeTab === 'explainer'
                      ? 'bg-purple-500/10 text-purple-300 border-l-2 border-purple-500 shadow-sm'
                      : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
                  }`}
                >
                  <span className="text-sm">🤖</span> Code Explainer
                </button>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer border-none bg-transparent ${
                    activeTab === 'kanban'
                      ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500 shadow-sm'
                      : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
                  }`}
                >
                  <span className="text-sm">📋</span> Kanban Board
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer border-none bg-transparent ${
                    activeTab === 'analytics'
                      ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-500 shadow-sm'
                      : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
                  }`}
                >
                  <span className="text-sm">📊</span> Analytics
                </button>
              </div>

              {/* Main Preview Container */}
              <div className="flex-1 p-6 relative overflow-hidden bg-[#080516]">
                {/* Repo Analyzer Preview */}
                {activeTab === 'analyzer' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                      <div>
                        <h4 className="font-semibold text-white text-base flex items-center gap-2">
                          <span>📁</span> {mockRepoData.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Status: Fully Analyzed • Updated 3 mins ago</p>
                      </div>
                      <div className="flex items-center gap-3 bg-[#110f27] px-4 py-2 rounded-xl border border-indigo-500/20">
                        <span className="text-xs text-indigo-300 font-medium">Health Score</span>
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[11px] font-bold text-white bg-indigo-500/20">
                          {mockRepoData.healthScore}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0f0c25] p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tech Stack</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mockRepoData.techStack.map((tech) => (
                            <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-[#161332] text-indigo-300 border border-white/5 font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#0f0c25] p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">AI Insights & Warnings</span>
                        <p className="text-xs text-purple-300 mt-2 flex items-start gap-2">
                          <span className="text-sm">⚠️</span> {mockRepoData.insights}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0f0c25] p-4 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Branch Metrics</span>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-gray-400">Open Pull Requests</span>
                        <span className="font-mono text-white">4 Active</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1">
                        <span className="text-gray-400">Security Vulnerabilities</span>
                        <span className="font-mono text-emerald-400">0 critical</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Code Explainer Preview */}
                {activeTab === 'explainer' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="font-semibold text-white text-sm">Bug Explainer & Fixer</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Claude AI Engine</span>
                    </div>

                    <div className="bg-[#0b081e] p-3 rounded-lg border border-white/5 font-mono text-[11px] text-gray-300 leading-relaxed overflow-x-auto max-h-[160px]">
                      <pre>{mockCodeSnippet}</pre>
                    </div>

                    <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-500/20 flex gap-3">
                      <span className="text-xl">🤖</span>
                      <div>
                        <span className="text-xs font-bold text-purple-300 block mb-1">AI Explanation:</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{mockExplanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Kanban Board Preview */}
                {activeTab === 'kanban' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Todo Column */}
                    <div className="space-y-2 bg-[#0a0820] p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-semibold text-gray-400">Todo</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">3</span>
                      </div>
                      <div className="bg-[#120f2e] p-3 rounded-lg border border-white/5 space-y-2">
                        <h5 className="text-xs font-medium text-white">Document API endpoints</h5>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">Docs</span>
                          <span className="text-[9px] text-gray-500">Jun 15</span>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="space-y-2 bg-[#0a0820] p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-semibold text-emerald-400">In Progress</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">1</span>
                      </div>
                      <div className="bg-[#120f2e] p-3 rounded-lg border border-emerald-500/20 shadow-md shadow-emerald-500/5 space-y-2">
                        <h5 className="text-xs font-medium text-white">Optimize database indices</h5>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">Backend</span>
                          <div className="flex -space-x-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-500 text-[8px] font-bold flex items-center justify-center text-white border border-white/10">JD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Analytics Preview */}
                {activeTab === 'analytics' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productivity Analytics</h4>
                        <span className="text-xl font-bold text-white mt-1 block">+24.8% Week over Week</span>
                      </div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">Active</span>
                    </div>

                    {/* Chart Mockup */}
                    <div className="h-32 flex items-end justify-between gap-2.5 pt-6 px-4 border-b border-white/5">
                      {[40, 55, 30, 80, 60, 95, 75, 85, 65, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <div 
                            className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-amber-500 transition-all duration-300 group-hover:from-indigo-400 group-hover:to-amber-400"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[9px] text-gray-600 font-mono mt-1 select-none">M{i+1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-[#0f0c25] p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-500 block">Weekly Commit Rate</span>
                        <strong className="text-sm font-semibold text-white mt-1 block">42 commits/dev</strong>
                      </div>
                      <div className="bg-[#0f0c25] p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-500 block">AI Suggestion Adoption</span>
                        <strong className="text-sm font-semibold text-white mt-1 block">82.4%</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Cards Grid Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 mt-40">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Designed for Speed. Engineered for Precision.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Explore DevPlatform's core tools built to remove friction from your engineering lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1: Repo Analyzer */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#0a081d]/50 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[80px] blur-[30px] group-hover:bg-indigo-500/20 transition-all" />
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-6 select-none">
                🔍
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Repository Health Analyzer
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 font-medium">Automatic</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                Connect your GitHub repositories to automatically assess build complexity, library dependencies, tech stack configurations, and security health scores.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> Automated security scanning
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> High-fidelity technical stack logs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> Code quality grade and warning indexes
                </li>
              </ul>
            </motion.div>

            {/* Feature Card 2: AI Explainer */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#0a081d]/50 border border-white/5 hover:border-purple-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-[80px] blur-[30px] group-hover:bg-purple-500/20 transition-all" />
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-6 select-none">
                🤖
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                AI Code Explainer & Fixer
                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">Core AI</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                Instantly debug errors, decipher complex legacy systems, and refactor slow algorithms. Paste in code segments and get immediate code context explanations.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span> Explanations for over 45 languages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span> One-click auto-fixing for common code bugs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span> Time complexity and memory usage analysis
                </li>
              </ul>
            </motion.div>

            {/* Feature Card 3: Kanban Board */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#0a081d]/50 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[80px] blur-[30px] group-hover:bg-emerald-500/20 transition-all" />
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-6 select-none">
                📋
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Real-Time Kanban Board
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">Collaborative</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                Keep the team focused. Assign tasks, track issue updates, set priority labels, and coordinate project progress with live socket updates.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Live-synchronized task boards
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Drag-and-drop workflow status controls
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Assign multiple team members to single cards
                </li>
              </ul>
            </motion.div>

            {/* Feature Card 4: Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#0a081d]/50 border border-white/5 hover:border-amber-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-[80px] blur-[30px] group-hover:bg-amber-500/20 transition-all" />
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-6 select-none">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Deep Productivity Analytics
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">Metrics</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                Track commit rates, PR cycle speed, and code suggestion adoptions. Measure metrics that directly influence development speed and quality.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✓</span> Visual productivity charts and trends
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✓</span> Daily/weekly workload summaries
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✓</span> Integration with major repository providers
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-4xl mx-auto px-6 mt-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-slate-900/10 border border-indigo-500/20 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to ship faster?
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Join thousands of developers using DevPlatform's AI suite to streamline code, track sprint progress, and optimize repo analytics.
            </p>
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 inline-block"
            >
              Get Started Instantly
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050410] py-16 text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">⚡</span>
              </div>
              <span className="font-bold text-sm text-white">DevPlatform</span>
            </div>
            <p className="leading-relaxed max-w-[200px] font-normal">
              Supercharging developer workflow with integrated productivity analytics and AI intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-none">Features</button></li>
              <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-[10px]">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors">Developer Blog</a></li>
              <li><a href="#status" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} DevPlatform Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#twitter" className="hover:text-white transition-colors">Twitter</a>
            <a href="#github" className="hover:text-white transition-colors">GitHub</a>
            <a href="#discord" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}