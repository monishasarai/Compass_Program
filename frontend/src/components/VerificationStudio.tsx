'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, BarChart3, Layers, Award, GitPullRequest, Trophy, Info } from 'lucide-react';

import { AccuracyGauge, HallucinationHeatmap } from './visualizations/AccuracyGauge';
import { ClaimTimeline, SemanticMatrix } from './visualizations/ClaimTimeline';
import { RadarMetrics, ConfidenceMeter } from './visualizations/RadarMetrics';
import { MissingKnowledgeGraph, ClaimNetworkGraph } from './visualizations/MissingKnowledgeGraph';
import { TokenDiffViewer, SideBySideComparison } from './visualizations/TokenDiffViewer';
import { ModelLeaderboard, DocumentEvidenceExplorer } from './visualizations/ModelLeaderboard';

interface VerificationStudioProps {
  report: any;
  onClose: () => void;
}

export default function VerificationStudio({ report, onClose }: VerificationStudioProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'accuracy' | 'claims' | 'hallucinations' | 'diff' | 'leaderboard'>('all');

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-7xl max-h-[92vh] rounded-3xl border border-cyan-500/40 flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-dark-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Valid8 Deep Factuality & Visual Analytics</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {report.selected_model}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Query: "{report.query}" | Evaluation Time: {report.execution_time_ms}ms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2 overflow-x-auto text-xs font-semibold shrink-0">
          {[
            { id: 'all', label: '12-Chart Dashboard', icon: BarChart3 },
            { id: 'accuracy', label: '1. Accuracy & Metrics', icon: Award },
            { id: 'claims', label: '2. Claims & Evidence', icon: Layers },
            { id: 'hallucinations', label: '3. Hallucinations & Gaps', icon: Info },
            { id: 'diff', label: '4. Token Diffs & Auto-Fix', icon: GitPullRequest },
            { id: 'leaderboard', label: '5. Model Benchmarks', icon: Trophy },
          ].map(tab => {
            const IconC = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-black font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconC className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {(activeTab === 'all' || activeTab === 'accuracy') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Viz 1: Overall Accuracy Gauge */}
              <AccuracyGauge score={report.overall_confidence_score} />
              
              {/* Viz 5: Radar Chart */}
              <RadarMetrics metrics={report.radar_metrics} />

              {/* Viz 6: Confidence Meter & Metrics */}
              <ConfidenceMeter score={report.overall_confidence_score} report={report} />
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'hallucinations') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Viz 2: Hallucination Heatmap */}
              <HallucinationHeatmap heatmap={report.hallucination_heatmap} />

              {/* Viz 7: Missing Knowledge Graph */}
              <MissingKnowledgeGraph missingItems={report.missing_knowledge} />
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'claims') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Viz 3: Claim Verification Timeline */}
              <ClaimTimeline verdicts={report.claim_verdicts} />

              {/* Viz 8: Claim Network Graph */}
              <ClaimNetworkGraph claims={report.extracted_claims} verdicts={report.claim_verdicts} />
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'claims') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Viz 4: Semantic Similarity Matrix */}
              <SemanticMatrix matrix={report.semantic_similarity_matrix} />

              {/* Viz 12: Document Evidence Explorer */}
              <DocumentEvidenceExplorer verdicts={report.claim_verdicts} />
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'diff') && (
            <div className="space-y-6">
              {/* Viz 9: Token Level Diff Viewer */}
              <TokenDiffViewer tokenDiffs={report.token_diffs} />

              {/* Viz 10: Side-by-Side Comparison */}
              <SideBySideComparison report={report} />
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'leaderboard') && (
            /* Viz 11: Model Leaderboard */
            <ModelLeaderboard />
          )}

        </div>

      </div>
    </div>
  );
}
