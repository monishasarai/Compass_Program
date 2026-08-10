'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, FileText, CheckCircle2, Search, ExternalLink, Zap, DollarSign } from 'lucide-react';

export function ModelLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          LLM Model Factuality Benchmark Leaderboard
        </h3>
        <span className="text-[10px] text-amber-400 font-semibold uppercase">Cross-Model Benchmarking</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Model</th>
              <th className="py-2.5 px-3">Provider</th>
              <th className="py-2.5 px-3">Overall Accuracy</th>
              <th className="py-2.5 px-3">Faithfulness</th>
              <th className="py-2.5 px-3">Hallucination Rate</th>
              <th className="py-2.5 px-3">Latency</th>
              <th className="py-2.5 px-3">Cost / 1k Claims</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leaderboard.map((item) => (
              <tr key={item.model_name} className="hover:bg-slate-900/60 transition-colors">
                <td className="py-2.5 px-3 font-extrabold text-cyan-400">#{item.rank}</td>
                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                  <span>{item.model_name}</span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">{item.provider}</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">{item.overall_accuracy}%</td>
                <td className="py-2.5 px-3 text-slate-200">{item.faithfulness_score}</td>
                <td className="py-2.5 px-3 text-rose-400 font-semibold">{item.hallucination_rate}%</td>
                <td className="py-2.5 px-3 text-slate-400">{item.avg_latency_ms}ms</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300">${item.cost_per_1k_claims.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DocumentEvidenceExplorerProps {
  verdicts: any[];
}

export function DocumentEvidenceExplorer({ verdicts }: DocumentEvidenceExplorerProps) {
  const [selectedClaimIdx, setSelectedClaimIdx] = useState(0);

  if (!verdicts || verdicts.length === 0) return null;
  const currentVerdict = verdicts[selectedClaimIdx] || verdicts[0];
  const primaryEvidence = currentVerdict.evidence && currentVerdict.evidence[0];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Interactive Document Evidence Explorer
        </h3>
        <span className="text-[10px] text-cyan-400">Click Claim to Inspect Ground Truth Document Source</span>
      </div>

      {/* Claim Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {verdicts.map((v, i) => (
          <button
            key={v.claim_id}
            onClick={() => setSelectedClaimIdx(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedClaimIdx === i
                ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Claim #{i + 1} ({v.status})
          </button>
        ))}
      </div>

      {/* Supporting Document View Panel */}
      {primaryEvidence ? (
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Document Title: </span>
              <strong className="text-white font-bold">{primaryEvidence.doc_title}</strong>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-cyan-400 font-bold">{primaryEvidence.citation}</span>
              <span className="text-emerald-400">Similarity: {primaryEvidence.semantic_similarity}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400">Target Extracted Claim:</div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 text-xs font-semibold text-cyan-300">
              "{currentVerdict.claim_text}"
            </div>

            <div className="text-[11px] font-bold text-slate-400 mt-3">Matched Ground Truth Document Paragraph:</div>
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-xs text-slate-200 leading-relaxed font-sans">
              {primaryEvidence.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 text-xs text-slate-400 text-center">
          No direct vector chunk match found for this claim.
        </div>
      )}
    </div>
  );
}
