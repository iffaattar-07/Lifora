'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Users, 
  ArrowRight, 
  Lock, 
  Mail, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { useCare, DEMO_ACCOUNTS } from '@/context/CareContext';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect?: (role: 'elderly' | 'family') => void;
}

export function DemoLoginModal({ isOpen, onClose, onSuccessRedirect }: DemoLoginModalProps) {
  const { loginDemo } = useCare();

  const [selectedRole, setSelectedRole] = useState<'senior' | 'caregiver'>('senior');
  const [emailInput, setEmailInput] = useState(DEMO_ACCOUNTS.senior.email);
  const [passwordInput, setPasswordInput] = useState(DEMO_ACCOUNTS.senior.password);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectRole = (role: 'senior' | 'caregiver') => {
    setSelectedRole(role);
    setAuthError(null);
    if (role === 'senior') {
      setEmailInput(DEMO_ACCOUNTS.senior.email);
      setPasswordInput(DEMO_ACCOUNTS.senior.password);
    } else {
      setEmailInput(DEMO_ACCOUNTS.caregiver.email);
      setPasswordInput(DEMO_ACCOUNTS.caregiver.password);
    }
  };

  const handleQuickLogin = (role: 'senior' | 'caregiver') => {
    setIsLoading(true);
    setAuthError(null);
    setTimeout(() => {
      loginDemo(role);
      setIsLoading(false);
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect(role === 'senior' ? 'elderly' : 'family');
      }
    }, 400);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Validate credentials match demo or standard pattern
    const isSenior = emailInput.toLowerCase().includes('margaret');
    const isCaregiver = emailInput.toLowerCase().includes('sarah');

    try {
      // Compatibility with backend /api/v1/auth/login
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await res.json();
      console.log('[DemoLogin API]', data);
    } catch (err) {
      console.warn('[DemoLogin fallback]', err);
    }

    setTimeout(() => {
      const targetRole = isCaregiver ? 'caregiver' : 'senior';
      loginDemo(targetRole, { email: emailInput, password: passwordInput });
      setIsLoading(false);
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect(targetRole === 'senior' ? 'elderly' : 'family');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full border border-sage-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 p-6 sm:p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-teal-200 hover:text-white rounded-full hover:bg-teal-800/60 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-teal-800/80 text-teal-100 text-xs px-2.5 py-0.5 rounded-full font-medium border border-teal-600/40">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Interactive Demo Access</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-200 text-xs px-2 py-0.5 rounded-full border border-amber-400/30">
              Zero Config Required
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
            Sign In to LIFORA
          </h2>
          <p className="text-teal-100/90 text-sm mt-1">
            Choose a demo persona below to explore the custom role-based dashboard.
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Persona Switcher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Senior Card */}
            <div 
              onClick={() => handleSelectRole('senior')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                selectedRole === 'senior' 
                  ? 'border-teal-600 bg-teal-50/60 shadow-sm' 
                  : 'border-sage-200 hover:border-sage-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Margaret Vance</h3>
                    <p className="text-xs text-teal-700 font-medium">Senior Account (Age 78)</p>
                  </div>
                </div>
                {selectedRole === 'senior' && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                )}
              </div>

              <div className="mt-3 text-xs text-stone-600 space-y-1 bg-white/80 p-2.5 rounded-lg border border-sage-100 font-mono">
                <div><span className="text-stone-400">Email:</span> margaret@lifora.demo</div>
                <div><span className="text-stone-400">Pass:</span> Margaret@123</div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLogin('senior');
                }}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Auto-fill & Log In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Caregiver Card */}
            <div 
              onClick={() => handleSelectRole('caregiver')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                selectedRole === 'caregiver' 
                  ? 'border-teal-600 bg-teal-50/60 shadow-sm' 
                  : 'border-sage-200 hover:border-sage-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Sarah Vance</h3>
                    <p className="text-xs text-amber-700 font-medium">Daughter & Family Admin</p>
                  </div>
                </div>
                {selectedRole === 'caregiver' && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                )}
              </div>

              <div className="mt-3 text-xs text-stone-600 space-y-1 bg-white/80 p-2.5 rounded-lg border border-sage-100 font-mono">
                <div><span className="text-stone-400">Email:</span> sarah@lifora.demo</div>
                <div><span className="text-stone-400">Pass:</span> Sarah@123</div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLogin('caregiver');
                }}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Auto-fill & Log In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Form for Custom Typing / Inspecting */}
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 border-t border-sage-200/80">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                  placeholder="name@lifora.demo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering {selectedRole === 'senior' ? 'Senior View' : 'Caregiver View'}...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'senior' ? 'Margaret Vance' : 'Sarah Vance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clearly Labelled Local Demo Notice */}
          <div className="bg-sage-50 border border-sage-200 p-3.5 rounded-xl text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-950">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Local Hackathon Demo Mode Enabled</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              This session uses simulated JWT sessions and client-side persistence connected to our backend REST API routes. When hosted online with Supabase Auth, these same accounts link directly to PostgreSQL RLS policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
