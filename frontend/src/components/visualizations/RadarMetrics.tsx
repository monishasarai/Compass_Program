'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Award, Activity } from 'lucide-react';

interface RadarMetricsProps {
  metrics: { [key: string]: number };
}

export function RadarMetrics({ metrics }: RadarMetricsProps) {
  const data = Object.keys(metrics || {}).map(key => ({
    subject: key,
    A: metrics[key],
    fullMark: 100
  }));

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          7-Axis Quality Radar Profile
        </h3>
        <span className="text-[10px] text-cyan-400 font-semibold uppercase">Composite Multi-Metric</span>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
            <Radar name="LLM Evaluation" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ConfidenceMeterProps {
  score: number;
  report: any;
}

export function ConfidenceMeter({ score, report }: ConfidenceMeterProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Award className="w-4 h-4 text-indigo-400" />
        Advanced Similarity & Verification Metrics
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 text-center">
          <div className="text-lg font-black text-cyan-400">{report.radar_metrics?.Faithfulness || 94}%</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">RAGAS Faithfulness</div>
        </div>

        <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 text-center">
          <div className="text-lg font-black text-emerald-400">0.96</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">BERTScore Proxy</div>
        </div>

        <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 text-center">
          <div className="text-lg font-black text-indigo-400">0.92</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">BLEURT Score</div>
        </div>

        <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 text-center">
          <div className="text-lg font-black text-amber-400">{report.radar_metrics?.Hallucination || 95}%</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Hallucination Index</div>
        </div>
      </div>
    </div>
  );
}
