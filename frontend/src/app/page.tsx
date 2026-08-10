'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';
import AdminDashboard from '@/components/AdminDashboard';
import ChatInterface from '@/components/ChatInterface';
import VerificationStudio from '@/components/VerificationStudio';

import UserProfileModal from '@/components/UserProfileModal';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'admin'>('landing');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('GPT-4o');
  
  // Active Verification Report for Modal
  const [activeReport, setActiveReport] = useState<any>(null);

  // Check saved session token on load
  useEffect(() => {
    const savedUser = localStorage.getItem('valid8_user');
    const savedToken = localStorage.getItem('valid8_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('valid8_user', JSON.stringify(userData));
    localStorage.setItem('valid8_token', userToken);
    setCurrentView('chat');
  };

  const handleUserUpdated = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('valid8_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('valid8_user');
    localStorage.removeItem('valid8_token');
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-radial-gradient text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Main View Router */}
      <main className="flex-1 relative">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (!user) setIsAuthOpen(true);
              else setCurrentView('chat');
            }}
          />
        )}

        {currentView === 'chat' && (
          <ChatInterface
            user={user}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onOpenReport={(report) => setActiveReport(report)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard user={user} token={token} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile & Password Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        token={token}
        onUserUpdated={handleUserUpdated}
      />

      {/* Verification Visual Analytics Studio Modal */}
      {activeReport && (
        <VerificationStudio
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
}
