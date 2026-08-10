'use client';

import React from 'react';
import { ShieldCheck, Sparkles, UserCheck, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'chat' | 'admin';
  setCurrentView: (view: 'landing' | 'chat' | 'admin') => void;
  user: any;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onLogout: () => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
}

export default function Navbar({
  currentView,
  setCurrentView,
  user,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  selectedModel,
  setSelectedModel
}: NavbarProps) {
  const models = ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "DeepSeek-V3", "DeepSeek-R1", "Llama 3.3 70B", "Mistral Large", "Grok-2"];

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Valid<span className="text-cyan-400">8</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Fact Verification & Hallucination Guard</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'landing' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Platform Scope
          </button>

          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setCurrentView('chat');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'chat' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Valid8 Studio (Chat)
          </button>

          {user && user.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'admin' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Model Selector dropdown (visible in Chat view) */}
          {currentView === 'chat' && (
            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Active Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                {models.map(m => (
                  <option key={m} value={m} className="bg-dark-900 text-slate-200">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                title="View Account Details & Change Password"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{user.name}</span>
                  <span className="text-[9px] text-cyan-400 font-semibold uppercase">{user.role}</span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
