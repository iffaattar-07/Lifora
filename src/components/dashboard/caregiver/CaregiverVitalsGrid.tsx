'use client';

import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Award 
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverVitalsGrid() {
  const { adherenceStats, todaySchedule } = useCare();

  const totalDoses = todaySchedule.length;
  const takenDoses = todaySchedule.filter((d) => d.status === 'taken').length;
  const pendingDoses = todaySchedule.filter((d) => d.status === 'pending').length;
  const missedDoses = todaySchedule.filter((d) => d.status === 'missed').length;

  const nextPending = todaySchedule.find((d) => d.status === 'pending');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {/* 1. Medication Adherence */}
      <div className="bg-white p-5 rounded-3xl border border-sage-200/90 shadow-soft-card flex flex-col justify-between col-span-2 sm:col-span-1">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Adherence</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 font-serif">
              {adherenceStats.weeklyPercentage}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              +4% vs last wk
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">7-Day Rolling Adherence</p>
        </div>

        {/* Mini progress line */}
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-teal-700 h-full rounded-full transition-all duration-500"
            style={{ width: `${adherenceStats.weeklyPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Doses Taken */}
      <div className="bg-white p-5 rounded-3xl border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Taken Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-900 font-serif">
              {takenDoses}
            </span>
            <span className="text-stone-500 font-medium text-sm">/ {totalDoses} doses</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {takenDoses > 0 ? 'Confirmed with breakfast' : 'None logged yet'}
          </p>
        </div>

        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200 mt-3 block text-center">
          100% Morning Success
        </span>
      </div>

      {/* 3. Pending Doses */}
      <div className="bg-white p-5 rounded-3xl border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-amber-900 font-serif">
              {pendingDoses}
            </span>
            <span className="text-stone-500 font-medium text-sm">remaining</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Next: {nextPending ? nextPending.scheduledTime : 'None'}
          </p>
        </div>

        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 mt-3 block text-center">
          {nextPending ? `${nextPending.medicationName}` : 'All complete'}
        </span>
      </div>

      {/* 4. Missed Doses */}
      <div className="bg-white p-5 rounded-3xl border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Missed Doses</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${missedDoses > 0 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-500'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-serif ${missedDoses > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {missedDoses}
            </span>
            <span className="text-stone-500 font-medium text-sm">today</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {missedDoses === 0 ? 'Zero missed medication' : 'Escalation alert active'}
          </p>
        </div>

        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border mt-3 block text-center ${
          missedDoses === 0
            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
            : 'text-rose-800 bg-rose-50 border-rose-300'
        }`}>
          {missedDoses === 0 ? 'Perfect Schedule' : 'Requires Review'}
        </span>
      </div>

      {/* 5. Overall Care Status */}
      <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white p-5 rounded-3xl shadow-soft-card flex flex-col justify-between col-span-2 md:col-span-4 lg:col-span-1 border border-teal-800">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-teal-200">Overall Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-xl font-bold font-serif text-white mt-3">
            {adherenceStats.consecutiveStreakDays} Day Streak
          </p>
          <p className="text-xs text-teal-200/90 mt-1">
            Consistent routine without hospital readmissions.
          </p>
        </div>

        <div className="text-[11px] text-teal-300 bg-teal-950/70 p-2 rounded-xl border border-teal-700/60 mt-3 text-center font-bold">
          Nurse Elena Verified
        </div>
      </div>
    </div>
  );
}
