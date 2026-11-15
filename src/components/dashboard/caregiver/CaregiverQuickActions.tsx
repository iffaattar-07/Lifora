'use client';

import React from 'react';
import { 
  Plus, 
  CalendarPlus, 
  PhoneCall, 
  History, 
  Pill, 
  MessageSquareHeart 
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverQuickActions() {
  const { profile } = useCare();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {/* 1. Add Medication */}
      <a
        href="/medications"
        className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-sage-200 shadow-soft-card flex items-center gap-3 transition group"
      >
        <div className="w-11 h-11 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase font-bold text-stone-400">Prescriptions</p>
          <p className="text-sm font-bold text-stone-900">Add Medication</p>
        </div>
      </a>

      {/* 2. Schedule Appointment */}
      <a
        href="/appointments"
        className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-sage-200 shadow-soft-card flex items-center gap-3 transition group"
      >
        <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <CalendarPlus className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase font-bold text-stone-400">Coordination</p>
          <p className="text-sm font-bold text-stone-900">Schedule Visit</p>
        </div>
      </a>

      {/* 3. Contact Senior */}
      <a
        href={`tel:${profile.phone || '(503) 555-0192'}`}
        className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-sage-200 shadow-soft-card flex items-center gap-3 transition group"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <PhoneCall className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase font-bold text-stone-400">Direct Check-in</p>
          <p className="text-sm font-bold text-stone-900">Call {profile.preferredName}</p>
        </div>
      </a>

      {/* 4. View Medication History / Audit */}
      <a
        href="/medications"
        className="bg-white hover:bg-sage-50/80 p-4 rounded-2xl border border-sage-200 shadow-soft-card flex items-center gap-3 transition group"
      >
        <div className="w-11 h-11 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <History className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase font-bold text-stone-400">Audit Log</p>
          <p className="text-sm font-bold text-stone-900">Medication History</p>
        </div>
      </a>
    </div>
  );
}
