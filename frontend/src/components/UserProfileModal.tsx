'use client';

import React, { useState } from 'react';
import { X, User, Lock, Mail, Shield, CheckCircle2, AlertCircle, Key, Activity, Layers, Calendar, Save } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  token: string;
  onUserUpdated: (updatedUser: any) => void;
}

export default function UserProfileModal({ isOpen, onClose, user, token, onUserUpdated }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');

      onUserUpdated(data);
      setProfileMessage('Profile updated successfully! ✓');
      setTimeout(() => setProfileMessage(''), 3500);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');

      setPasswordMessage('Password updated successfully! ✓');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 4000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-lg p-6 rounded-3xl relative border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">{user.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                user.role === 'admin' 
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-700'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Usage
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Security & Password
          </button>
        </div>

        {/* Tab 1: Profile & Usage Stats */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-slate-400 opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              {profileMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>

            {/* Usage Stats Overview */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Account Statistics & Metering
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Verifications</span>
                  </div>
                  <span className="text-xl font-black text-white">
                    {user.totalVerifications || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Tokens Processed</span>
                  </div>
                  <span className="text-xl font-black text-white">
                    {(user.tokensUsed || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            {passwordMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
