'use client';

import React, { useState } from 'react';
import { Network, AlertCircle, FileSearch, CheckCircle2, Shield } from 'lucide-react';

interface MissingKnowledgeGraphProps {
  missingItems: any[];
}

export function MissingKnowledgeGraph({ missingItems }: MissingKnowledgeGraphProps) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-amber-400" />
          Missing Knowledge & Omitted Concept Graph
        </h3>
        <span className="text-[10px] text-amber-400 font-semibold uppercase">Coverage Gap Analysis</span>
      </div>

      <div className="space-y-3">
        {missingItems.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.concept}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-900 text-amber-200">
                  {item.impact} Impact
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Type: {item.type} | Reference: <strong className="text-cyan-400 font-mono">{item.gt_reference}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClaimNetworkGraphProps {
  claims: any[];
  verdicts: any[];
}

export function ClaimNetworkGraph({ claims, verdicts }: ClaimNetworkGraphProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          Interactive Claim & Evidence Network Graph
        </h3>
        <span className="text-[10px] text-slate-400">Click Nodes to Inspect Relationships</span>
      </div>

      {/* Interactive Node Graph Container */}
      <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 relative min-h-[300px] flex items-center justify-center overflow-hidden">
        
        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800 stroke-[1.5]">
          <line x1="20%" y1="30%" x2="50%" y2="50%" strokeDasharray="4 4" />
          <line x1="80%" y1="30%" x2="50%" y2="50%" strokeDasharray="4 4" />
          <line x1="30%" y1="80%" x2="50%" y2="50%" strokeDasharray="4 4" />
          <line x1="70%" y1="80%" x2="50%" y2="50%" strokeDasharray="4 4" />
        </svg>

        {/* Nodes */}
        <div className="relative w-full h-full min-h-[260px] flex items-center justify-around flex-wrap gap-6 z-10">
          
          {/* Central Ground Truth Node */}
          <div
            onClick={() => setSelectedNode({ type: 'Ground Truth Corpus', title: 'Enterprise Vector DB Index', details: 'Contains 4 ingested ground truth documents with 100% trust rating.' })}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950 to-blue-950 border-2 border-cyan-500 shadow-xl shadow-cyan-500/20 cursor-pointer hover:scale-105 transition-all text-center"
          >
            <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">Ground Truth Vector DB</div>
            <div className="text-[9px] text-cyan-300 font-mono mt-0.5">Chroma Index</div>
          </div>

          {/* Claim Nodes */}
          {claims.slice(0, 3).map((c, i) => {
            const verdict = verdicts[i];
            let border = 'border-emerald-500 text-emerald-300 bg-emerald-950/80';
            if (verdict?.status === 'Contradicted') border = 'border-rose-500 text-rose-300 bg-rose-950/80';

            return (
              <div
                key={c.claim_id}
                onClick={() => setSelectedNode({ type: 'Extracted Claim', title: c.text, details: verdict?.explanation || 'Verified claim statement.' })}
                className={`p-3 rounded-2xl border-2 cursor-pointer hover:scale-105 transition-all text-center max-w-[160px] ${border}`}
              >
                <div className="text-[10px] font-mono font-bold uppercase mb-1">{c.claim_id}</div>
                <div className="text-[11px] font-semibold text-white line-clamp-2">{c.text}</div>
                <div className="text-[9px] mt-1 font-bold">{verdict?.status || 'Verified'}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Popup */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-dark-950 border border-cyan-500/80 text-xs text-slate-200 flex items-center justify-between shadow-2xl">
            <div>
              <span className="font-bold text-cyan-400">{selectedNode.type}: </span>
              <span>{selectedNode.title}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedNode.details}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
