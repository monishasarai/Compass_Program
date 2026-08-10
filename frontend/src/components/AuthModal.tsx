'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const payload = isSignUp 
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');

      if (isSignUp) {
        // Auto login after register
        const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        onLoginSuccess(loginData.user, loginData.token);
      } else {
        onLoginSuccess(data.user, data.token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'admin' | 'user') => {
    setLoading(true);
    setError('');
    const demoEmail = demoRole === 'admin' ? 'admin@valid8.ai' : 'sarah@enterprise.io';
    const demoPassword = demoRole === 'admin' ? 'AdminValid8@2026' : 'UserValid8@2026';

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = (fillRole: 'admin' | 'user') => {
    if (fillRole === 'admin') {
      setEmail('admin@valid8.ai');
      setPassword('AdminValid8@2026');
      setName('System Admin');
      setRole('admin');
      setAutoFillSuccess('Auto-filled Admin Credentials ✓');
    } else {
      setEmail('sarah@enterprise.io');
      setPassword('UserValid8@2026');
      setName('Sarah Connor');
      setRole('user');
      setAutoFillSuccess('Auto-filled Standard User Credentials ✓');
    }
    setTimeout(() => setAutoFillSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-md p-6 rounded-3xl relative border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-950 to-blue-950 text-cyan-400 border border-cyan-800/80 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {isSignUp ? 'Create Valid8 Account' : 'Sign In to Valid8'}
            </h2>
            <p className="text-xs text-slate-400">
              Role-Based Access Control & Real-Time Verification
            </p>
          </div>
        </div>

        {/* Automated Quick Access Buttons */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Automated 1-Click Instant Login
            </span>
            <span className="text-[10px] text-slate-400">Zero Typing</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2.5 px-3 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 text-xs font-bold text-indigo-200 border border-indigo-700/80 hover:border-indigo-500 shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>👑 Demo Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user')}
              className="py-2.5 px-3 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 text-xs font-bold text-cyan-200 border border-cyan-700/80 hover:border-cyan-500 shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>👤 Demo User</span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Or auto-fill form:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAutoFill('admin')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Fill Admin
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => handleAutoFill('user')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Fill User
              </button>
            </div>
          </div>
        </div>

        {autoFillSuccess && (
          <div className="mb-3 p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {autoFillSuccess}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monisha Sarai"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@valid8.ai"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'user'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'admin'
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
