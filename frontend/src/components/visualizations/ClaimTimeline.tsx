'use client';

import React from 'react';
import { Layers, Grid, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

interface ClaimTimelineProps {
  verdicts: any[];
}

export function ClaimTimeline({ verdicts }: ClaimTimelineProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        Atomic Claim Verification Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {verdicts.map((v, idx) => {
          let dotColor = 'bg-emerald-500 shadow-emerald-500/50';
          let borderClass = 'border-emerald-800/60 bg-emerald-950/20';
          let badgeText = '✅ Supported';

          if (v.status === 'Partially Supported') {
            dotColor = 'bg-amber-500 shadow-amber-500/50';
            borderClass = 'border-amber-800/60 bg-amber-950/20';
            badgeText = '⚠ Partial';
          } else if (v.status === 'Contradicted') {
            dotColor = 'bg-rose-500 shadow-rose-500/50';
            borderClass = 'border-rose-800/60 bg-rose-950/20';
            badgeText = '❌ Contradicted';
          }

          return (
            <div key={v.claim_id} className="relative group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[1.65rem] top-1.5 w-3.5 h-3.5 rounded-full ${dotColor} shadow-md`} />

              <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${borderClass}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">{v.claim_id.toUpperCase()}</span>
                  <span className="font-extrabold text-[10px] uppercase tracking-wider">{badgeText} ({(v.confidence * 100).toFixed(0)}%)</span>
                </div>
                
                <p className="font-semibold text-white">{v.claim_text}</p>
                <p className="text-[11px] text-slate-400">{v.explanation}</p>

                {v.evidence && v.evidence.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Evidence: <strong>{v.evidence[0].doc_title}</strong></span>
                    <span className="text-cyan-400 font-mono">{v.evidence[0].citation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SemanticMatrixProps {
  matrix: any[];
}

export function SemanticMatrix({ matrix }: SemanticMatrixProps) {
  if (!matrix || matrix.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          Semantic Similarity Heatmap Matrix (GT vs Generated Answer)
        </h3>
        <span className="text-[10px] text-slate-400">Cosine & Embedding Distance Grid</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 gap-1.5 min-w-[500px]">
          <div className="p-2 text-[10px] font-bold text-slate-400">Sent \ Chunk</div>
          {matrix.slice(0, 5).map((cell, i) => (
            <div key={i} className="p-2 text-[9px] font-mono text-slate-400 truncate" title={cell.gt_chunk_title}>
              Chunk #{i + 1}
            </div>
          ))}

          {[0, 1, 2, 3].map((sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="p-2 text-[10px] font-bold text-cyan-300 font-mono">
                Sentence #{sIdx + 1}
              </div>
              {matrix.filter(m => m.ans_sentence_idx === sIdx).slice(0, 5).map((cell, cIdx) => {
                const sim = cell.similarity;
                let bg = 'bg-slate-900 text-slate-400';
                if (sim > 0.7) bg = 'bg-cyan-600 text-white font-bold';
                else if (sim > 0.4) bg = 'bg-cyan-950 text-cyan-300 border border-cyan-800';

                return (
                  <div
                    key={cIdx}
                    className={`p-3 rounded-xl text-center text-xs flex flex-col items-center justify-center transition-all ${bg}`}
                    title={`Similarity: ${sim}`}
                  >
                    <span>{sim}</span>
                    <span className="text-[8px] opacity-70">sim</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
