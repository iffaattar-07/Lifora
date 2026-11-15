'use client';

import React from 'react';
import { SeniorGreetingBanner } from './SeniorGreetingBanner';
import { SeniorNextDoseHero } from './SeniorNextDoseHero';
import { SeniorTodaySchedule } from './SeniorTodaySchedule';
import { SeniorAppointmentsCard } from './SeniorAppointmentsCard';
import { SeniorCareCircleWidget } from './SeniorCareCircleWidget';
import { SeniorAssistantPrompt } from './SeniorAssistantPrompt';
import { PhoneCall, Pill, Heart, Sparkles, Calendar } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorDashboardView() {
  const { profile, triggerEmergencyAlert } = useCare();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Personalized Greeting with warm tone & weather */}
      <SeniorGreetingBanner />

      {/* 2. Unmissable Next Dose Hero with Large "I Took This" Button */}
      <SeniorNextDoseHero />

      {/* 3. Senior 1-Tap Big Access Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <a
          href={`tel:${profile.emergencyContact.phone}`}
          className="bg-white hover:bg-rose-50/70 p-4 sm:p-5 rounded-3xl border-2 border-sage-200 shadow-soft-card flex items-center gap-3.5 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-stone-500">Call Daughter</p>
            <p className="text-base font-extrabold text-stone-900">{profile.emergencyContact.name.split(' ')[0]}</p>
          </div>
        </a>

        <a
          href="/medications"
          className="bg-white hover:bg-sage-50/70 p-4 sm:p-5 rounded-3xl border-2 border-sage-200 shadow-soft-card flex items-center gap-3.5 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-stone-500">My Medicine</p>
            <p className="text-base font-extrabold text-stone-900">All Prescriptions</p>
          </div>
        </a>

        <a
          href="/appointments"
          className="bg-white hover:bg-sage-50/70 p-4 sm:p-5 rounded-3xl border-2 border-sage-200 shadow-soft-card flex items-center gap-3.5 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-stone-500">Doctor Visits</p>
            <p className="text-base font-extrabold text-stone-900">Appointments</p>
          </div>
        </a>

        <button
          onClick={() => triggerEmergencyAlert('Direct SOS Button triggered from Senior Dashboard')}
          className="bg-rose-50 hover:bg-rose-100/80 p-4 sm:p-5 rounded-3xl border-2 border-rose-300 shadow-soft-card flex items-center gap-3.5 transition group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-extrabold text-rose-700">Need Help?</p>
            <p className="text-base font-extrabold text-rose-950">Emergency SOS</p>
          </div>
        </button>
      </div>

      {/* 4. Core Senior Schedule & Reassurance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Today's Full Schedule */}
        <div className="lg:col-span-7 space-y-6">
          <SeniorTodaySchedule />
        </div>

        {/* Right Column: Doctor Visit & Care Circle */}
        <div className="lg:col-span-5 space-y-6">
          <SeniorAppointmentsCard />
          <SeniorCareCircleWidget />
        </div>
      </div>

      {/* 5. Context-Aware Assistant Prompt Bar */}
      <SeniorAssistantPrompt />
    </div>
  );
}
