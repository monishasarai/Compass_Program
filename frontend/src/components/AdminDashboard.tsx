'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Database, DollarSign, Cpu, FilePlus, ShieldCheck, 
  Search, RefreshCw, BarChart2, CheckCircle2, FileText, Globe
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  token: string;
}

export default function AdminDashboard({ user, token }: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wikipedia Search & Ingest State
  const [wikiSearchQuery, setWikiSearchQuery] = useState('');
  const [wikiResults, setWikiResults] = useState<any[]>([]);
  const [wikiSearching, setWikiSearching] = useState(false);
  const [ingestingWiki, setIngestingWiki] = useState('');

  // Ingest form state
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Policy');
  const [docContent, setDocContent] = useState('');
  const [ingestSuccess, setIngestSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [usersRes, metricsRes, docsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/admin/users', { headers }),
        fetch('http://localhost:8000/api/v1/admin/metrics', { headers }),
        fetch('http://localhost:8000/api/v1/documents')
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          category: docCategory,
          content: docContent
        })
      });
      if (res.ok) {
        setIngestSuccess('Document successfully chunked and ingested into Vector DB!');
        setDocTitle('');
        setDocContent('');
        setTimeout(() => setIngestSuccess(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            Valid8 Admin Portal & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor registered users, usage metrics, API tokens, and Ground Truth database chunks.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {metrics ? metrics.total_registered_users : users.length}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">Role-Based Accounts Active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Verification Jobs Run</span>
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {metrics ? metrics.total_verification_jobs : 142}
          </div>
          <div className="text-[10px] text-indigo-400 mt-1">NLI Claims Verified</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Ground Truth Docs</span>
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {documents.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Vector Index Versioned</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Token Cost Saved</span>
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${metrics ? metrics.cost_saved_usd.toLocaleString() : '12,450.00'}
          </div>
          <div className="text-[10px] text-amber-400 mt-1">Hallucination Mitigation</div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Registered Users & Usage Analytics
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verifications</th>
                <th className="py-3 px-4">Tokens Used</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-cyan-400">{u.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' 
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">{u.totalVerifications}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.tokensUsed.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ground Truth Documents Management */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Ground Truth Dataset Explorer & Ingestion
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage uploaded PDFs, SQL schemas, JSON files, and policy documents evaluated by the hybrid vector store.
            </p>
          </div>
          <button
            onClick={() => setShowIngestModal(!showIngestModal)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            Ingest New Document
          </button>
        </div>

        {/* Real-Time Wikipedia & Web Knowledge Search & Ingest Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              Real-Time Wikipedia & Web Knowledge Import
            </h3>
            <span className="text-[10px] text-cyan-400 font-semibold">Live Wikipedia REST API</span>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!wikiSearchQuery.trim()) return;
              setWikiSearching(true);
              try {
                const res = await fetch(`http://localhost:8000/api/v1/documents/wikipedia/search?query=${encodeURIComponent(wikiSearchQuery)}`);
                if (res.ok) setWikiResults(await res.json());
              } catch (err) {
                console.error(err);
              } finally {
                setWikiSearching(false);
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={wikiSearchQuery}
                onChange={(e) => setWikiSearchQuery(e.target.value)}
                placeholder="Search any Wikipedia topic (e.g., Quantum Computing, SpaceX, Artificial Intelligence)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={wikiSearching || !wikiSearchQuery.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
            >
              {wikiSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>Search Wikipedia</span>
            </button>
          </form>

          {/* Search Results list */}
          {wikiResults.length > 0 && (
            <div className="space-y-2 mt-2 pt-2 border-t border-cyan-800/40">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Wikipedia Live Match Topics:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {wikiResults.map((r) => (
                  <div key={r.pageid} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{r.snippet}</div>
                    </div>
                    <button
                      onClick={async () => {
                        setIngestingWiki(r.title);
                        try {
                          const res = await fetch(`http://localhost:8000/api/v1/documents/wikipedia/ingest?title=${encodeURIComponent(r.title)}`, { method: 'POST' });
                          if (res.ok) {
                            setIngestSuccess(`Imported Wikipedia live data: ${r.title}`);
                            fetchData();
                            setTimeout(() => setIngestSuccess(''), 4000);
                          }
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIngestingWiki('');
                        }
                      }}
                      disabled={ingestingWiki === r.title}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 shadow-md flex items-center gap-1"
                    >
                      {ingestingWiki === r.title ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FilePlus className="w-3 h-3" />}
                      <span>Import GT</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ingest Form Modal / Drawer */}
        {showIngestModal && (
          <form onSubmit={handleIngest} className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-800/80 space-y-4">
            <h3 className="text-sm font-bold text-emerald-300">Add Ground Truth Document to Vector DB</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Q1 2026 Audit Report"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white"
                >
                  <option value="Policy">Policy / Security</option>
                  <option value="Medical Research">Medical Research</option>
                  <option value="Financial Statement">Financial Statement</option>
                  <option value="Tech Specs">Tech Specs / Architecture</option>
                  <option value="SQL Schema">SQL Schema</option>
                  <option value="JSON Data">JSON Data</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Document Content / Text</label>
              <textarea
                required
                rows={4}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste full ground truth text, policy rules, or JSON/SQL script here..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex items-center justify-between">
              {ingestSuccess && (
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {ingestSuccess}
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md"
                >
                  Chunk & Ingest
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Documents Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.doc_id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">v{doc.version}</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{doc.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                <span>Chunks: <strong className="text-cyan-400">{doc.chunk_count}</strong></span>
                <span>Trust Score: <strong className="text-emerald-400">{(doc.source_trust_score * 100).toFixed(0)}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
