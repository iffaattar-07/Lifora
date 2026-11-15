'use client';

import React from 'react';
import { useCare } from '@/context/CareContext';
import { SeniorDashboardView } from '@/components/dashboard/senior/SeniorDashboardView';
import { CaregiverDashboardView } from '@/components/dashboard/caregiver/CaregiverDashboardView';
import { LandingPage } from '@/components/landing/LandingPage';
import { Sparkles, Home } from 'lucide-react';

export default function RootHomePage() {
  const { activeRole, isLoggedIn, logout } = useCare();

  if (!isLoggedIn) {
    return <LandingPage />;
  }

  return (
    <div className="transition-all duration-300 relative">
      {/* Return to Landing Page Quick Banner for Demo Evaluators */}
      <div className="mb-4 bg-teal-50 border border-teal-200/80 rounded-xl px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-teal-900 gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>
            <strong>Active Demo Session:</strong> Viewing as{' '}
            <span className="font-semibold">{activeRole === 'elderly' ? 'Margaret Vance (Senior View)' : 'Sarah Vance (Caregiver View)'}</span>.
          </span>
        </div>
        <button
          onClick={logout}
          className="self-start sm:self-auto text-teal-800 hover:text-teal-950 font-bold underline underline-offset-2 flex items-center gap-1 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Landing Page &amp; Sign Out</span>
        </button>
      </div>

      {activeRole === 'elderly' ? (
        <SeniorDashboardView />
      ) : (
        <CaregiverDashboardView />
      )}
    </div>
  );
}
