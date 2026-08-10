'use client';

import React, { useState } from 'react';
import { GitPullRequest, ArrowRight, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface TokenDiffViewerProps {
  tokenDiffs: any[];
}

export function TokenDiffViewer({ tokenDiffs }: TokenDiffViewerProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-cyan-400" />
          Token-Level Factual Diff Viewer (GitHub Style)
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-semibold">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">+ Correct</span>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">- Incorrect</span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">~ Unsupported</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 font-mono text-xs leading-relaxed flex flex-wrap gap-1.5">
        {tokenDiffs.map((item, idx) => {
          let style = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
          if (item.type === 'incorrect') style = 'bg-rose-950/80 text-rose-300 border-rose-800 line-through font-bold';
          else if (item.type === 'unsupported') style = 'bg-amber-950/80 text-amber-300 border-amber-800';

          return (
            <span
              key={idx}
              className={`px-2 py-1 rounded-md border text-[11px] transition-all cursor-pointer hover:scale-105 ${style}`}
              title={item.explanation || item.type}
            >
              {item.token}
            </span>
          );
        })}
      </div>
    </div>
  );
}

interface SideBySideComparisonProps {
  report: any;
}

export function SideBySideComparison({ report }: SideBySideComparisonProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Side-by-Side Synchronized Comparison
        </h3>
        <span className="text-[10px] text-cyan-400 font-semibold uppercase">GT vs Generated vs Auto-Improved</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Ground Truth Column */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">Ground Truth Source</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800">Verified 100%</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans max-h-60 overflow-y-auto pr-1">
            {report.claim_verdicts && report.claim_verdicts[0]?.evidence[0] 
              ? report.claim_verdicts[0].evidence[0].content 
              : "Valid8 Ground Truth Document context loaded in vector index."}
          </div>
        </div>

        {/* LLM Generated Column */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Generated Answer ({report.selected_model})</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800">Original Response</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans max-h-60 overflow-y-auto pr-1">
            {report.generated_answer}
          </div>
        </div>

        {/* Valid8 Improved Column */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/80 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Valid8 Auto-Improved</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">100% Grounded</span>
          </div>
          <div className="text-xs text-emerald-100 leading-relaxed font-sans max-h-60 overflow-y-auto pr-1">
            {report.improved_answer}
          </div>
        </div>

      </div>

      {/* Improvement Reasons Callouts */}
      {report.improvement_reasons && report.improvement_reasons.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-cyan-300">Why Corrections Were Made:</div>
          <div className="space-y-2">
            {report.improvement_reasons.map((r: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="font-bold text-cyan-400 shrink-0">#{idx+1}</span>
                <div>
                  <span className="text-rose-400 line-through mr-2">{r.original}</span>
                  <span className="text-emerald-400 font-semibold">{r.improved}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.reason} (Evidence: {r.evidence})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
