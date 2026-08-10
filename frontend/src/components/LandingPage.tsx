'use client';

import React from 'react';
import { 
  ShieldCheck, Cpu, GitPullRequest, Search, CheckCircle2, AlertTriangle, 
  BarChart3, Activity, ArrowRight, Layers, FileText, Lock, Network, Sparkles, Database, Brain
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const phases = [
    { num: 'Phase 1', title: 'Query & LLM Layer', desc: 'Unified abstraction for GPT-4o, Claude 3.5, Gemini 1.5, DeepSeek, and Llama.', icon: Cpu },
    { num: 'Phase 2', title: 'Atomic Claim Extraction', desc: 'Decomposes generated text into atomic statements with NER (Entities, Dates, Numbers, Orgs).', icon: Layers },
    { num: 'Phase 3', title: 'Hybrid Evidence Retrieval', desc: 'Vector similarity + BM25 keyword matching + Metadata filtering over Ground Truth.', icon: Search },
    { num: 'Phase 4', title: 'Cross-Encoder Ranking', desc: 'Scores candidate evidence using semantic cross-encoders and document trust scores.', icon: Activity },
    { num: 'Phase 5', title: 'NLI Fact Verification', desc: 'Classifies claims as Supported ✅, Contradicted ❌, Partial ⚠, or Unknown ❓.', icon: CheckCircle2 },
    { num: 'Phase 6', title: 'Advanced Similarity Metrics', desc: 'Combines BERTScore, BLEURT, RAGAS Faithfulness, F1, and 0-100 Confidence Index.', icon: BarChart3 },
    { num: 'Phase 7', title: 'Hallucination Engine', desc: 'Pinpoints made-up numbers, fake organizations, invented citations, and hidden contradictions.', icon: AlertTriangle },
    { num: 'Phase 8', title: 'Missing Info Graph', desc: 'Identifies critical facts present in Ground Truth but missing from the answer.', icon: Network },
    { num: 'Phase 9', title: 'Answer Improvement', desc: 'Auto-generates 100% ground-truth verified replacement text with point-by-point explanations.', icon: Sparkles }
  ];

  const marketScopes = [
    { title: 'FinTech & Earnings Audit', desc: 'Verify AI financial reports, quarterly revenue claims, and SEC filings against audited spreadsheets and ground truth ledgers.', color: 'from-blue-500 to-cyan-400' },
    { title: 'Medical & Pharma Research', desc: 'Prevent AI hallucinations in clinical trial outcomes, drug dosages, and FDA regulatory compliance documents.', color: 'from-emerald-500 to-teal-400' },
    { title: 'LegalTech & Contract Risk', desc: 'Cross-examine LLM contract summaries against original statutory policy files, clause retention periods, and SLAs.', color: 'from-purple-500 to-indigo-400' },
    { title: 'Enterprise RAG Assurance', desc: 'Replace unverified chatbots with a continuous auditing layer that measures accuracy, coverage, and citation quality.', color: 'from-amber-500 to-rose-400' }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-float" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-semibold mb-8 shadow-inner hover:scale-105 transition-transform cursor-default">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
          <span>Next-Generation AI Fact Checking & Hallucination Elimination Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
          Don't Just Trust LLMs. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Verify Every Claim with Valid8.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          The enterprise verification engine that evaluates LLM generated answers against a trusted Ground Truth dataset — providing claim-level NLI verification, 12 visual analytics charts, and auto-improved responses.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <span>Launch Valid8 Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Live Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Evaluation Precision', val: '99.4%', sub: 'NLI Entailment' },
            { label: 'Hallucination Reduction', val: '98.2%', sub: 'Point-by-Point' },
            { label: 'Supported Models', val: '8+', sub: 'GPT, Claude, Gemini, DeepSeek' },
            { label: 'Visual Analytics', val: '12 Charts', sub: 'Radar, Heatmaps & Graphs' },
          ].map((m, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-800 text-center hover:border-cyan-500/40 transition-colors">
              <div className="text-2xl font-black text-white">{m.val}</div>
              <div className="text-xs font-semibold text-cyan-400 mt-0.5">{m.label}</div>
              <div className="text-[10px] text-slate-400">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive 9-Phase Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            The 9-Phase Verification Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            How Valid8 rigorously analyzes every LLM response against trusted Ground Truth documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div 
                key={idx}
                className="glass-panel card-hover-effect p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm">
                    {p.num}
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors shadow-md">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Business Scope & Market Purpose */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Business Scope & Enterprise Market Purpose
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Valid8 enables enterprise teams to safely deploy LLMs in mission-critical environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketScopes.map((scope, idx) => (
            <div 
              key={idx}
              className="glass-panel card-hover-effect p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition-all"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${scope.color} absolute top-0 left-0`} />
              <h3 className="text-xl font-bold text-white mb-2 mt-2">
                {scope.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scope.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ground Truth Multi-Format Support */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel-glow p-8 rounded-3xl text-center relative overflow-hidden">
          <h3 className="text-2xl font-bold text-white mb-4">
            Supports Any Ground Truth Format
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto mb-8">
            Ingest PDFs, Word Documents, SQL Tables, JSON Data, CSV Spreadsheets, Compliance Policies, and Knowledge Base Text files into our hybrid vector index with versioning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {['PDF Documents', 'SQL Schemas & Tables', 'JSON Payloads', 'CSV Spreadsheets', 'Enterprise Policies', 'KB Text Files'].map((tag, i) => (
              <span key={i} className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-cyan-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
