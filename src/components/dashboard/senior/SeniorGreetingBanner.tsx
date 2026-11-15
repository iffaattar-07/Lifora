'use client';

import React from 'react';
import { Calendar, Sun, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorGreetingBanner() {
  const { profile, todaySchedule } = useCare();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const nextPendingDose = todaySchedule.find((d) => d.status === 'pending');
  const allTaken = todaySchedule.length > 0 && todaySchedule.every((d) => d.status === 'taken');

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-9 shadow-elevated relative overflow-hidden border-2 border-teal-700/50">
      {/* Background soft glow for calm atmosphere */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-88 h-88 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          {/* Reassuring Date & Weather Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-teal-950/60 border border-teal-700/70 text-teal-200 text-xs sm:text-sm font-medium">
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">{todayFormatted}</span>
            <span className="text-teal-400">&bull;</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              Portland, OR (58°F &bull; Calm day)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white leading-tight">
            {getGreeting()},{' '}
            <span className="text-emerald-300 underline decoration-teal-600/60 decoration-wavy underline-offset-8">
              {profile.preferredName}
            </span>
          </h1>

          <p className="text-teal-100 text-base sm:text-lg max-w-2xl leading-relaxed pt-1">
            {allTaken ? (
              <span className="text-emerald-200 font-medium">
                You have taken all your scheduled pills for today. Everything is on track—relax and enjoy your afternoon!
              </span>
            ) : nextPendingDose ? (
              <>
                You are doing wonderful. Your next medication is{' '}
                <strong className="text-white underline decoration-emerald-400 decoration-2">
                  {nextPendingDose.medicationName} ({nextPendingDose.dosage})
                </strong>{' '}
                scheduled for <strong>{nextPendingDose.scheduledTime}</strong>.
              </>
            ) : (
              'Your care circle is connected and watching over your comfort today.'
            )}
          </p>
        </div>

        {/* Reassurance peace-of-mind pill */}
        <div className="bg-teal-950/70 p-5 rounded-2xl border border-teal-700/60 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-teal-300">Care Circle Active</p>
              <p className="text-base font-bold text-white">Sarah &amp; Elena Connected</p>
            </div>
          </div>
          <div className="text-xs text-teal-200/90 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Emergency alerts armed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
