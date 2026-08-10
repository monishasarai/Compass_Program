'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, ShieldCheck, BarChart3, AlertCircle, 
  CheckCircle2, AlertTriangle, ArrowUpRight, Cpu, Key, FileText, 
  MessageSquare, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  model?: string;
  verificationReport?: any;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  user: any;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  onOpenReport: (report: any) => void;
}

export default function ChatInterface({
  user,
  selectedModel,
  setSelectedModel,
  onOpenReport
}: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  const [query, setQuery] = useState('');
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default initial session template
  const createDefaultSession = (): ChatSession => ({
    id: `session-${Date.now()}`,
    title: 'New Verification Thread',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: `Welcome to **Valid8 Studio**, ${user ? user.name : 'Researcher'}! Select any model from the header and ask a question. Every generated response is evaluated against the Ground Truth database with multi-turn chat memory and 12-chart visual factuality analytics!`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  });

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('valid8_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const def = createDefaultSession();
    setSessions([def]);
    setActiveSessionId(def.id);
  }, []);

  // Save sessions to localStorage when updated
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('valid8_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Active Session Object
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession ? activeSession.messages : [];

  const handleNewChat = () => {
    const newSess = createDefaultSession();
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      const def = createDefaultSession();
      setSessions([def]);
      setActiveSessionId(def.id);
      return;
    }
    const updated = sessions.filter(s => s.id !== idToDelete);
    setSessions(updated);
    if (activeSessionId === idToDelete) {
      setActiveSessionId(updated[0].id);
    }
  };

  const samplePrompts = [
    {
      title: "Security & Retention Audit",
      prompt: "What is the Valid8 Enterprise Security Policy regarding data encryption standards, audit log retention period, and Critical Severity 1 incident containment SLA?"
    },
    {
      title: "BioGen Clinical Trial Study",
      prompt: "Summarize the primary endpoint results, sample size, and ARIA-E safety profile of the BioGen NeuroVax-3 Phase III clinical trial."
    },
    {
      title: "Financial Earnings & Revenue",
      prompt: "What was Global Tech Corp Q4 2025 consolidated revenue, segment growth for Cloud & AI, and approved share repurchase allocation?"
    },
    {
      title: "Quantum Computing Specs",
      prompt: "What are the single-qubit and two-qubit gate fidelities, qubit count, and error correction codes for the SuperQ-1000 quantum processor?"
    }
  ];

  const handleSend = async (textToSend?: string) => {
    const qText = textToSend || query;
    if (!qText.trim() || loading || !activeSession) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Auto-update thread title on first real user message
    let newTitle = activeSession.title;
    if (activeSession.messages.length <= 1) {
      newTitle = qText.length > 28 ? qText.substring(0, 28) + '...' : qText;
    }

    const updatedMessages = [...activeSession.messages, userMsg];

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      title: newTitle,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: updatedMessages
    } : s));

    if (!textToSend) setQuery('');
    setLoading(true);

    // Build chat history context payload
    const historyPayload = updatedMessages.slice(1).map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.text
    }));

    try {
      const res = await fetch('http://localhost:8000/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: qText,
          model: selectedModel,
          api_key_override: apiKeyOverride || undefined,
          chat_history: historyPayload
        })
      });

      if (!res.ok) throw new Error('Verification request failed');
      const report = await res.json();

      const aiMsg: Message = {
        id: report.verification_id,
        sender: 'ai',
        text: report.generated_answer,
        model: selectedModel,
        verificationReport: report,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [...s.messages, aiMsg]
      } : s));

    } catch (err) {
      console.error(err);
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...s.messages, {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Error generating response from verification engine. Please check backend connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]
      } : s));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4.2rem)] w-full px-3 gap-3 py-2">
      
      {/* ChatGPT-Style Left History Sidebar */}
      <div className={`transition-all duration-300 flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden shrink-0 ${
        isSidebarOpen ? 'w-64 sm:w-72' : 'w-14'
      }`}>
        
        {/* Sidebar Header & New Chat Button */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
          {isSidebarOpen ? (
            <button
              onClick={handleNewChat}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          ) : (
            <button
              onClick={handleNewChat}
              className="p-2.5 rounded-xl bg-cyan-600 text-white mx-auto"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Sessions History List */}
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Recent Conversations ({sessions.length})
            </div>

            {sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`p-2.5 rounded-2xl cursor-pointer text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-cyan-950/80 text-white font-bold border border-cyan-800 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{s.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden glass-panel rounded-3xl border border-slate-800">
        
        {/* Top Info & API Key Bar */}
        <div className="py-3 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>LLM Engine: <strong className="text-cyan-300 font-semibold">{selectedModel}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 hidden sm:inline">Thread: <strong className="text-white">{activeSession?.title}</strong></span>
          </div>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKeyOverride ? 'API Key Set ✓' : 'Custom API Key'}</span>
          </button>
        </div>

        {showKeyInput && (
          <div className="p-3 m-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="password"
              value={apiKeyOverride}
              onChange={(e) => setApiKeyOverride(e.target.value)}
              placeholder="Enter custom API key override (optional)"
              className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-bold text-white"
            >
              Save
            </button>
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-cyan-500/20 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-3xl space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-br-none shadow-md'
                    : 'glass-panel text-slate-200 rounded-bl-none border border-slate-800'
                }`}>
                  {msg.sender === 'ai' && msg.model && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {msg.model}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* Verification Report Action Card */}
                {msg.sender === 'ai' && msg.verificationReport && (
                  <div className="p-4 rounded-2xl glass-panel-glow card-hover-effect border border-cyan-500/40 shadow-cyan-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-md ${
                        msg.verificationReport.overall_confidence_score > 85 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-emerald-glow'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {msg.verificationReport.overall_confidence_score > 85 ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white">Factuality Score:</span>
                          <span className="text-sm font-black text-cyan-400">
                            {msg.verificationReport.overall_confidence_score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {msg.verificationReport.extracted_claims.length} Claims Verified | NLI Entailment: {msg.verificationReport.radar_metrics.Faithfulness}%
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenReport(msg.verificationReport)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-cyan-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Inspect 12 Visual Analytics</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl text-xs text-cyan-400 font-semibold flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                Evaluating multi-turn context & running 9-Phase Verification...
              </div>
            </div>
          )}
        </div>

        {/* Sample Prompts (when chat thread is fresh) */}
        {activeMessages.length <= 1 && (
          <div className="px-4 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sp.prompt)}
                className="p-3 rounded-xl glass-panel text-left hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{sp.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{sp.prompt}</p>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="glass-panel p-2 rounded-2xl border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all flex items-center gap-2"
          >
            <textarea
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question or enter follow-up query..."
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
