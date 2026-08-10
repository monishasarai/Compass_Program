'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface AccuracyGaugeProps {
  score: number; // 0 - 100
}

export function AccuracyGauge({ score }: AccuracyGaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'stroke-cyan-400';
  if (score > 85) colorClass = 'stroke-emerald-400';
  else if (score > 65) colorClass = 'stroke-amber-400';
  else colorClass = 'stroke-rose-500';

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-3xl border border-slate-800 relative">
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-white tracking-tight">{score}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Factual Accuracy
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
          score > 85 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
        }`}>
          {score > 85 ? 'High Entailment ✓' : 'Hallucinations Flagged ⚠'}
        </span>
      </div>
    </div>
  );
}

interface HallucinationHeatmapProps {
  heatmap: any[];
}

export function HallucinationHeatmap({ heatmap }: HallucinationHeatmapProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Sentence Hallucination Heatmap
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Supported</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" /> Partial</span>
          <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500" /> Contradicted</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 space-y-3 leading-relaxed">
        {heatmap.map((item, idx) => {
          let bgClass = 'bg-emerald-950/40 text-emerald-200 border-emerald-800/60 hover:bg-emerald-900/60';
          let badge = '✅ Supported';
          
          if (item.status === 'Partially Supported') {
            bgClass = 'bg-amber-950/40 text-amber-200 border-amber-800/60 hover:bg-amber-900/60';
            badge = '⚠ Partial';
          } else if (item.status === 'Contradicted') {
            bgClass = 'bg-rose-950/40 text-rose-200 border-rose-800/60 hover:bg-rose-900/60';
            badge = '❌ Contradicted';
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all relative group cursor-pointer ${bgClass}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] opacity-75">Sentence #{idx + 1}</span>
                <span className="font-extrabold text-[10px] uppercase tracking-wider">{badge} ({item.score}%)</span>
              </div>
              <p className="font-medium text-slate-100">{item.sentence_text}</p>
              
              {/* Tooltip on Hover */}
              <div className="hidden group-hover:block absolute left-0 right-0 top-full mt-1 z-30 p-3 rounded-xl bg-dark-950 border border-cyan-500/50 shadow-2xl text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-cyan-400">Ground Truth Citation: {item.top_citation}</div>
                <div>{item.explanation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
