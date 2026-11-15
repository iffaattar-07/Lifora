'use client';

import React from 'react';
import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { UpcomingDoseCard } from '@/components/dashboard/UpcomingDoseCard';
import { TodayMedicationSchedule } from '@/components/dashboard/TodayMedicationSchedule';
import { AdherenceOverview } from '@/components/dashboard/AdherenceOverview';
import { UpcomingAppointmentsCard } from '@/components/dashboard/UpcomingAppointmentsCard';
import { CareCircleQuickView } from '@/components/dashboard/CareCircleQuickView';
import { AssistantQuickInsight } from '@/components/dashboard/AssistantQuickInsight';
import { 
  Pill, 
  PhoneCall, 
  CalendarPlus, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export default function DashboardPage() {
  const { profile } = useCare();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Personalized Greeting with dynamic wellbeing tone */}
      <PersonalizedGreeting />

      {/* 2. Intelligent Care Assistant Contextual Daily Brief */}
      <AssistantQuickInsight />

      {/* 3. Next/Upcoming Critical Medication Dose Highlight */}
      <UpcomingDoseCard />

      {/* 4. Senior Quick Actions Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="/medications"
          className="bg-white hover:bg-sage-50/70 p-4 rounded-2xl border border-sage-200/80 shadow-soft-card flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Quick Action</p>
            <p className="text-sm font-bold text-stone-900">All Medications</p>
          </div>
        </a>

        <a
          href={`tel:${profile.emergencyContact.phone}`}
          className="bg-white hover:bg-rose-50/70 p-4 rounded-2xl border border-sage-200/80 shadow-soft-card flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">1-Click Call</p>
            <p className="text-sm font-bold text-stone-900">{profile.emergencyContact.name}</p>
          </div>
        </a>

        <a
          href="/appointments"
          className="bg-white hover:bg-sage-50/70 p-4 rounded-2xl border border-sage-200/80 shadow-soft-card flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Schedule</p>
            <p className="text-sm font-bold text-stone-900">Doctor Visits</p>
          </div>
        </a>

        <a
          href="/assistant"
          className="bg-white hover:bg-emerald-50/70 p-4 rounded-2xl border border-sage-200/80 shadow-soft-card flex items-center gap-3 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Ask Anything</p>
            <p className="text-sm font-bold text-stone-900">Care Assistant</p>
          </div>
        </a>
      </div>

      {/* 5. Core Dashboard Grid: Left Schedule, Right Analytics & Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Comprehensive Today Schedule */}
        <div className="lg:col-span-7 space-y-6">
          <TodayMedicationSchedule />
        </div>

        {/* Right Column: Adherence & Care Circle & Appointments */}
        <div className="lg:col-span-5 space-y-6">
          <AdherenceOverview />
          <UpcomingAppointmentsCard />
          <CareCircleQuickView />
        </div>
      </div>
    </div>
  );
}
