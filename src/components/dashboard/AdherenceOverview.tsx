'use client';

import React from 'react';
import { ShieldCheck, Award, TrendingUp, Calendar, Info } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function AdherenceOverview() {
  const { adherenceStats, todaySchedule } = useCare();

  const strokeDashoffset = 283 - (283 * adherenceStats.todayPercentage) / 100;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Medication Adherence</h3>
            <p className="text-xs text-stone-500">Real-time tracking for peace of mind</p>
          </div>
          <span className="p-2 bg-sage-100 text-teal-800 rounded-xl">
            <Award className="w-5 h-5" />
          </span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="my-6 flex items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-stone-100"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Foreground progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-teal-700 transition-all duration-1000 ease-out"
                strokeWidth="9"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-stone-900 font-serif">
                {adherenceStats.todayPercentage}%
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 mt-0.5">
                Today&apos;s Goal
              </span>
            </div>
          </div>
        </div>

        {/* Adherence metrics breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-sage-50/70 p-3.5 rounded-2xl border border-sage-200/70">
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>7-Day Average</span>
            </div>
            <p className="text-xl font-bold text-stone-900 mt-1 font-serif">
              {adherenceStats.weeklyPercentage}%
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-1.5 py-0.5 rounded">
              +4% this week
            </span>
          </div>

          <div className="bg-sage-50/70 p-3.5 rounded-2xl border border-sage-200/70">
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Streak</span>
            </div>
            <p className="text-xl font-bold text-stone-900 mt-1 font-serif">
              {adherenceStats.consecutiveStreakDays} Days
            </p>
            <span className="text-[10px] text-teal-800 font-semibold bg-teal-100/80 px-1.5 py-0.5 rounded">
              Zero Misses
            </span>
          </div>
        </div>
      </div>

      {/* Reassuring Note */}
      <div className="mt-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          High adherence lowers hospital readmission risk by over 45%. Sarah &amp; David receive peaceful daily summaries.
        </p>
      </div>
    </div>
  );
}
